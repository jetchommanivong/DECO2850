import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ReceiptScan({ onAddItem }) {
  const receiptItems = [
    { id: 1, name: "Ham", category: "Meats", quantity: "100g" },
    { id: 2, name: "Tomato", category: "Fruits", quantity: "1" },
    { id: 3, name: "Cheese", category: "Dairy", quantity: "10 Slices" },
    { id: 4, name: "Lettuce", category: "Vegetables", quantity: "1" },
    { id: 5, name: "Butter", category: "Dairy", quantity: "200g" },
  ];

  const [added, setAdded] = useState([]);

  const handleAdd = (item) => {
    if (!added.includes(item.id)) {
      onAddItem(item);
      setAdded((prev) => [...prev, item.id]);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Receipt Scan</Text>
      <Text style={styles.subtitle}>
        Tap “Add” to send items to inventory.
      </Text>

      {receiptItems.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={styles.itemText}>
            {item.quantity} {item.name} ({item.category})
          </Text>

          <TouchableOpacity
            onPress={() => handleAdd(item)}
            disabled={added.includes(item.id)}
            style={[
              styles.addButton,
              added.includes(item.id) && styles.addedButton,
            ]}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              {added.includes(item.id) ? "✔ Added" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addedButton: {
    backgroundColor: "#4CAF50",
  },
});
