/*
Store :3

Looked at
- ReceiptScan.jsx (can pass items with quantity like "200g" or "10 Slices")
- InventoryPage.jsx (expects items with { id, name, category, quantity:number, unit:string })
- Household.jsx (can manage claimedBy arrays, activity logs if you wire them later)
- ItemCard.jsx (supports optional fields: icon, className, expiry, recipes, claimedBy)

How to use:
  import { useStore, store } from "./store.jsx";

  export default function App() {
    const inventory = useStore(s => s.items);

    const handleAddItem = (data) => {
      // Accepts single item or an array
      // Examples:
      //  - { id, name, category, quantity: "200g" } (ReceiptScan)
      //  - { id, name, category, quantity: 1, unit: "L" } (InventoryPage)
      store.actions.items.addOrMerge(data);
    };

    const handleUpdateQuantity = (id, amount) => {
      // Subtracts amount and removes the item if quantity reaches 0
      store.actions.items.updateQuantity(id, amount);
    };

    const handleLogAction = (memberId, action, itemName, quantity) => {
      store.actions.logs.add({ memberId, action, itemName, quantity });
    };

    return null; // render your Routes, pass inventory and handlers to pages as you already do
  }

Notes:
- Item shape in store:
    {
      id, name, category,
      quantity: number,          // for math and charts
      unit: string,              // "g", "L", "pcs", "Slices", etc.
      icon?: string,             // ItemCard compatible
      className?: string,        // ItemCard compatible
      expiry?: string,           // ISO date string, ItemCard compatible
      recipes?: string[],        // ItemCard compatible
      claimedBy?: string[]       // Household page uses array of names
    }
- addOrMerge() merges by item name (case-insensitive), adds quantities if names match.
- If input.quantity is a string (e.g., "200g", "10 Slices", "1"), parsed -> quantity:number + unit:string.
- store is under localStorage key: "household-food:store".
*/

import { useSyncExternalStore } from "react";

const KEY = "household-food:store";

const initialState = {
  items: [],
  members: [],
  usageLogs: []
};

// persistence + subscriptions
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : initialState;
  } catch {
    return initialState;
  }
}
let state = load();
const listeners = new Set();
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function emit() { for (const l of listeners) l(state); }
function setState(updater) { state = typeof updater === "function" ? updater(state) : updater; save(); emit(); }
function getState() { return state; }
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }

// helpers
function rid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

// Parse "200g", "10 Slices", "1", "1 pcs", etc.
function parseQtyUnit(q) {
  if (typeof q === "number") return { quantity: q, unit: "pcs" };
  if (typeof q !== "string") return { quantity: 0, unit: "pcs" };

  // e.g., "200g", "10 Slices", "1", "1 pcs"
  const m = q.trim().match(/^(\d+(?:\.\d+)?)(?:\s*([A-Za-z][A-Za-z\s]*))?$/);
  if (!m) return { quantity: 0, unit: "pcs" };

  const quantity = Number(m[1]);
  let unit = (m[2]?.trim() || "pcs");

  // normalise common units ?
  const norm = unit.toLowerCase();
  if (["g", "gram", "grams"].includes(norm)) unit = "g";
  else if (["kg", "kilogram", "kilograms"].includes(norm)) unit = "kg";
  else if (["l", "liter", "liters"].includes(norm)) unit = "L";
  else if (["ml", "milliliter", "milliliters"].includes(norm)) unit = "mL";
  else if (["slice", "slices"].includes(norm)) unit = "Slices";
  else if (["pc", "pcs", "piece", "pieces"].includes(norm)) unit = "pcs";

  // Capitalise first letter of words
  if (!["g", "kg", "L", "mL", "pcs"].includes(unit) && unit.length > 1) {
    unit = unit[0].toUpperCase() + unit.slice(1).toLowerCase();
  }

  return { quantity, unit };
}

function normaliseInputItem(input) {
  if (!input || !input.name) throw new Error("Item requires a 'name'");

  const base = {
    id: input.id ?? rid("i"),
    name: input.name,
    category: input.category || "Other",
    icon: input.icon ?? undefined,
    className: input.className ?? undefined,
    expiry: input.expiry ?? undefined,
    recipes: Array.isArray(input.recipes) ? input.recipes : undefined,
    claimedBy: Array.isArray(input.claimedBy)
      ? input.claimedBy
      : (typeof input.claimedBy === "string" && input.claimedBy.trim().length
          ? [input.claimedBy.trim()]
          : undefined)
  };

  if (typeof input.quantity === "string") {
    const { quantity, unit } = parseQtyUnit(input.quantity);
    return { ...base, quantity, unit: input.unit || unit };
  }

  const unit = input.unit || "pcs";
  const quantity = Number(input.quantity ?? 0);
  return { ...base, quantity, unit };
}

function mergeByName(existingItem, incomingItem) {
  // Keep existing id, unit, category, and metadata & add quantities
  return {
    ...existingItem,
    quantity: (existingItem.quantity ?? 0) + (incomingItem.quantity ?? 0)
  };
}

// actions
const actions = {
  items: {
    // Add or merge a single item or an array of items (merges by name)
    addOrMerge(data) {
    // 🧠 helper to add default expiry if missing
    const addExpiry = (item) => {
      if (item.expiry) return item; // already has expiry

      const defaultDays = {
        milk: 7,
        broccoli: 5,
        chicken: 3,
        apple: 14,
        lettuce: 5,
        bread: 5,
        cheese: 10,
        yogurt: 10,
        meat: 3,
        fish: 2,
        eggs: 14,
      };

      const days = defaultDays[item.name?.toLowerCase()] || 7; // fallback
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      return { ...item, expiry: expiryDate.toISOString().split("T")[0] };
    };

    // ✅ If adding multiple items at once (array)
    if (Array.isArray(data)) {
      setState((s) => {
        let next = [...s.items];
        data.forEach((raw) => {
          const item = addExpiry(normaliseInputItem(raw));
          const idx = next.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase());
          if (idx >= 0) next[idx] = mergeByName(next[idx], item);
          else next.push(item);
        });
        return { ...s, items: next };
      });
      return;
    }

    // ✅ Single item version
    const item = addExpiry(normaliseInputItem(data));
    setState((s) => {
      const idx = s.items.findIndex((i) => i.name.toLowerCase() === item.name.toLowerCase());
      if (idx >= 0) {
        const merged = mergeByName(s.items[idx], item);
        const items = [...s.items];
        items[idx] = merged;
        return { ...s, items };
      }
      return { ...s, items: [...s.items, item] };
    });
  },


    // Subtract 'amount' from quantity, remove item if it reaches 0
    updateQuantity(id, amount) {
      const delta = Number(amount || 0);
      setState((s) => {
        const items = s.items
          .map((it) =>
            it.id === id
              ? { ...it, quantity: Math.max(0, (it.quantity ?? 0) - delta) }
              : it
          )
          .filter((it) => (it.quantity ?? 0) > 0);
        return { ...s, items };
      });
    },

    // Set absolute quantity, remove item if 0
    setQuantity(id, quantity) {
      const qty = Math.max(0, Number(quantity || 0));
      setState((s) => {
        const items = s.items
          .map((it) => (it.id === id ? { ...it, quantity: qty } : it))
          .filter((it) => (it.quantity ?? 0) > 0);
        return { ...s, items };
      });
    },

    remove(id) {
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
    },

    // Convenience: remove by name
    removeByName(name) {
      setState((s) => ({
        ...s,
        items: s.items.filter((it) => it.name.toLowerCase() !== String(name).toLowerCase())
      }));
    },

    // Convenience: claim/unclaim an item by name for a user display name (for Household.jsx)
    setClaimedByName(name, userName, claim = true) {
      setState((s) => {
        const items = s.items.map((it) => {
          if (it.name.toLowerCase() !== String(name).toLowerCase()) return it;
          const current = Array.isArray(it.claimedBy) ? it.claimedBy : [];
          const exists = current.includes(userName);
          if (claim && !exists) return { ...it, claimedBy: [...current, userName] };
          if (!claim && exists) return { ...it, claimedBy: current.filter((u) => u !== userName) };
          return it;
        });
        return { ...s, items };
      });
    },

    all() {
      return getState().items;
    }
  },

  members: {
    add(member_name) {
      setState((s) => {
        const nextId = (s.members.reduce((m, x) => Math.max(m, x.member_id || 0), 0) || 0) + 1;
        return { ...s, members: [...s.members, { member_id: nextId, member_name }] };
      });
    },
    remove(member_id) {
      setState((s) => ({ ...s, members: s.members.filter((m) => m.member_id !== member_id) }));
    },
    all() {
      return getState().members;
    }
  },

  logs: {
    add({ memberId, action, itemName, quantity }) {
      setState((s) => ({
        ...s,
        usageLogs: [
          ...s.usageLogs,
          {
            memberId,
            action,
            itemName,
            quantity,
            timestamp: new Date().toISOString()
          }
        ]
      }));
    },
    all() {
      return getState().usageLogs;
    }
  },

  reset(newState = initialState) {
    setState(newState);
  }
};

// public API + hooks
export const store = { getState, setState, subscribe, actions };

export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(getState()));
}

export const useItems = () => useStore((s) => s.items);
export const useMembers = () => useStore((s) => s.members);
export const useUsageLogs = () => useStore((s) => s.usageLogs);