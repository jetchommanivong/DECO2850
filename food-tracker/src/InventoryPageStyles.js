// src/styles/InventoryPageStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* --- Page layout --- */
  inventoryPage: {
    flexGrow: 1,
    paddingVertical: 36,
    paddingHorizontal: 22,
    alignItems: "center",
    backgroundColor: "#fdfdfd",
    width: "100%",
  },

  pageHeader: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  /* --- Pie chart --- */
  chartContainer: {
    marginVertical: 28,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  // 👆 Adds subtle card background around the pie chart

  clickableHint: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
    fontStyle: "italic",
  },

  insightText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
    textAlign: "center",
  },

  /* --- Category list container --- */
  categoryItems: {
    marginTop: 26,
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 6,
  },
  itemText: {
    fontSize: 15,
    color: "#333",
  },

  /* --- Buttons --- */
button: {
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 24,
  marginVertical: 6,
  alignItems: "center",
},

primaryBtn: {
  backgroundColor: "#4CAF50",
  borderWidth: 1,
  borderColor: "#4CAF50",
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 24,
  marginVertical: 6,
  alignItems: "center",
},
primaryBtnText: {
  color: "#fff",
  fontWeight: "bold",
},

secondaryBtn: {
  backgroundColor: "#FF9800",
  borderWidth: 1,
  borderColor: "#ED8D00",
  borderRadius: 6,
  paddingVertical: 12,
  paddingHorizontal: 24,
  marginVertical: 6,
  alignItems: "center",
},
secondaryBtnText: {
  color: "#fff",
  fontWeight: "bold",
},

cancelButton: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#FF4C4C",
  borderRadius: 6,
  paddingVertical: 10,
  paddingHorizontal: 20,
  alignItems: "center",
  marginTop: 8,
  shadowColor: "rgba(0,0,0,0.05)",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
},
cancelButtonText: {
  color: "#FF4C4C",
  fontWeight: "600",
},


  /* --- Household member buttons --- */
  householdMember: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginVertical: 18,
  },
  householdMemberButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  householdMemberButtonText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  householdMemberSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#3d8f41",
  },
  householdMemberSelectedText: {
    color: "#fff",
  },

  /* --- Logging section --- */
  logFor: {
    backgroundColor: "#e8f5e9",
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  logLabel: {
    fontWeight: "700",
    color: "#333",
  },
  changeUserBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeUserBtnText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },

  /* --- Mic animation --- */
  micSection: {
    marginTop: 16,
    alignItems: "center",
  },
  micDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B3B",
    marginBottom: 8,
  },
  micLabel: {
    color: "#333",
    fontWeight: "600",
  },

  /* --- Toast --- */
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "center",
    minWidth: 220,
    marginVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  toastSuccess: {
    backgroundColor: "#e6f4ea",
    borderColor: "#4caf50",
    borderWidth: 1,
  },
  toastError: {
    backgroundColor: "#fdecea",
    borderColor: "#ef5350",
    borderWidth: 1,
  },
  toastText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },

  /* --- Result section --- */
  resultSection: {
    marginTop: 34,
    width: "100%",
    maxWidth: 420,
  },
  resultCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#bbb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  resultCardSuccess: {
    borderLeftColor: "#4CAF50",
  },
  resultCardUnsuccessful: {
    borderLeftColor: "#F44336",
  },
  resultDescription: {
    fontWeight: "700",
    marginBottom: 8,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  resultEmpty: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  memberBtn: {
    backgroundColor: "#4c8bf5",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginVertical: 4,
    alignItems: "center",
  },
  memberBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
