import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  useWindowDimensions,
  TextInput,
} from "react-native";
import Svg, { Path, G, Circle, Image as SvgImage, Text as SvgText } from "react-native-svg";
import * as d3Shape from "d3-shape";
import { Audio } from "expo-av";
import styles from "./InventoryPageStyles";
import { useItems, useMembers, store } from "./store";
import VoiceRecorderHybrid from "./VoiceRecorder";
import ReceiptScan from "./ReceiptScan";
// import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

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

// 🎨 Pastel color scheme
const CATEGORY_COLORS = {
  Meats: "#BC4749",
  Vegetables: "#679436",
  Dairy: "#FFDB4C",
  Fruits: "#064789",
  Other: "#BDC3C7",
};

export default function InventoryPage() {
  const items = useItems();
  const householdMembers = useMembers();
  const windowWidth = useWindowDimensions().width;
  const windowLength = useWindowDimensions().height;
  const isLargeScreen = windowWidth > windowLength;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [resultJSON, setResultJSON] = useState(null);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [transcriptProcessed, setTranscriptProcessed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);

  const recordingRef = useRef(null);
  const micPulse = useRef(new Animated.Value(1)).current;
  const sliceScales = useRef([]);
  const hybridRef = useRef(null);

  useEffect(() => {
    if (selectedMember) {
      setOverlayTitle(`Logging for: ${selectedMember.member_name}`);
    } else {
      setOverlayTitle("Who are you logging as?");
    }
  }, [selectedMember]);

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

  useEffect(() => {
    sliceScales.current = pieData.map((_, i) =>
      sliceScales.current[i] || new Animated.Value(1)
    );
  }, [pieData.length]);

  // --- Mic pulse animation ---
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

  // ======================
  // 🎤 WHISPER INTEGRATION
  // ======================

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        showToast("Microphone permission not granted", "error");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();

      recordingRef.current = rec;
      setIsRecording(true);
      showToast("🎙️ Recording started...", "info");
    } catch (err) {
      console.error("Recording start error:", err);
      showToast("Failed to start recording.", "error");
    }
  };

  const stopRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setIsRecording(false);
      showToast("🔁 Transcribing audio...", "info");
      await sendToWhisper(uri);
    } catch (err) {
      console.error("Stop recording error:", err);
      showToast("Error stopping recording.", "error");
    }
  };

  const sendToWhisper = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "audio.m4a",
        type: "audio/m4a",
      });
      formData.append("model", "whisper-1");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setTranscript(data.text);
        showToast("✅ Voice captured successfully!", "success");
      } else {
        console.error("Whisper API error:", data);
        showToast("❌ Failed to transcribe audio.", "error");
      }
    } catch (error) {
      console.error("Whisper upload error:", error);
      showToast("Error uploading audio to Whisper.", "error");
    }
  };

  // ======================

  const handleParseTranscript = async () => {
    if (!selectedMember || !transcript) {
      showToast("Please select a member and provide a transcript", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/api/parse-transcript`, {
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

      if (!json.log || json.log[0].status !== "success") {
        showToast("❌ Unable to process — item not found or invalid input.", "error");
        return;
      }

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
            store.actions.items.updateQuantity(match.id, item.quantity);
            store.actions.logs.add({
              memberId: selectedMember.member_id,
              action: "remove",
              itemName: item.itemName,
              quantity: item.quantity
            });
            removedItems.push(`${item.quantity} ${item.unit} of ${item.itemName}`);
          }
        } else if (item.action === "add") {
          // Include expiry date when adding items
          const itemData = {
            name: item.itemName,
            category: item.category || "Other",
            quantity: item.quantity,
            unit: item.unit,
          };

          // Add expiry date if provided
          if (item.expiry) {
            itemData.expiry = item.expiry;
          }

          store.actions.items.addOrMerge(itemData);

          store.actions.logs.add({
            memberId: selectedMember.member_id,
            action: "add",
            itemName: item.itemName,
            quantity: item.quantity
          });

          // Format the added items message with expiry info
          let itemMsg = `${item.quantity} ${item.unit} of ${item.itemName}`;

          if (item.estimatedExpiryDays) {
            itemMsg += ` (expires in ~${item.estimatedExpiryDays} days)`;
          }

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

  const displayItems = selectedCategory ? categories[selectedCategory] || [] : items;

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

  const handleCloseModal = () => {
    setShowModal(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.inventoryPage}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageHeader}>Fridge Inventory</Text>
      </View>

      {/* Main Content Container */}
      <View style={[
        styles.mainContentContainer,
        !isLargeScreen && { flexDirection: 'column', gap: 20, minHeight: 'fit-content' }
      ]}>
        {/* LEFT COLUMN */}
        <View style={[
          styles.leftColumn,
          !isLargeScreen && { maxWidth: '100%', width: '100%', minHeight: 'fit-content', alignItems: "center" }
        ]}>
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
                            transform: [{ scale: sliceScales.current[index] || new Animated.Value(1) }],
                          }}
                        >
                          <Path
                            d={path}
                            fill={CATEGORY_COLORS[slice.data.category] || "#BDC3C7"}
                            opacity={
                              selectedCategory && selectedCategory !== slice.data.category ? 0.45 : 1
                            }
                          />
                          <SvgImage
                            href={categoryIcons[slice.data.category]}
                            x={cx - iconSize / 2}
                            y={cy - iconSize / 2}
                            width={iconSize}
                            height={iconSize}
                            opacity={
                              selectedCategory && selectedCategory !== slice.data.category ? 0.6 : 1
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

          {/* Receipt Scan / Voice Log */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={styles.voiceLogButton}
            >
              <Text style={styles.voiceLogButtonText}>Scan Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowVoiceOverlay(true)}
              style={styles.voiceLogButton}
            >
              <Text style={styles.voiceLogButtonText}>Voice Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT COLUMN */}
        <View style={[
          styles.rightColumn,
          !isLargeScreen && { maxWidth: '100%', width: '100%' }
        ]}>
          {/* Filter Chips */}
          <View style={[
            styles.filterChips,
            !isLargeScreen && { justifyContent: 'center'}]}>
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedCategory && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {Object.keys(categories).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.filterChip,
                  selectedCategory === cat && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items List */}
          <View style={styles.itemsListSection}>
            {displayItems.length > 0 ? (
              displayItems
              // Sort by expiry date - items expiring soonest first
              .sort((a, b) => {
                if (!a.expiry && !b.expiry) return 0;
                if (!a.expiry) return 1;
                if (!b.expiry) return -1;
                return new Date(a.expiry) - new Date(b.expiry);
              })
              .map((item) => {
                // Calculate days until expiry
                let expiryInfo = null;
                if (item.expiry) {
                  const expiryDate = new Date(item.expiry);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                  if (daysUntilExpiry < 0) {
                    expiryInfo = { text: "Expired", color: "#e74c3c" };
                  } else if (daysUntilExpiry === 0) {
                    expiryInfo = { text: "Expires today", color: "#e67e22" };
                  } else if (daysUntilExpiry <= 3) {
                    expiryInfo = { text: `${daysUntilExpiry}d left`, color: "#e67e22" };
                  } else if (daysUntilExpiry <= 7) {
                    expiryInfo = { text: `${daysUntilExpiry}d left`, color: "#f39c12" };
                  } else {
                    expiryInfo = { text: `${daysUntilExpiry}d left`, color: "#95a5a6" };
                  }
                }

                const isEditing = editingItemId === item.id;
                
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {expiryInfo && (
                        <Text style={[styles.expiryText, { color: expiryInfo.color }]}>
                          {expiryInfo.text}
                        </Text>
                      )}
                    </View>
                    
                    {/* Edit */}
                    {!isEditing ? (
                      <View style={styles.editContainer}>
                        <Text style={styles.itemQuantity}>
                          {item.quantity} {item.unit}
                        </Text>
                        <TouchableOpacity 
                          style={styles.editBtn}
                          onPress={() => {
                            setEditingItemId(item.id);
                            setEditValue(item.quantity.toString());
                          }}
                        >
                          <AntDesign name="edit" size={20} color="black" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.editContainer}>
                        <TouchableOpacity 
                          style={styles.incrementBtn}
                          onPress={() => {
                            const currentValue = parseFloat(editValue);
                            if (!isNaN(currentValue) && currentValue > 0) {
                              setEditValue((currentValue - 1).toString());
                            }
                          }}
                        >
                          <Text style={styles.incrementBtnText}>−</Text>
                        </TouchableOpacity>
                        
                        <TextInput
                          style={styles.quantityInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="numeric"
                        />
                        
                        <TouchableOpacity 
                          style={styles.incrementBtn}
                          onPress={() => {
                            const currentValue = parseFloat(editValue);
                            if (!isNaN(currentValue)) {
                              setEditValue((currentValue + 1).toString());
                            }
                          }}
                        >
                          <Text style={styles.incrementBtnText}>+</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.saveBtn}
                          onPress={() => {
                            const numValue = parseFloat(editValue);
                            if (!isNaN(numValue) && numValue >= 0) {
                              const difference = item.quantity - numValue;

                              store.actions.items.updateQuantity(item.id, difference);
                              showToast(`Updated ${item.name} to ${numValue} ${item.unit}`, "success");
                            } else {
                            }
                            setEditingItemId(null);
                            setEditValue("");
                          }}
                        >
                          <Text style={styles.saveBtnText}>✓</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.cancelBtn}
                          onPress={() => {
                            setEditingItemId(null);
                            setEditValue("");
                          }}
                        >
                          <Text style={styles.cancelBtnText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )
              })
            ) : (
              <Text style={styles.noItems}>No items in this category.</Text>
            )}
          </View>
        </View>        
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
                          {/* ▶️ Start Logging */}
                          <TouchableOpacity
                            onPress={() => {
                              setIsRecording(true);
                              hybridRef.current?.start();
                            }}
                            style={styles.mainActionBtn}
                          >
                            <Text style={styles.mainActionBtnText}>Start Logging</Text>
                          </TouchableOpacity>

                          {/* 👤 Change Member */}
                          <TouchableOpacity
                            onPress={handleSelectMember}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>Change Member</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.actionButtons}>
                          {/* 🔴 Pulsing mic + status while recording */}
                          <Animated.View
                            style={[styles.micDot, { transform: [{ scale: micPulse }] }]}
                          />
                          <Text style={styles.listeningText}>Recording...</Text>

                          {/* ⏹ Stop Logging */}
                          <TouchableOpacity
                            onPress={() => {
                              setIsRecording(false);
                              hybridRef.current?.stop();
                            }}
                            style={styles.regularBtn}
                          >
                            <Text style={styles.regularBtnText}>⏹ Stop Logging</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* 🧠 Hidden logic controller */}
                      <VoiceRecorderHybrid
                        ref={hybridRef}
                        onTranscript={(text) => {
                          console.log("🎙 Transcript:", text);
                          setTranscript(text); // only appears after stop pressed
                        }}
                      />
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
                    <View
                      key={idx}
                      style={[
                        styles.resultCard,
                        entry.status === "success" && styles.resultCardSuccess,
                      ]}
                    >
                      <Text style={styles.resultDescription}>{entry.description}</Text>
                      {entry.data && entry.data.length > 0 ? (
                        <View style={styles.resultList}>
                          {entry.data.map((item, i) => (
                            <Text key={i} style={styles.resultItem}>
                              <Text style={styles.resultBold}>
                                {householdMembers.find(
                                  (m) => m.member_id === item.member
                                )?.member_name || "Someone"}
                              </Text>{" "}
                              {item.action === "add" ? "added" : "removed"}{" "}
                              <Text style={styles.resultBold}>
                                {item.quantity} {item.unit}
                              </Text>{" "}
                              of{" "}
                              <Text style={styles.resultBold}>{item.itemName}</Text> (
                              {item.category})
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.resultEmpty}>
                          No valid items were processed.
                        </Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* <ReceiptScan showModal={showModal} handleCloseModal={handleCloseModal}/> */}
      {showModal && <ReceiptScan showModal={showModal} handleCloseModal={handleCloseModal}/>}


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
