import React, { useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useItems, store } from "./store";

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
    const diffTime = expiry - today;
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
    const groups = { Today: [], "This Week": [], "Next Week": [] };
    items.forEach((item) => {
      const daysLeft = getDaysLeft(item.expiry);
      if (daysLeft == null) return; // skip items without expiry
      if (daysLeft <= 0) groups.Today.push(item);
      else if (daysLeft <= 7) groups["This Week"].push(item);
      else if (daysLeft <= 14) groups["Next Week"].push(item);
    });
    return groups;
  }, [items]);

  // ⚠️ Status bar (how many items expiring soon)
  const urgentCount = items.filter((item) => {
    const d = getDaysLeft(item.expiry);
    return d != null && d <= 3;
  }).length;
  const barWidth = (urgentCount / Math.max(items.length, 1)) * 100;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
        Expiring Items
      </Text>

      {/* Status Bar */}
      <View
        style={{
          height: 18,
          backgroundColor: "#eee",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor:
              urgentCount / items.length > 0.66
                ? "#C62828"
                : urgentCount / items.length > 0.33
                ? "#FB8C00"
                : "#43A047",
          }}
        />
      </View>

      {/* Grouped items */}
      {Object.entries(groupedItems).map(([groupName, groupItems]) =>
        groupItems.length > 0 ? (
          <View key={groupName} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8 }}>
              {groupName}
            </Text>

            {groupItems.map((item) => {
              const daysLeft = getDaysLeft(item.expiry);
              const color = getExpiryColor(daysLeft);

              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f9f9f9",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: color,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={
                        item.icon ||
                        fallbackIcons[item.name?.toLowerCase()] ||
                        AppleIcon
                      }
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        marginRight: 10,
                      }}
                    />
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#555" }}>
                        {item.quantity} {item.unit}
                      </Text>
                      <Text
                        style={{
                          color,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {daysLeft == null
                          ? "No expiry"
                          : daysLeft <= 0
                          ? "Expired"
                          : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Text style={{ color: "#C62828", fontWeight: "600" }}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null
      )}

      {items.length === 0 && (
        <Text style={{ color: "#777", textAlign: "center", marginTop: 40 }}>
          No items in your fridge yet.
        </Text>
      )}
    </ScrollView>
  );
}
