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
  Meats: "#E67E52",       // muted warm orange
  Vegetables: "#7DCE82",  // soft green
  Dairy: "#F9E79F",       // pale creamy yellow
  Fruits: "#F1948A",      // soft red-pink
  Other: "#BDC3C7",       // neutral grey
};

export default function InventoryPage({
  items = [],
  onUpdateQuantity,
  onAddItem,
  onLogAction,
}) {
  const navigation = useNavigation?.();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [resultJSON, setResultJSON] = useState(null);

  const householdMembers = [
    { member_id: 1, member_name: "Jack" },
    { member_id: 2, member_name: "Jill" },
    { member_id: 3, member_name: "John" },
  ];

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

  const handleSlicePress = (sliceName, scale) => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setSelectedCategory(selectedCategory === sliceName ? null : sliceName);
  };

  // --- Voice control ---
  const handleStartLogging = () => {
    setTranscript("");
    setIsRecording(true);
    showToast("🎤 Recording started — speak now!", "success");

    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const recog = new SR();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-AU";

        recog.onresult = (e) => {
          const t = Array.from(e.results)
            .map((r) => r[0].transcript)
            .join(" ")
            .trim();
          if (t) setTranscript(t);
        };
        recog.onend = () => setIsRecording(false);
        try {
          recog.start();
          window.__activeRecog = recog;
        } catch {}
      } else {
        showToast("Speech recognition not supported.", "error");
      }
    }
  };

  const handleStopLogging = () => {
    setIsRecording(false);
    showToast("🛑 Recording stopped.", "success");
    if (typeof window !== "undefined" && window.__activeRecog) {
      try {
        window.__activeRecog.stop();
      } catch {}
    }
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

      <Text style={styles.pageHeader}>Fridge Composition</Text>

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

            {/* 🔵 Legend */}
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


      {/* 🎙 Voice Logging Section */}
      <View style={{ width: "100%", maxWidth: 420, marginTop: 20, alignItems: "center" }}>
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
      </View>

      {/* 📦 Category Details */}
      {selectedCategory && categories[selectedCategory] && (
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
      )}

      {!!toast.message && (
        <View
          style={[
            styles.toast,
            toast.type === "error" ? styles.toastError : styles.toastSuccess,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </ScrollView>
  );
}
