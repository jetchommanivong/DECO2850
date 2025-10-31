import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";

export default function MealPlanForm({ onClose, onAdd }) {
  const [meal, setMeal] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!meal || !date) {
      Alert.alert("⚠️ Missing Info", "Please fill in both fields.");
      return;
    }
    onAdd({ id: Date.now(), meal, date, planner: "You", joined: [] });
    Alert.alert("✅ Added", `${meal} added successfully!`);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 20,
            width: "85%",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            Add Meal Plan
          </Text>

          <TextInput
            placeholder="Meal name"
            value={meal}
            onChangeText={setMeal}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
          />

          <TextInput
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 15,
            }}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#007AFF",
              paddingVertical: 10,
              borderRadius: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 10, alignItems: "center" }}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
