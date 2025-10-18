import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useItems, useMembers, store } from "./store";
import "./InventoryPage.css";

export default function InventoryPage() {
  // Get data from store
  const items = useItems();
  const householdMembers = useMembers();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resultJSON, setResultJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [overlayTitle, setOverlayTitle] = useState("");
  const [transcriptProcessed, setTransciptProcessed] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      setOverlayTitle(`Logging for: ${selectedMember.member_name}`);
    } else {
      setOverlayTitle("Who are you logging as?");
    }
  }, [selectedMember]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // Group items by category
  const categories = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || []).concat(item);
    return acc;
  }, {});

  // Pie chart data
  const data = Object.keys(categories).map((cat) => ({
    name: cat,
    value: categories[cat].length,
  }));

  const CATEGORY_COLORS = {
    Meats: "#BC4749",
    Vegetables: "#679436",
    Dairy: "#FFDB4C",
    Fruits: "#064789",
    Other: "#9E9E9E",
  };

  // Keep this outside the component scope
// --- Add this to your component’s useState section ---
const [recognition, setRecognition] = useState(null);

// --- Replace your old handleStartLogging and handleStopLogging with these ---
const handleStartLogging = () => {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert("Your browser doesn't support speech recognition.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recog = new SpeechRecognition();

  recog.continuous = true;
  recog.interimResults = false;
  recog.lang = "en-AU";
  recog.maxAlternatives = 1;

  let finalTranscript = "";

  recog.onstart = () => {
    setIsRecording(true);
    setToast({ type: "info", message: "🎤 Recording started — speak now!" });
    console.log("🎤 Listening...");
  };

  recog.onresult = (event) => {
    finalTranscript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(" ")
      .trim();
  };

  recog.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setToast({
      type: "error",
      message: `Speech recognition error: ${event.error}`,
    });
    setIsRecording(false);
  };

  recog.onend = () => {
    console.log("🛑 Recognition stopped");
    setIsRecording(false);
    setRecognition(null);

    if (finalTranscript.trim()) {
      setTranscript(finalTranscript);
      setToast({ type: "success", message: "✅ Voice captured successfully!" });
    } else {
      setToast({
        type: "error",
        message: "⚠️ No speech detected. Please try again.",
      });
    }
  };

  recog.start();
  setRecognition(recog);
};

const handleStopLogging = () => {
  if (recognition) {
    recognition.stop();
    setToast({ type: "info", message: "🛑 Recording stopped." });
    console.log("Manual stop triggered");
  } else {
    console.warn("⚠️ No active recognition instance found");
  }
};



  // --- Parse transcript ---
  const handleParseTranscript = async () => {
    if (!selectedMember || !transcript) {
      alert("Please select a member and provide a transcript");
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

      // Stop if unsuccessful
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
      setTransciptProcessed(true);

    } catch (err) {
      console.error("Error parsing transcript to JSON:", err);
      showToast("❌ Failed to connect to server.", "error");
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
    setTransciptProcessed(false);
  };

  const handleTryAgain = () => {
    setTranscript("");
    setToast({ message: "", type: "" });
    setResultJSON(null);
    setTransciptProcessed(false);
  };

  const handleRestartLogSameMember = () => {
    setToast({ message: "", type: "" });
    setTranscript("");
    setIsRecording(false);
    setResultJSON(null);
    setTransciptProcessed(false);
  }

  const handleCloseOverlay = () => {
    setToast({ message: "", type: "" });
    setTranscript("");
    setIsRecording(false);
    setResultJSON(null);
    setTransciptProcessed(false);
    setSelectedMember(null);
    setShowVoiceOverlay(false);
  }

  return (
  <div className="inventory-page">
    <div className="header">
      <h1>Fridge Inventory</h1>
      <button onClick={() => {
        setShowVoiceOverlay(true);
        setShowMemberSelection(true);
      }}>Voice Log</button>
    </div>

    {/* Main content */}
    <div className="main-content">
      <div className="pie-chart">
        {data && data.length > 0 ? (
          <PieChart width={300} height={350}>
            <Pie
              data={data}
              cx={150}
              cy={150}
              outerRadius={100}
              dataKey="value"
              onClick={(entry) =>
                setSelectedCategory(
                  selectedCategory === entry.name ? null : entry.name
                )
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.name] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="square"
              iconSize={15}
            />
          </PieChart>
        ) : (
          <p>No items left in the fridge.</p>
        )}
      </div>
      <div className="items">
        <div className="filter-chips">
          <button
            className={`filter-chip ${!selectedCategory ? "active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {Object.keys(categories).map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="items-list-section">
          <div className="items-list-container">
            {displayItems.length > 0 ? (
              <ul className="items-list">
                {displayItems.map((item) => (
                  <li key={item.id} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">
                      {item.quantity} {item.unit}
                    </span>
                    <button className="item-action-btn">⊖</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-items">No items in this category.</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* 🪄 Overlay backdrop */}
    {showVoiceOverlay && (
        <div
          className="voice-overlay-backdrop"
          onClick={handleCloseOverlay}
        ></div>
      )}

      {/* 🪄 Voice logging overlay */}
      <div className={`voice-overlay ${showVoiceOverlay ? "open" : ""}`}>
        <div className="voice-overlay-content">
          <div className="x-header">
            <button
              className="close-overlay-btn"
              onClick={handleCloseOverlay}
            >
              ✖
            </button>
          </div>
          <div className="overlay-main-content">
            <div className="voice-overlay-header">
              <h2>{overlayTitle}</h2>
            </div>
            
            {!selectedMember ? (
              <div className="option-section">
                <div className="regular-option">
                  {householdMembers.map((m) => (
                    <button key={m.member_id} onClick={() => setSelectedMember(m)} className="member-btn">
                      {m.member_name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="option-section">
              {!transcript ? (
                <div className="mic-section">
                  {!isRecording ? (
                    <div className="option-buttons">
                      <button onClick={handleStartLogging} className="main-action-btn">
                        Start Logging
                      </button>
                      <button onClick={handleSelectMember} className="regular-btn">
                        Change Member
                      </button>
                    </div>
                  ) : (
                    <div className="option-buttons">
                      <button className="main-action-btn" disabled>
                        Listening...
                      </button>
                      <button onClick={handleStopLogging} className="regular-btn">
                      ⏹ Stop Logging
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="transcript-main">
                  <div className="transcript-section">
                    <p>Detected:</p>
                    <div className="transcript">
                      <p>"{transcript}"</p>
                    </div>
                  </div>
                  {!transcriptProcessed ? (
                    <div className="option-section">
                      <button onClick={handleParseTranscript} disabled={loading} className="main-action-btn">
                        {loading ? "Processing..." : "Confirm & Process"}
                      </button>
                      <button onClick={handleTryAgain} className="regular-btn">
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="option-section">
                      <button onClick={handleRestartLogSameMember} className="main-action-btn">
                        Add Another Log
                      </button>
                      <button onClick={handleSelectMember} className="regular-btn">
                        Back to Select Member
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>

          <div className="toast-and-result">
            {/* ✅ Toast */}
            {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

            {/* JSON result display */}
            {resultJSON && resultJSON.log && (
              <div className="result-section">
                <h3>Action Summary</h3>
                {resultJSON.log.map((entry, idx) => (
                  <div key={idx} className={`result-card ${entry.status}`}>
                    <p className="result-description">{entry.description}</p>
                    {entry.data && entry.data.length > 0 ? (
                      <ul className="result-list">
                        {entry.data.map((item, i) => (
                          <li key={i} className="result-item">
                            <strong>
                              {householdMembers.find((m) => m.member_id === item.member)?.member_name || "Someone"}
                            </strong>{" "}
                            {item.action === "add" ? "added" : "removed"}{" "}
                            <strong>{item.quantity} {item.unit}</strong> of{" "}
                            <strong>{item.itemName}</strong> ({item.category})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="result-empty">No valid items were processed.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}