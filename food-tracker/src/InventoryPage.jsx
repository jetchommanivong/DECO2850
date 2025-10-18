import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import Svg, { Path, G, Circle, Image as SvgImage, Text as SvgText } from "react-native-svg";
import * as d3Shape from "d3-shape";
import { useNavigation } from "@react-navigation/native";
import styles from "./InventoryPageStyles";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useItems, useMembers, store } from "./store";
import "./InventoryPage.css";

const AnimatedG = Animated.createAnimatedComponent(G);
const { width } = Dimensions.get("window");
const radius = 110;

// 🖼️ Category icons
const categoryIcons = {
  Meats: require("./assets/Icons/meat.png"),
  Vegetables: require("./assets/Icons/broccoli.png"),
  Dairy: require("./assets/Icons/cheese.png"),
  Fruits: require("./assets/Icons/apple.png"),
  Other: require("./assets/Icons/other.png"),
};

// 🎨 Pastel, intuitive color scheme
const CATEGORY_COLORS = {
  Meats: "#BC4749",
  Vegetables: "#679436",
  Dairy: "#FFDB4C",
  Fruits: "#064789",
  Other: "#BDC3C7",
};

export default function InventoryPage() {
  const navigation = useNavigation?.();
  // Get data from store
  const items = useItems();
  const householdMembers = useMembers();

  const [selectedCategory, setSelectedCategory] = useState(null);
  // const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [resultJSON, setResultJSON] = useState(null);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [transcriptProcessed, setTranscriptProcessed] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (selectedMember) {
      setOverlayTitle(`Logging for: ${selectedMember.member_name}`);
    } else {
      setOverlayTitle("Who are you logging as?");
    }
  }, [selectedMember]);
  
  // --- Group inventory items by category ---
  const categories = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || []).concat(item);
      return acc;
    }, {});
  }, [items]);

  const categoryData = useMemo(() => {
    return Object.entries(categories).map(([category, arr]) => ({
      category,
      value: arr.length,
    }));
  }, [categories]);

  const total = useMemo(
    () => categoryData.reduce((a, b) => a + b.value, 0),
    [categoryData]
  );

  const pieData = d3Shape.pie().value((d) => d.value)(categoryData);

  // --- Mic pulse animation ---
  const micPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(micPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      micPulse.setValue(1);
    }
  }, [isRecording, micPulse]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };


  // Group items by category
  const categoriesOld = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || []).concat(item);
    return acc;
  }, {});

  const handleSlicePress = (sliceName, scale) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedCategory(selectedCategory === sliceName ? null : sliceName);
  };

  // --- Voice control ---
  const handleStartLogging = () => {
    if (typeof window === "undefined" || (!window.SpeechRecognition && !window.webkitSpeechRecognition)) {
      showToast("Speech recognition not supported.", "error");
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SR) {
      const recog = new SR();

      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-AU";
      recog.maxAlternatives = 1;

      let finalTranscript = "";

      recog.onstart = () => {
        setIsRecording(true);
        showToast("Recording started. Please start speaking.", "info");
        console.log("Listening...");
      }

      recog.onresult = (event) => {
        finalTranscript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(" ")
          .trim();
      };

      recog.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        showToast(`Speech recognition error: ${event.error}`, "error");
        setIsRecording(false);
      }

      recog.onend = () => {
        console.log("Recognition stopped.");
        setIsRecording(false);
        setRecognition(null);

        if (finalTranscript.trim()) {
          setTranscript(finalTranscript);
          showToast("Voice captured successfully!", "success");
        } else {
          showToast("No speech detected. Please try again.", "error");
        }
      };

      recog.start();
      window.__activeRecog = recog;
      setRecognition(recog);

      // jet's below
      // recog.onresult = (e) => {
      //   const t = Array.from(e.results)
      //     .map((r) => r[0].transcript)
      //     .join(" ")
      //     .trim();
      //   if (t) setTranscript(t);
      // };
      // recog.onend = () => setIsRecording(false);
      // try {
      //   recog.start();
      //   window.__activeRecog = recog;
      // } catch {}
    }
  };

  const handleStopLogging = () => {
    if (typeof window !== "undefined" && window.__activeRecog) {
      try {
        window.__activeRecog.stop();
        showToast("Recording stopped.", "info");
        setIsRecording(false);
        console.log("Recording manually stopped.");
      } catch (e) {
        console.log("error:", e);
      }
    } else {
      console.warn("No active recognition instance found!");
    }

    // jet's
    // setIsRecording(false);
    // showToast("🛑 Recording stopped.", "success");
    // if (typeof window !== "undefined" && window.__activeRecog) {
    //   try {
    //     window.__activeRecog.stop();
    //   } catch {}
    // }
  };
  
  // --- Parse transcript ---
  const handleParseTranscript = async () => {
    if (!selectedMember || !transcript) {
      showToast("Please select a member and provide a transcript", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/parse-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          selectedMemberId: selectedMember.member_id,
          inventory: items.map((i, idx) => ({ item_id: idx + 1, item_name: i.name })),
          membersItems: [],
          householdMembers,
        }),
      });

      const json = await res.json();
      setResultJSON(json);

      // Unsuccessful
      if (!json.log || json.log[0].status !== "success") {
        console.warn("Transcript validation failed:", json);
        showToast("❌ Unable to process — item not found or invalid input.", "error");
        return;
      }

      // Deduplicate similar items
      const uniqueData = Array.from(
        new Map(json.log[0].data.map(item => [`${item.itemName}-${item.action}`, item])).values()
      );

      let addedItems = [];
      let removedItems = [];

      uniqueData.forEach((item) => {
        if (item.action === "remove") {
          const match = items.find(
            (i) => i.name.toLowerCase() === item.itemName.toLowerCase()
          );
          if (match) {
            // Use store action instead
            store.actions.items.updateQuantity(match.id, item.quantity);
            
            // Log the action
            store.actions.logs.add({
              memberId: selectedMember.member_id,
              action: "remove",
              itemName: item.itemName,
              quantity: item.quantity
            });
            
            removedItems.push(`${item.quantity} ${item.unit} of ${item.itemName}`);
          } else {
            console.warn(`⚠️ Could not find ${item.itemName} in inventory.`);
          }
        } else if (item.action === "add") {
          // Use store action instead
          store.actions.items.addOrMerge({
            name: item.itemName,
            category: item.category || "Other",
            quantity: item.quantity,
            unit: item.unit,
          });
          
          // Log the action
          store.actions.logs.add({
            memberId: selectedMember.member_id,
            action: "add",
            itemName: item.itemName,
            quantity: item.quantity
          });
          
          addedItems.push(`${item.quantity} ${item.unit} of ${item.itemName}`);
        }
      });

      if (addedItems.length || removedItems.length) {
        const addedText = addedItems.length ? `Added ${addedItems.join(", ")}` : "";
        const removedText = removedItems.length ? `Removed ${removedItems.join(", ")}` : "";
        const message = `${addedText}${addedText && removedText ? " and " : ""}${removedText}.`;
        showToast(`✅ ${message}`, "success");
      }
      setTranscriptProcessed(true);

    } catch (err) {
      console.error("Error parsing transcript to JSON:", err);
      showToast("Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const displayItems = selectedCategory 
    ? categories[selectedCategory] || []
    : items;
  const handleSelectMember = () => {
    setSelectedMember(null);
    setTranscript("");
    setToast({ message: "", type: "" });
    setResultJSON(null);
    setTranscriptProcessed(false);
  };

  const handleTryAgain = () => {
    setTranscript("");
    setToast({ message: "", type: "" });
    setResultJSON(null);
    setTranscriptProcessed(false);
  };

  const handleRestartLogSameMember = () => {
    setToast({ message: "", type: "" });
    setTranscript("");
    setIsRecording(false);
    setResultJSON(null);
    setTranscriptProcessed(false);
  };

  const handleCloseOverlay = () => {
    setToast({ message: "", type: "" });
    setTranscript("");
    setIsRecording(false);
    setResultJSON(null);
    setTranscriptProcessed(false);
    setSelectedMember(null);
    setShowVoiceOverlay(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.inventoryPage}>
      {navigation && (
        <View style={{ alignSelf: "flex-start", marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageHeader}>Fridge Inventory</Text>
        <TouchableOpacity
          onPress={() => setShowVoiceOverlay(true)}
          style={styles.voiceLogButton}
        >
          <Text style={styles.voiceLogButtonText}>Voice Log</Text>
        </TouchableOpacity>
      </View>

      {/* <Text style={styles.pageHeader}>Fridge Composition</Text> */}

      {/* 🥧 Pie Chart */}
      <View style={styles.chartContainer}>
        {categoryData.length ? (
          <>
            <Svg width={width} height={300}>
              <G x={width / 2} y={150}>
                {pieData.map((slice, index) => {
                  const arc = d3Shape.arc().outerRadius(radius).innerRadius(50);
                  const path = arc(slice);
                  const [cx, cy] = arc.centroid(slice);
                  const iconSize = 32;
                  const scale = useRef(new Animated.Value(1)).current;

                  return (
                    <AnimatedG
                      key={index}
                      onPress={() => handleSlicePress(slice.data.category, scale)}
                      style={{ transform: [{ scale }] }}
                    >
                      <Path
                        d={path}
                        fill={CATEGORY_COLORS[slice.data.category] || "#BDC3C7"}
                        opacity={
                          selectedCategory &&
                          selectedCategory !== slice.data.category
                            ? 0.45
                            : 1
                        }
                      />
                      <SvgImage
                        href={categoryIcons[slice.data.category]}
                        x={cx - iconSize / 2}
                        y={cy - iconSize / 2}
                        width={iconSize}
                        height={iconSize}
                        opacity={
                          selectedCategory &&
                          selectedCategory !== slice.data.category
                            ? 0.6
                            : 1
                        }
                      />
                    </AnimatedG>
                  );
                })}
                <Circle r={52} fill="#fff" />
                <SvgText x={-35} y={6} fontSize={16} fontWeight="600" fill="#333">
                  {total} items
                </SvgText>
              </G>
            </Svg>

            {/* Legend */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 12,
                gap: 14,
              }}
            >
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <View
                  key={cat}
                  style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 6 }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: color,
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ color: "#333", fontSize: 14 }}>{cat}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.itemText}>No items in your fridge.</Text>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChips}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={[
            styles.filterChip,
            !selectedCategory && styles.filterChipActive
          ]}
        >
          <Text style={[
            styles.filterChipText,
            !selectedCategory && styles.filterChipTextActive
          ]}>All</Text>
        </TouchableOpacity>
        {Object.keys(categories).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.filterChip,
              selectedCategory === cat && styles.filterChipActive
            ]}
          >
            <Text style={[
              styles.filterChipText,
              selectedCategory === cat && styles.filterChipTextActive
            ]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items List */}
      <View style={styles.itemsListSection}>
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>
                {item.quantity} {item.unit}
              </Text>
              <TouchableOpacity style={styles.itemActionBtn}>
                <Text style={styles.itemActionBtnText}>⊖</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noItems}>No items in this category.</Text>
        )}
      </View>

      {/* Voice Overlay Modal */}
      <Modal
        visible={showVoiceOverlay}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseOverlay}
      >
        <View style={styles.voiceOverlayBackdrop}>
          <View style={styles.voiceOverlay}>
            <View style={styles.overlayHeader}>
              <TouchableOpacity onPress={handleCloseOverlay} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✖</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.overlayMainContent}>
              <Text style={styles.overlayTitle}>{overlayTitle}</Text>

              {!selectedMember ? (
                <View style={styles.memberSelection}>
                  {householdMembers.map((m) => (
                    <TouchableOpacity
                      key={m.member_id}
                      onPress={() => setSelectedMember(m)}
                      style={styles.memberBtn}
                    >
                      <Text style={styles.memberBtnText}>{m.member_name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.loggingSection}>
                  {!transcript ? (
                    <View style={styles.micSection}>
                      {!isRecording ? (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            onPress={handleStartLogging}
                            style={styles.mainActionBtn}
                          >
                            <Text style={styles.mainActionBtnText}>Start Logging</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSelectMember}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>Change Member</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.actionButtons}>
                          <Animated.View
                            style={[
                              styles.micDot,
                              { transform: [{ scale: micPulse }] },
                            ]}
                          />
                          <Text style={styles.listeningText}>Listening...</Text>
                          <TouchableOpacity
                            onPress={handleStopLogging}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>⏹ Stop Logging</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.transcriptMain}>
                      <View style={styles.transcriptSection}>
                        <Text style={styles.detectedLabel}>Detected:</Text>
                        <View style={styles.transcriptBox}>
                          <Text style={styles.transcriptText}>"{transcript}"</Text>
                        </View>
                      </View>
                      {!transcriptProcessed ? (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            onPress={handleParseTranscript}
                            disabled={loading}
                            style={styles.mainActionBtn}
                          >
                            <Text style={styles.mainActionBtnText}>
                              {loading ? "Processing..." : "Confirm & Process"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleTryAgain}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>Try Again</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            onPress={handleRestartLogSameMember}
                            style={styles.mainActionBtn}
                          >
                            <Text style={styles.mainActionBtnText}>Add Another Log</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSelectMember}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>Back to Select Member</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Result Display */}
              {resultJSON && resultJSON.log && (
                <ScrollView style={styles.resultSection}>
                  <Text style={styles.resultTitle}>Action Summary</Text>
                  {resultJSON.log.map((entry, idx) => (
                    <View key={idx} style={[styles.resultCard, entry.status === "success" && styles.resultCardSuccess]}>
                      <Text style={styles.resultDescription}>{entry.description}</Text>
                      {entry.data && entry.data.length > 0 ? (
                        <View style={styles.resultList}>
                          {entry.data.map((item, i) => (
                            <Text key={i} style={styles.resultItem}>
                              <Text style={styles.resultBold}>
                                {householdMembers.find((m) => m.member_id === item.member)?.member_name || "Someone"}
                              </Text>
                              {" "}{item.action === "add" ? "added" : "removed"}{" "}
                              <Text style={styles.resultBold}>{item.quantity} {item.unit}</Text> of{" "}
                              <Text style={styles.resultBold}>{item.itemName}</Text> ({item.category})
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.resultEmpty}>No valid items were processed.</Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast.message && (
        <View style={[
          styles.toast,
          toast.type === "error" && styles.toastError,
          toast.type === "success" && styles.toastSuccess,
          toast.type === "info" && styles.toastInfo,
        ]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* 🎙 Voice Logging Section */}
      {/* <View style={{ width: "100%", maxWidth: 420, marginTop: 20, alignItems: "center" }}>
        {!isRecording ? (
          <TouchableOpacity
            onPress={handleStartLogging}
            style={[styles.button, styles.primaryBtn]}
          >
            <Text style={styles.primaryBtnText}>🎤 Start Logging</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.micSection}>
              <Animated.View
                style={[
                  styles.micDot,
                  { transform: [{ scale: micPulse }], marginBottom: 10 },
                ]}
              />
              <Text style={styles.micLabel}>Listening...</Text>
            </View>
            <TouchableOpacity
              onPress={handleStopLogging}
              style={[styles.button, styles.secondaryBtn, { marginTop: 10 }]}
            >
              <Text style={styles.secondaryBtnText}>⏹ Stop Logging</Text>
            </TouchableOpacity>
          </>
        )}
      </View> */}

      {/* 📦 Category Details */}
      {/* {selectedCategory && categories[selectedCategory] && (
        <View style={styles.categoryItems}>
          <Text style={styles.categoryTitle}>{selectedCategory}</Text>
          {categories[selectedCategory].map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemText}>
                {item.quantity} {item.unit}
              </Text>
            </View>
          ))}
        </View>
      )} */}

      {/* {!!toast.message && (
        <View
          style={[
            styles.toast,
            toast.type === "error" ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )} */}
    </ScrollView>
  );
}
