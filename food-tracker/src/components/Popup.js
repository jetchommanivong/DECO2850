import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * Reusable Popup component styled similar to Inventory.js modal
 *
 * Props:
 *  - visible (bool)
 *  - onClose (fn)
 *  - title (string)
 *  - disclaimer (string)
 *  - variant: 'center' | 'slide' (default 'center')
 *  - contentStyle (style)
 *  - children (ReactNode)
 */
export default function Popup({
  visible,
  onClose,
  title,
  disclaimer,
  variant = "center",
  contentStyle,
  children,
}) {
  const animationType = variant === "slide" ? "slide" : "fade";

  return (
    <Modal
      visible={!!visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlayBackdrop}>
        <View
          style={[
            styles.popupContainer,
            variant === "slide" && styles.slideVariant,
            contentStyle,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titleText}>{title || "Popup"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✖</Text>
            </TouchableOpacity>
          </View>

          {disclaimer ? (
            <Text style={styles.disclaimerText}>{disclaimer}</Text>
          ) : null}

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    height: height * 0.7,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  slideVariant: {
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    flexShrink: 1,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    marginTop: 4,
  },
  closeBtn: {
    paddingBottom: 6,
    borderRadius: 6,
  },
  closeBtnText: {
    fontSize: 20,
    color: "#777",
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
});
