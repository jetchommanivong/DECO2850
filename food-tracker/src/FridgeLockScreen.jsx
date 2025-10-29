import React, { useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { useItems, store } from "./store";
import styles from "./InventoryPageStyles";

// ✅ Local fallback icons (if item.icon not provided)
import MilkIcon from "./assets/Items/Milk.png";
import BroccoliIcon from "./assets/Items/Broccoli.png";
import AppleIcon from "./assets/Items/Apple.png";

const fallbackIcons = {
  milk: MilkIcon,
  broccoli: BroccoliIcon,
  apple: AppleIcon,
};

export default function FridgeLockScreen() {
  const items = useItems(); // 🔥 Pull from store
  const removeItem = (id) => store.actions.items.remove(id);

  // 🧮 Calculate days left
  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null; // No expiry info
    const expiry = new Date(expiryDate);
    if (isNaN(expiry)) return null;
    const today = new Date();
    // normalize times to avoid partial-day issues
    const diffTime = expiry.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 🎨 Color logic based on urgency
  const getExpiryColor = (daysLeft) => {
    if (daysLeft == null) return "#43A047"; // green (no expiry)
    if (daysLeft <= 0) return "#C62828"; // red
    if (daysLeft <= 1) return "#E65100"; // dark orange
    if (daysLeft <= 3) return "#FFB300"; // amber
    return "#43A047"; // green
  };

  // 🗂️ Group items by expiry proximity
  const groupedItems = useMemo(() => {
    const groups = { Today: [], "This Week": [], "Next Week": [], "Later / No Expiry": [] };
    items.forEach((item) => {
      const daysLeft = getDaysLeft(item.expiry);
      if (daysLeft == null) {
        groups["Later / No Expiry"].push(item);
        return;
      }
      if (daysLeft <= 0) groups.Today.push(item);
      else if (daysLeft <= 7) groups["This Week"].push(item);
      else if (daysLeft <= 14) groups["Next Week"].push(item);
      else groups["Later / No Expiry"].push(item);
    });
    return groups;
  }, [items]);

  // ⚠️ Status bar (how many items expiring soon)
  const urgentCount = items.filter((item) => {
    const d = getDaysLeft(item.expiry);
    return d != null && d <= 3;
  }).length;

  // get screen width so bar can be ~80% of available width
  const { width: screenWidth } = useWindowDimensions();
  const BAR_CONTAINER_WIDTH = Math.round(screenWidth * 0.8); // ~80% of screen
  const fillPercent = Math.round((urgentCount / Math.max(items.length, 1)) * 100);

  const barColor =
    urgentCount / Math.max(items.length, 1) > 0.66
      ? "#C62828"
      : urgentCount / Math.max(items.length, 1) > 0.33
      ? "#FB8C00"
      : "#43A047";

  return (
    <ScrollView contentContainerStyle={styles.inventoryPage}>
      <View style={styles.header}>
        <Text style={styles.pageHeader}>Expiring Items</Text>
      </View>
      <Text style={{ color: "#666", marginTop: 4 }}>Keep an eye on soon-to-expire food</Text>

      {/* Compact status bar: centered and ~80% of screen width */}
      <View style={{ alignItems: "center", marginTop: 14, marginBottom: 18 }}>
        <View
          style={{
            width: BAR_CONTAINER_WIDTH,
            height: 16,
            backgroundColor: "#eee",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <View style={{ width: `${fillPercent}%`, height: "100%", backgroundColor: barColor }} />
        </View>

        <Text style={{ marginTop: 8, color: "#555", fontSize: 13 }}>
          {urgentCount} item{urgentCount !== 1 ? "s" : ""} expiring within 3 days
        </Text>
      </View>

      {/* Grouped items rendered using the same item styling as InventoryPage */}
      <View style={styles.itemsListSection}>
        {Object.entries(groupedItems).map(([groupName, list]) =>
          list.length > 0 ? (
            <View key={groupName} style={{ marginBottom: 18, paddingHorizontal: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{groupName}</Text>

              {list
                .sort((a, b) => {
                  // ensure consistent ordering: soonest expiry first, no-expiry last
                  const aDays = getDaysLeft(a.expiry);
                  const bDays = getDaysLeft(b.expiry);
                  if (aDays == null && bDays == null) return a.name.localeCompare(b.name);
                  if (aDays == null) return 1;
                  if (bDays == null) return -1;
                  return aDays - bDays;
                })
                .map((item) => {
                  const daysLeft = getDaysLeft(item.expiry);
                  const color = getExpiryColor(daysLeft);

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
                      ]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                        <Image
                          source={item.icon || fallbackIcons[item.name?.toLowerCase()] || AppleIcon}
                          style={{ width: 44, height: 44, borderRadius: 8, marginRight: 12 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={{ color: "#666", fontSize: 13 }}>
                            {item.quantity} {item.unit}
                          </Text>
                          <Text style={[styles.expiryText || { fontSize: 12 }, { color, marginTop: 4 }]}>
                            {daysLeft == null
                              ? "No expiry"
                              : daysLeft <= 0
                              ? "Expired"
                              : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 12 }}>
                        <Text style={{ color: "#C62828", fontWeight: "700" }}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          ) : null
        )}
      </View>

      {items.length === 0 && (
        <View style={{ padding: 30 }}>
          <Text style={{ color: "#777", textAlign: "center" }}>No items in your fridge yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
