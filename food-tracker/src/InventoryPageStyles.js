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
    height: "100vh",
  },

  pageHeader: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  /* --- Pie chart --- */
  chartContainer: {
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
    minHeight: 100,
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
    justifyContent: "center",
    alignSelf: "center"
  },
  memberBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  // Add these to your existing styles object:

header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 20,
},

voiceLogButton: {
  backgroundColor: '#3b82f6',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
},

voiceLogButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},

legend: {
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginTop: 12,
  gap: 14,
},

legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 6,
},

legendDot: {
  width: 14,
  height: 14,
  borderRadius: 7,
  marginRight: 6,
},

legendText: {
  color: '#333',
  fontSize: 14,
},

filterChips: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  gap: 8,
  backgroundColor: '#f0f0f0',
  padding: 7,
  borderRadius: 10,
},

filterChip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#fdfdfd',
  borderWidth: 1,
  borderColor: '#ddd',
},

filterChipActive: {
  // backgroundColor: '#3b82f6',
  // borderColor: '#3b82f6',
  backgroundColor: '#333333',
},

filterChipText: {
  color: '#333',
  fontSize: 14,
  fontWeight: '500',
},

filterChipTextActive: {
  color: 'white',
},

itemsListSection: {
  width: '100%',
  marginTop: 20,
},

itemRow2: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: 12,
  marginVertical: 4,
  borderRadius: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},

itemName: {
  flex: 1,
  fontSize: 16,
  color: '#333',
},

itemQuantity: {
  fontSize: 14,
  color: '#666',
  marginRight: 10,
},

itemActionBtn: {
  backgroundColor: '#ef4444',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},

itemActionBtnText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},

noItems: {
  textAlign: 'center',
  color: '#999',
  fontSize: 16,
  marginTop: 20,
},

voiceOverlayBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',
},

voiceOverlay: {
  backgroundColor: 'white',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: '90%',
  minHeight: '75%',
  paddingBottom: 20,
},

overlayHeader: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: 16,
},

closeBtn: {
  padding: 8,
},

closeBtnText: {
  fontSize: 20,
  color: '#666',
},

overlayMainContent: {
  paddingHorizontal: 20,
},

overlayTitle: {
  fontSize: 20,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 20,
  color: '#333',
},

memberSelection: {
  flexDirection: 'column',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 10,
  alignContent: "center",
},

memberBtn2: {
  backgroundColor: '#4c8bf5',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  margin: 4,
},

memberBtnText2: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
},

loggingSection: {
  minHeight: 200,
},

actionButtons: {
  alignItems: 'center',
  gap: 12,
},

mainActionBtn: {
  backgroundColor: '#3b82f6',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},

mainActionBtnText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},

regularBtn: {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#ddd',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},

regularBtnText: {
  color: '#333',
  fontSize: 16,
  fontWeight: '500',
},

micDot2: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#ef4444',
  marginVertical: 20,
},

listeningText: {
  fontSize: 18,
  color: '#333',
  fontWeight: '500',
  marginBottom: 10,
},

transcriptMain: {
  gap: 16,
},

transcriptSection: {
  gap: 8,
},

detectedLabel: {
  fontSize: 16,
  color: '#666',
  fontWeight: '500',
},

transcriptBox: {
  backgroundColor: '#f9fafb',
  borderLeftWidth: 4,
  borderLeftColor: '#3b82f6',
  padding: 12,
  borderRadius: 6,
},

transcriptText: {
  fontSize: 16,
  color: '#333',
  fontStyle: 'italic',
},

resultSection2: {
  maxHeight: 300,
  marginTop: 16,
},

resultTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 12,
  color: '#333',
},

resultCard2: {
  backgroundColor: '#f7fdf7',
  borderLeftWidth: 5,
  borderLeftColor: '#ccc',
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
},

resultCardSuccess2: {
  borderLeftColor: '#4caf50',
},

resultDescription2: {
  fontWeight: '600',
  marginBottom: 8,
  color: '#333',
},

resultList: {
  gap: 4,
},

resultItem2: {
  fontSize: 14,
  color: '#666',
  lineHeight: 20,
},

resultBold: {
  fontWeight: '600',
  color: '#333',
},

resultEmpty2: {
  color: '#999',
  fontStyle: 'italic',
},

toast2: {
  position: 'absolute',
  bottom: 20,
  left: 20,
  right: 20,
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  zIndex: 1000,
},

toastSuccess2: {
  backgroundColor: '#4caf50',
},

toastError2: {
  backgroundColor: '#ef4444',
},

toastInfo: {
  backgroundColor: '#3b82f6',
},

toastText2: {
  color: 'white',
  fontSize: 16,
  fontWeight: '500',
  textAlign: 'center',
},

expiryText: {
  fontSize: 12,
  marginTop: 2,
  fontWeight: "500",
},

mainContentContainer: {
  width: "100%",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 40,
},

leftColumn: {
  alignSelf: 'flex-start',
  flex: 1,
  minWidth: 300,
  maxWidth: 500,
  gap: 30,
},

rightColumn: {
  alignSelf: 'flex-start',
  flex: 2,
  minWidth: 300,
},

legend: {
  flexDirection: 'row',
  justifyContent: 'center',
  // flexWrap: 'wrap',
  marginTop: 12,
  gap: 14,
},

legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 6,
},

legendDot: {
  width: 14,
  height: 14,
  borderRadius: 7,
  marginRight: 6,
},

legendText: {
  color: '#333',
  fontSize: 14,
},
headerButtons: {
  display: 'flex',
  flexDirection: 'row',
  gap: 10,
  alignSelf: 'center',
},
editBtn: {
  backgroundColor: 'white',
  borderColor: '#e3e3e3',
  borderWidth: 1,
  padding: 8,
  borderRadius: 8,
  minWidth: 36,
  alignItems: 'center',
},
editBtnText: {
  fontSize: 18,
},
editContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
incrementBtn: {
  backgroundColor: '#ecf0f1',
  width: 32,
  height: 32,
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
},
incrementBtnText: {
  fontSize: 20,
  color: '#2c3e50',
  fontWeight: 'bold',
},
quantityInput: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#bdc3c7',
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 6,
  fontSize: 16,
  textAlign: 'center',
  minWidth: 60,
},
saveBtn: {
  backgroundColor: '#27ae60',
  padding: 8,
  borderRadius: 6,
  minWidth: 32,
  alignItems: 'center',
},
saveBtnText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},
cancelBtn: {
  backgroundColor: '#e74c3c',
  padding: 8,
  borderRadius: 6,
  minWidth: 32,
  alignItems: 'center',
},
cancelBtnText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},

});
