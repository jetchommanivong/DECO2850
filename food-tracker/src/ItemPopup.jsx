import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import CancelIcon from "./assets/Actions/Cancel.png";

// Item images
import AppleImg from "./assets/Items/Apple.png";
import MilkImg from "./assets/Items/Milk.png";
import CheeseImg from "./assets/Items/Cheese.png";
import BroccoliImg from "./assets/Items/Broccoli.png";

const itemImages = {
  Apple: AppleImg,
  Milk: MilkImg,
  Cheese: CheeseImg,
  Broccoli: BroccoliImg,
};

export default function ItemPopup({ item, onClose, onDelete, onToggleClaim }) {
  const navigation = useNavigation();
  if (!item) return null;

  const itemImg = itemImages[item.name] || null;
  const [isClaimed, setIsClaimed] = useState(
    item.claimedBy?.includes("You") || false
  );

  const handleClaimToggle = () => {
    if (isClaimed) {
      Alert.alert("❌ Unclaimed", `You unclaimed ${item.name}`);
      onToggleClaim(item.name, false);
      setIsClaimed(false);
    } else {
      Alert.alert("✅ Claimed", `You claimed ${item.name}`);
      onToggleClaim(item.name, true);
      setIsClaimed(true);
    }
  };

  const handleRecipeClick = () => {
    onClose();
    navigation.navigate("RecipePage");
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Image source={CancelIcon} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>

          {/* Claim/Unclaim */}
          <TouchableOpacity
            onPress={handleClaimToggle}
            style={[
              styles.claimBtn,
              isClaimed && { backgroundColor: "#4CAF50" },
            ]}
          >
            <Text style={styles.claimText}>
              {isClaimed ? "Claimed" : "Claim"}
            </Text>
          </TouchableOpacity>

          {/* Item Image */}
          {itemImg && (
            <Image source={itemImg} style={styles.itemImage} resizeMode="contain" />
          )}

          {/* Item Info */}
          <Text style={styles.itemTitle}>{item.name}</Text>

          <View style={styles.details}>
            <Text style={styles.detailLine}>
              <Text style={styles.bold}>Claimed by:</Text>{" "}
              {item.claimedBy.join(", ")}
            </Text>
            <Text style={styles.detailLine}>
              <Text style={styles.bold}>Expiry Date:</Text> 2025-09-18
            </Text>
            <Text style={styles.detailLine}>
              <Text style={styles.bold}>Status:</Text> 2 days left
            </Text>
          </View>

          {/* Recipe Suggestions */}
          <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
          <Text style={styles.listItem}>• Stir-fry Beef</Text>
          <Text style={styles.listItem}>• {item.name} Chips</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#f44336" }]}
              onPress={() => {
                onDelete(item.name);
                onClose();
              }}
            >
              <Text style={styles.actionText}>Mark as Used</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
              onPress={handleRecipeClick}
            >
              <Text style={styles.actionText}>Go to Recipes</Text>
            </TouchableOpacity>
          </View>
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
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 6,
  },
  claimBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  claimText: { color: "white", fontWeight: "600" },
  itemImage: { width: 120, height: 120, marginVertical: 10 },
  itemTitle: { fontSize: 22, fontWeight: "bold", marginVertical: 8 },
  details: { width: "100%", marginBottom: 10 },
  detailLine: { fontSize: 15, marginVertical: 2 },
  bold: { fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: 10,
  },
  listItem: {
    alignSelf: "flex-start",
    fontSize: 15,
    marginVertical: 2,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: { color: "white", fontWeight: "600" },
});
