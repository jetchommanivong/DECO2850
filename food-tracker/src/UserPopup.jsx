import React from "react";
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import CancelIcon from "./assets/Actions/Cancel.png";

export default function UserPopup({ user, mealPlans, onClose }) {
  if (!user) return null;

  // Filter meal plans where user is planner or joined
  const userMeals = mealPlans.filter(
    (m) => m.planner === user.name || m.joined.includes(user.name)
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Image source={CancelIcon} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>

          {/* Avatar + Name */}
          <View style={styles.header}>
            <Image source={user.avatar} style={styles.avatar} />
            <Text style={styles.name}>{user.name}</Text>
          </View>

          {/* Details */}
          <ScrollView style={{ width: "100%" }}>
            <Text style={styles.sectionTitle}>Claimed Items</Text>
            {user.claimed && user.claimed.length > 0 ? (
              user.claimed.map((c, i) => (
                <Text key={i} style={styles.listItem}>
                  • {c}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No claimed items</Text>
            )}

            <Text style={styles.sectionTitle}>Meal Plans</Text>
            {userMeals.length > 0 ? (
              userMeals.map((m) => (
                <Text key={m.id} style={styles.listItem}>
                  📅 {new Date(m.date).toDateString()} — {m.meal}{" "}
                  {m.planner === user.name ? "(Planned)" : "(Joined)"}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No meal plans yet</Text>
            )}
          </ScrollView>
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
  header: {
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 16,
    marginVertical: 2,
  },
  emptyText: {
    fontSize: 15,
    color: "#777",
    fontStyle: "italic",
  },
});
