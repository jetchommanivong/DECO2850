import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import { Home, Book, ClipboardList, Receipt, Image, Users } from "lucide-react";

export default function NavBar() {
  const navigation = useNavigation();
  const index = useNavigationState((state) => state.index);
  const routes = useNavigationState((state) => state.routes);
  const currentRouteName = routes[index]?.name;

  const navItems = [
    { name: "Fridge", route: "FridgeLockScreen" },
    { name: "Recipes", route: "RecipePage" },
    { name: "Inventory", route: "InventoryPage" },
    { name: "Receipt", route: "ReceiptScan" },
    { name: "ItemPhoto", route: "TempItemPhoto" },
    { name: "Household", route: "Household" },
  ];

  return (
    <View style={styles.navBar}>
      {navItems.map((item) => {
        const isActive = currentRouteName === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={[styles.navButton, isActive && styles.activeButton]}
          >
            <Text
              style={[
                styles.navText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 5,
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  activeText: {
    color: "#007AFF",
  },
  inactiveText: {
    color: "#555",
  },
});