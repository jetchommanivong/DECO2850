import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";

export default function TempItemPhoto({ inventory, onUpdateQuantity }) {
  const prototypeItems = ["Ham", "Tomato", "Cheese", "Lettuce", "Butter"];
  const [amounts, setAmounts] = useState({});
  const [removingIds, setRemovingIds] = useState({});

  const handleInputChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleTake = (item) => {
    const amount = parseFloat(amounts[item.id]);
    if (isNaN(amount) || amount <= 0) return;

    const willRemoveCompletely = amount >= item.quantity;
    if (willRemoveCompletely) {
      const fadeAnim = new Animated.Value(1);
      setRemovingIds((prev) => ({ ...prev, [item.id]: fadeAnim }));

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setRemovingIds((prev) => {
          const newIds = { ...prev };
          delete newIds[item.id];
          return newIds;
        });
      });
    }

    onUpdateQuantity(item.id, amount);
    setAmounts((prev) => ({ ...prev, [item.id]: "" }));
  };

  const itemsToShow = inventory.filter((item) =>
    prototypeItems.includes(item.name)
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.title}>Photo of Taken Ingredients</Text>
      <Text style={styles.subtitle}>
        Enter the quantity removed from the fridge
      </Text>

      {itemsToShow.length > 0 ? (
        itemsToShow.map((item) => {
          const fadeAnim = removingIds[item.id] || new Animated.Value(1);

          return (
            <Animated.View
              key={item.id}
              style={[styles.itemCard, { opacity: fadeAnim }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>
                  {item.quantity} {item.unit} {item.name} ({item.category})
                </Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Amount to take"
                keyboardType="numeric"
                value={amounts[item.id] || ""}
                onChangeText={(text) => handleInputChange(item.id, text)}
              />

              <TouchableOpacity
                onPress={() => handleTake(item)}
                style={styles.takeButton}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>Take</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })
      ) : (
        <Text style={styles.emptyText}>
          All items in this prototype set have been removed.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 8,
    textAlign: "center",
    fontSize: 16,
  },
  takeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});
