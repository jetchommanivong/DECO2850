import React from "react";
import { View, StyleSheet } from "react-native";
import NavBar from "./NavBar";

export default function Layout({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <NavBar /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingBottom: 60, // leave space for NavBar
  },
});
