import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Layout from "./Layout";

// Screens
import FridgeLockScreen from "./FridgeLockScreen";
import RecipePage from "./RecipePage";
import InventoryPage from "./InventoryPage";
import ReceiptScan from "./ReceiptScan";
import TempItemPhoto from "./TempItemPhoto";
import Household from "./Household";

const Stack = createNativeStackNavigator();

export default function App() {
  const [inventory, setInventory] = useState([
    { id: "x1", name: "Milk", category: "Dairy", quantity: 1, unit: "carton" },
    { id: "x2", name: "Chicken Breast", category: "Meats", quantity: 1000, unit: "g" },
    { id: "x3", name: "Broccoli", category: "Vegetables", quantity: 2, unit: "pieces" },
    { id: "x4", name: "Tomato", category: "Fruits", quantity: 1, unit: "pieces" },
    { id: "x5", name: "Lettuce", category: "Vegetables", quantity: 1, unit: "pieces" },
  ]);

  const [usageLogs, setUsageLogs] = useState([]);

  // Add new items or merge if existing
  const handleAddItem = (data) => {
    setInventory((prev) => {
      if (Array.isArray(data)) return data;

      const existing = prev.find(
        (i) => i.name.toLowerCase() === data.name.toLowerCase()
      );

      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + data.quantity }
            : i
        );
      }
      return [...prev, data];
    });
  };

  const handleUpdateQuantity = (id, amount) => {
    setInventory((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity - amount, 0) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleLogAction = (memberId, action, itemName, quantity) => {
    setUsageLogs((prev) => [
      ...prev,
      { memberId, action, itemName, quantity, timestamp: new Date().toISOString() },
    ]);
  };

  const handleTranscript = async (text) => {
    console.log("🎤 Transcript:", text);

    try {
      const response = await fetch("http://localhost:4000/api/parse-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: text,
          selectedMemberId: "user1",
          inventory: inventory.map((i) => ({
            item_id: i.id,
            item_name: i.name,
          })),
          membersItems: [],
          householdMembers: [],
        }),
      });

      const result = await response.json();
      console.log("📥 Backend parsed:", result);

      if (result?.data) {
        result.data.forEach((entry) => {
          if (entry.action === "remove") {
            const match = inventory.find(
              (i) => i.name.toLowerCase() === entry.itemName.toLowerCase()
            );
            if (match) {
              handleUpdateQuantity(match.id, entry.quantity);
              handleLogAction("user1", "remove", entry.itemName, entry.quantity);
            }
          } else if (entry.action === "add") {
            const existing = inventory.find(
              (i) => i.name.toLowerCase() === entry.itemName.toLowerCase()
            );
            if (existing) {
              handleAddItem({
                ...existing,
                quantity: existing.quantity + entry.quantity,
              });
            } else {
              const newItem = {
                id: Date.now().toString(),
                name:
                  entry.itemName.charAt(0).toUpperCase() +
                  entry.itemName.slice(1).toLowerCase(),
                category: entry.category || "Other",
                quantity: entry.quantity,
                unit: entry.unit || "pcs",
              };
              handleAddItem(newItem);
            }
            handleLogAction("user1", "add", entry.itemName, entry.quantity);
          }
        });
      }
    } catch (err) {
      console.error("❌ Error sending transcript:", err);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="FridgeLockScreen"
          children={() => (
            <Layout>
              <FridgeLockScreen />
            </Layout>
          )}
        />
        <Stack.Screen
          name="RecipePage"
          children={() => (
            <Layout>
              <RecipePage />
            </Layout>
          )}
        />
        <Stack.Screen
          name="InventoryPage"
          children={() => (
            <Layout>
              <InventoryPage
                items={inventory}
                onUpdateQuantity={handleUpdateQuantity}
                onAddItem={handleAddItem}
                onLogAction={handleLogAction}
                onTranscript={handleTranscript}
              />
            </Layout>
          )}
        />
        <Stack.Screen
          name="ReceiptScan"
          children={() => (
            <Layout>
              <ReceiptScan onAddItem={handleAddItem} />
            </Layout>
          )}
        />
        <Stack.Screen
          name="TempItemPhoto"
          children={() => (
            <Layout>
              <TempItemPhoto
                inventory={inventory}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </Layout>
          )}
        />
        <Stack.Screen
          name="Household"
          children={() => (
            <Layout>
              <Household />
            </Layout>
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
