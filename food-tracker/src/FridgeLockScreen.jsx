import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";

// ✅ If your icons are local files, import them like this instead of using "/icons/..."
import MilkIcon from "./assets/Items/Milk.png";
import BroccoliIcon from "./assets/Items/Broccoli.png";
import AppleIcon from "./assets/Items/Apple.png";

export default function FridgeLockScreen() {
  const [items, setItems] = useState([
    {
      name: "Milk",
      expiry: "2025-09-15",
      icon: MilkIcon,
      quantity: "1 carton",
      claimedBy: "Mary",
      recipes: ["Pancakes", "Oats"],
    },
    {
      name: "Broccoli",
      expiry: "2025-09-18",
      icon: BroccoliIcon,
      quantity: "1 bag",
      claimedBy: "John",
      recipes: ["Stir-fry Beef", "Broccoli Chips"],
    },
    {
      name: "Apples",
      expiry: "2025-09-22",
      icon: AppleIcon,
      quantity: "6 pieces",
    },
  ]);

  const removeItem = (name) => {
    setItems((prev) => prev.filter((item) => item.name !== name));
  };

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (daysLeft) => {
    if (daysLeft <= 0) return "#C62828"; // red
    if (daysLeft <= 1) return "#E65100"; // dark orange
    if (daysLeft <= 3) return "#FFB300"; // amber
    return "#43A047"; // green
  };

  const groupedItems = { Today: [], "This Week": [], "Next Week": [] };
  items.forEach((item) => {
    const daysLeft = getDaysLeft(item.expiry);
    if (daysLeft <= 0) groupedItems.Today.push(item);
    else if (daysLeft <= 7) groupedItems["This Week"].push(item);
    else if (daysLeft <= 14) groupedItems["Next Week"].push(item);
  });

  const urgentCount = items.filter((item) => getDaysLeft(item.expiry) <= 3).length;
  const maxItems = items.length || 1;
  const barWidth = (urgentCount / maxItems) * 100;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
        Expiring Items
      </Text>

      {/* Status bar */}
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
              urgentCount / maxItems > 0.66
                ? "#C62828"
                : urgentCount / maxItems > 0.33
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
                  key={item.name}
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
                      source={item.icon}
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
                        {item.quantity}
                      </Text>
                      <Text
                        style={{
                          color: color,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
                        {daysLeft <= 0
                          ? "Expired"
                          : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => removeItem(item.name)}>
                    <Text style={{ color: "#C62828", fontWeight: "600" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null
      )}
    </ScrollView>
  );
}
