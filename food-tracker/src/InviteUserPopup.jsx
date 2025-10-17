import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import CancelIcon from "./assets/Actions/Cancel.png";

// Avatars
import User1 from "./assets/Avatar/User 1.png";
import User2 from "./assets/Avatar/User 2.png";
import User3 from "./assets/Avatar/User 3.png";
import User4 from "./assets/Avatar/User 4.png";
import User5 from "./assets/Avatar/User 5.png";
import User6 from "./assets/Avatar/User 6.png";

const avatarOptions = [User1, User2, User3, User4, User5, User6];

export default function InviteUserPopup({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSubmit = () => {
    if (!name.trim() || !selectedAvatar) {
      Alert.alert("⚠️ Missing Info", "Please enter a name and select an avatar.");
      return;
    }
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      avatar: selectedAvatar,
      claimed: [],
      meals: [],
    };
    onAdd(newUser);
    Alert.alert("✅ Added!", `${name} has been added to your household!`);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image source={CancelIcon} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>

          <Text style={styles.title}>Add a mate!</Text>

          {/* Input Field */}
          <Text style={styles.label}>Name:</Text>
          <TextInput
            placeholder="Enter a name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* Avatar Selection */}
          <Text style={styles.label}>Choose Avatar:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
          >
            {avatarOptions.map((a, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedAvatar(a)}
                style={[
                  styles.avatarWrapper,
                  selectedAvatar === a && styles.avatarSelected,
                ]}
              >
                <Image source={a} style={styles.avatar} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  popup: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    alignSelf: "flex-start",
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 50,
    padding: 3,
    marginRight: 10,
  },
  avatarSelected: {
    borderColor: "#007AFF",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
  },
});
