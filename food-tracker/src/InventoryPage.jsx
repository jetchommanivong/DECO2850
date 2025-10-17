import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import styles from "../src/InventoryPageStyles";

// Screen width for chart sizing
const chartWidth = Math.min(Dimensions.get("window").width * 0.92, 500);

// Category color map (kept from your original)
const CATEGORY_COLORS = {
  Meats: "#FF4C4C",
  Vegetables: "#4CAF50",
  Dairy: "#FFEB3B",
  Fruits: "#FF9800",
  Other: "#9E9E9E",
};

export default function InventoryPage({ items = [], onUpdateQuantity, onAddItem, onLogAction }) {
  // -------------------- UI/State --------------------
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Voice logging + member selection
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null); // web SpeechRecognition instance
  const [resultJSON, setResultJSON] = useState(null);

  // Demo household members (same as before)
  const householdMembers = [
    { member_id: 1, member_name: "Jack" },
    { member_id: 2, member_name: "Jill" },
    { member_id: 3, member_name: "John" },
  ];

  // -------------------- Derived Data --------------------
  // Group items by category
  const categories = useMemo(() => {
    const grouped = {};
    items.forEach((item) => {
      const cat = item.category || "Other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [items]);

  // Data for chart
  const pieData = useMemo(
    () =>
      Object.keys(categories).map((cat) => ({
        name: cat,
        population: categories[cat].length,
        color: CATEGORY_COLORS[cat] || "#8884d8",
        legendFontColor: "#333",
        legendFontSize: 14,
      })),
    [categories]
  );

  // -------------------- Voice (Web) --------------------
  const startLoggingWeb = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Not supported", "Voice logging is only available on the web right now.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("Not supported", "Your browser doesn't support SpeechRecognition. Try Chrome.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "en-AU";
    recog.maxAlternatives = 1;

    let finalTranscript = "";

    recog.onstart = () => {
      setIsRecording(true);
      showToast("🎤 Recording started — speak now!", "success");
    };

    recog.onresult = (event) => {
      finalTranscript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();
    };

    recog.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsRecording(false);
      showToast(`Speech error: ${e.error}`, "error");
    };

    recog.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;

      if (finalTranscript) {
        setTranscript(finalTranscript);
        showToast("✅ Voice captured successfully!");
      } else {
        showToast("⚠️ No speech detected. Please try again.", "error");
      }
    };

    recognitionRef.current = recog;
    recog.start();
  };

  const stopLoggingWeb = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      showToast("🛑 Recording stopped.", "success");
    }
  };

  // -------------------- Parse Transcript --------------------
  const handleParseTranscript = async () => {
    if (!selectedMember || !transcript) {
      Alert.alert("Missing info", "Please select a member and provide a transcript.");
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

      if (!json.log || json.log[0]?.status !== "success") {
        showToast("❌ Unable to process — item not found or invalid input.", "error");
        return;
      }

      // Deduplicate
      const uniqueData = Array.from(
        new Map(
          json.log[0].data.map((item) => [`${item.itemName}-${item.action}`, item])
        ).values()
      );

      const addedItems = [];
      const removedItems = [];

      uniqueData.forEach((entry) => {
        if (entry.action === "remove") {
          const match = items.find(
            (i) => i.name.toLowerCase() === entry.itemName.toLowerCase()
          );
          if (match) {
            onUpdateQuantity?.(match.id, entry.quantity);
            onLogAction?.(selectedMember.member_id, "remove", entry.itemName, entry.quantity);
            removedItems.push(`${entry.quantity} ${entry.unit} of ${entry.itemName}`);
          }
        } else if (entry.action === "add") {
          // 🔹 Try to find if already exists, update instead of duplicating
          const existing = items.find(
            (i) => i.name.toLowerCase() === entry.itemName.toLowerCase()
          );
          if (existing) {
            onUpdateQuantity?.(existing.id, -entry.quantity); // negative removes - adds
          } else {
            const newItem = {
              id: Date.now().toString(),
              name: entry.itemName[0].toUpperCase() + entry.itemName.slice(1).toLowerCase(),
              category: entry.category || "Other",
              quantity: entry.quantity,
              unit: entry.unit || "pcs",
            };
            onAddItem?.(newItem);
          }
          onLogAction?.(selectedMember.member_id, "add", entry.itemName, entry.quantity);
          addedItems.push(`${entry.quantity} ${entry.unit} of ${entry.itemName}`);
        }

      });

      if (addedItems.length || removedItems.length) {
        const addedText = addedItems.length ? `Added ${addedItems.join(", ")}` : "";
        const removedText = removedItems.length ? `Removed ${removedItems.join(", ")}` : "";
        const message = `${addedText}${addedText && removedText ? " and " : ""}${removedText}.`;
        showToast(`✅ ${message}`, "success");
      }
    } catch (err) {
      console.error("Error parsing transcript:", err);
      showToast("❌ Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Render --------------------
  return (
    <ScrollView
      contentContainerStyle={styles.inventoryPage}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.categoryTitle}>Fridge Inventory</Text>

      {/* Toast */}
      {toast.message ? (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      ) : null}

      {/* Pie Chart */}
      {pieData.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={240}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"10"}
            center={[0, 0]}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: () => "#333",
            }}
            absolute
            hasLegend={true}
            // Tap slice → set category
            onDataPointClick={({ index }) => {
              const tapped = pieData[index]?.name;
              if (tapped) setSelectedCategory((prev) => (prev === tapped ? null : tapped));
            }}
          />
          {/* Quick tap targets to mirror click behavior even if onDataPointClick varies across platforms */}
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
              {pieData.map((d) => (
                <TouchableOpacity
                  key={d.name}
                  onPress={() => setSelectedCategory((prev) => (prev === d.name ? null : d.name))}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    margin: 4,
                    backgroundColor: selectedCategory === d.name ? "#eef7ff" : "#fff",
                  }}
                >
                  <Text style={{ color: "#333", fontWeight: "600" }}>
                    {d.name} ({d.population})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <Text style={{ color: "#666" }}>No items left in the fridge.</Text>
      )}

      {/* Selected Category List */}
      {selectedCategory && categories[selectedCategory] && (
        <View style={styles.categoryItems}>
          <Text style={styles.categoryTitle}>{selectedCategory}</Text>
          <View style={styles.itemList}>
            {categories[selectedCategory].map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemText}>
                  {item.name} — {item.quantity} {item.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Voice Logging & Member Flow */}
      <View style={{ width: "100%", maxWidth: 420, marginTop: 12 }}>
        {!showMemberSelection ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryBtn]}
            onPress={() => setShowMemberSelection(true)}
          >
            <Text style={styles.primaryBtnText}>Log</Text>
          </TouchableOpacity>
        ) : !selectedMember ? (
          <View>
            <Text style={[styles.categoryTitle, { marginBottom: 8 }]}>
              Who are you logging as?
            </Text>

            <View style={styles.householdMember}>
              {householdMembers.map((m) => (
                <TouchableOpacity
                  key={m.member_id}
                  style={styles.householdMemberButton}
                  onPress={() => setSelectedMember(m)}
                >
                  <Text style={styles.householdMemberButtonText}>{m.member_name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMemberSelection(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Logging as pill */}
            <View style={styles.logFor}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={styles.logLabel}>Logging for:</Text>
                <Text style={{ fontWeight: "700" }}>{selectedMember.member_name}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeUserBtn}
                onPress={() => setSelectedMember(null)}
              >
                <Text style={styles.changeUserBtnText}>Change User</Text>
              </TouchableOpacity>
            </View>

            {/* Microphone controls */}
            {!transcript ? (
              <View style={styles.micSection}>
                {!isRecording ? (
                  <TouchableOpacity
                    style={[styles.button, styles.primaryBtn]}
                    onPress={startLoggingWeb}
                  >
                    <Text style={styles.primaryBtnText}>🎤 Start Logging</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={{ alignItems: "center", marginBottom: 8 }}>
                      <View style={styles.micDot} />
                      <Text style={styles.micLabel}>Listening…</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryBtn]}
                      onPress={stopLoggingWeb}
                    >
                      <Text style={styles.secondaryBtnText}>⏹ Stop Logging</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <>
                <Text style={{ marginBottom: 8, color: "#333" }}>
                  Detected: “{transcript}”
                </Text>

                <TouchableOpacity
                  style={[styles.button, styles.primaryBtn]}
                  onPress={handleParseTranscript}
                  disabled={loading}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? "Processing..." : "Confirm & Process"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryBtn]}
                  onPress={() => setTranscript("")}
                >
                  <Text style={styles.secondaryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                // Reset flow
                setTranscript("");
                setSelectedMember(null);
                setShowMemberSelection(false);
                if (isRecording) stopLoggingWeb();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Result cards from backend parse */}
      {resultJSON?.log && (
        <View style={styles.resultSection}>
          <Text style={styles.categoryTitle}>Action Summary</Text>
          {resultJSON.log.map((entry, idx) => (
            <View
              key={idx}
              style={[
                styles.resultCard,
                entry.status === "success"
                  ? styles.resultCardSuccess
                  : styles.resultCardUnsuccessful,
              ]}
            >
              <Text style={styles.resultDescription}>{entry.description}</Text>

              {entry.data && entry.data.length > 0 ? (
                <View>
                  {entry.data.map((item, i) => (
                    <View key={i} style={styles.resultItem}>
                      <Text style={styles.itemText}>
                        <Text style={{ fontWeight: "700" }}>
                          {
                            householdMembers.find((m) => m.member_id === item.member)
                              ?.member_name ?? "Someone"
                          }
                        </Text>{" "}
                        {item.action === "add" ? "added" : "removed"}{" "}
                        <Text style={{ fontWeight: "700" }}>
                          {item.quantity} {item.unit}
                        </Text>{" "}
                        of{" "}
                        <Text style={{ fontWeight: "700" }}>{item.itemName}</Text>{" "}
                        ({item.category})
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.resultEmpty}>No valid items were processed.</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
    </ScrollView>
  );
}
