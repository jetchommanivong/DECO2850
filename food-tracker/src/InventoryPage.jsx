import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import Svg, { Path, G, Circle, Image as SvgImage, Text as SvgText } from "react-native-svg";
import * as d3Shape from "d3-shape";
import { useNavigation } from "@react-navigation/native";
import styles from "./InventoryPageStyles";
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

  // Create refs for all pie slices at the top level
  const sliceScales = useRef([]);

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

  // Initialize scale refs for all pie slices
  useEffect(() => {
    sliceScales.current = pieData.map((_, i) => 
      sliceScales.current[i] || new Animated.Value(1)
    );
  }, [pieData.length]);

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

  const handleSlicePress = (sliceName, scale) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedCategory(selectedCategory === sliceName ? null : sliceName);
  };

  // --- Voice control ---
  // 🧠 Keep persistent transcript across handlers
const transcriptRef = useRef("");

// 🎤 Start Logging
const handleStartLogging = () => {
  if (typeof window === "undefined" || (!window.SpeechRecognition && !window.webkitSpeechRecognition)) {
    showToast("Speech recognition not supported.", "error");
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SR();

  recog.continuous = true;
  recog.interimResults = false;
  recog.lang = "en-AU";
  transcriptRef.current = ""; // reset

  recog.onstart = () => {
    setIsRecording(true);
    showToast("🎤 Listening — tap Stop when done.", "info");
    console.log("Listening...");
  };

  recog.onresult = (event) => {
    const latest = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(" ")
      .trim();

    // Accumulate transcript (preserves multiple segments)
    transcriptRef.current = latest;
    console.log("🗣️ Captured so far:", transcriptRef.current);
  };

  recog.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    showToast(`Speech recognition error: ${event.error}`, "error");
    setIsRecording(false);
  };

  // Don’t auto-stop on silence — restart if needed
  recog.onend = () => {
    if (isRecording) {
      console.log("Restarting listener (silence detected)");
      recog.start();
    }
  };

  window.__activeRecog = recog;
  setRecognition(recog);
  recog.start();
};

// 🛑 Stop Logging — ensures last speech is saved
const handleStopLogging = () => {
  const recog = recognition || window.__activeRecog;
  if (!recog) {
    console.warn("⚠️ No active recognition instance found!");
    return;
  }

  try {
    recog.onend = null; // prevent restart
    recog.stop();

    // Wait a short delay for the final onresult event
    setTimeout(() => {
      const spoken = transcriptRef.current.trim();
      setIsRecording(false);
      setRecognition(null);

      if (spoken) {
        setTranscript(spoken);
        showToast("✅ Voice captured successfully!", "success");
        console.log("📝 Final Transcript:", spoken);
      } else {
        showToast("⚠️ No speech detected.", "error");
      }
    }, 300); // small buffer ensures last event captured
  } catch (e) {
    console.error("Stop logging error:", e);
  }
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

                  return (
                    <AnimatedG
                      key={index}
                      onPress={() => handleSlicePress(slice.data.category, index)}
                      style={{ 
                        transform: [{ 
                          scale: sliceScales.current[index] || new Animated.Value(1)
                        }] 
                      }}
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
    </ScrollView>
  );
}
