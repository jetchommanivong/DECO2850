import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
// use safe-area-context's SafeAreaView (SafeAreaView from RN core is deprecated)
import { SafeAreaView } from "react-native-safe-area-context";
// normalize react-native-vector-icons import so Icon is a valid component in both CJS/ESM environments
import _IconLib from "react-native-vector-icons/Feather";
const Icon = _IconLib?.default ?? _IconLib;

export default function NavBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const currentName = route.name ?? "";

  const navItems = [
    { name: "Fridge", routeName: "FridgeLockScreen", icon: "archive" },
    { name: "Inventory", routeName: "InventoryPage", icon: "box" },
    { name: "Household", routeName: "Household", icon: "users" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container} accessibilityRole="navigation" accessibilityLabel="Main navigation">
        {navItems.map((item) => {
          const isActive = currentName === item.routeName;
          return (
            <TouchableOpacity
              key={item.routeName}
              onPress={() => navigation.navigate(item.routeName)}
              style={[styles.btn, isActive && styles.btnActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.name}
              activeOpacity={0.8}
            >
              <Icon name={item.icon} size={22} color={isActive ? "#1f6feb" : "#6b7280"} />
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    backgroundColor: "#fff",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    // shadow for Android/iOS
    ...Platform.select({
      ios: {
        shadowColor: "#ffffffff",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  btnActive: {
    backgroundColor: "#eaf2ff",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  labelActive: {
    color: "#1f6feb",
    fontWeight: "600",
  },
});