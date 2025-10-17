import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./InventoryPage.css";

export default function InventoryPage({ items, onUpdateQuantity, onAddItem }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resultJSON, setResultJSON] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

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
    Meats: "#FF4C4C",
    Vegetables: "#4CAF50",
    Dairy: "#FFEB3B",
    Fruits: "#FF9800",
    Other: "#9E9E9E",
  };

  const householdMembers = [
    { member_id: 1, member_name: "Jack" },
    { member_id: 2, member_name: "Jill" },
    { member_id: 3, member_name: "John" },
  ];

  // --- Voice Recording ---
  const handleStartLogging = () => {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert("Your browser doesn't support speech recognition.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;       // 🔹 keeps listening until manually stopped
  recognition.interimResults = true;   // 🔹 gives live feedback as user speaks
  recognition.lang = "en-AU";          // adjust if you want different accent
  recognition.maxAlternatives = 1;

  let finalTranscript = "";
  let silenceTimer = null;
  const silenceDelay = 5000; // 🔹 5 seconds of silence before stopping

  setIsRecording(true);

  recognition.onstart = () => {
    console.log("🎙️ Listening...");
  };

  recognition.onresult = (event) => {
    clearTimeout(silenceTimer);

    // combine results
    const transcript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(" ")
      .trim();

    finalTranscript = transcript;
    setTranscript(transcript);

    // reset the silence timer every time user speaks
    silenceTimer = setTimeout(() => {
      console.log("⏹️ Auto-stopping after silence");
      recognition.stop();
    }, silenceDelay);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    setIsRecording(false);
  };

  recognition.onend = () => {
    console.log("🛑 Recognition ended");
    clearTimeout(silenceTimer);
    setIsRecording(false);

    if (finalTranscript.trim() === "") {
      setToast({ type: "error", message: "No speech detected. Try again." });
    } else {
      setToast({ type: "success", message: "Voice captured successfully!" });
    }
  };

  recognition.start();
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
            onUpdateQuantity(match.id, item.quantity);
            removedItems.push(`${item.quantity} ${item.unit} of ${item.itemName}`);
          } else {
            console.warn(`⚠️ Could not find ${item.itemName} in inventory.`);
          }
        } else if (item.action === "add") {
          onAddItem({
            id: Date.now().toString(),
            name: item.itemName,
            category: item.category || "Other",
            quantity: item.quantity,
            unit: item.unit,
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

    } catch (err) {
      console.error("Error parsing transcript to JSON:", err);
      showToast("❌ Failed to connect to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="inventory-page">
    <h1>Fridge Inventory</h1>

    {/* ✅ Toast */}
    {toast.message && <div className={`toast ${toast.type}`}>{toast.message}</div>}

    {/* ✅ Pie Chart */}
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

    {/* ✅ Selected Category */}
    {selectedCategory && categories[selectedCategory] && (
      <div className="category-items">
        <h2>{selectedCategory}</h2>
        <ul>
          {categories[selectedCategory].map((item) => (
            <li key={item.id}>
              {item.name} – {item.quantity} {item.unit}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* ✅ Voice Logging */}
    <div className="voice-logging-section">
      {!showMemberSelection ? (
        <button
          onClick={() => setShowMemberSelection(true)}
          className="primary-btn"
        >
          Log
        </button>
      ) : (
        <div className="member-selection">
          {!selectedMember ? (
            <div>
              <p>Who are you logging as?</p>
              <div className="household-member">
                {householdMembers.map((m) => (
                  <button
                    key={m.member_id}
                    onClick={() => setSelectedMember(m)}
                    className={
                      selectedMember?.member_id === m.member_id ? "selected" : ""
                    }
                  >
                    {m.member_name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMemberSelection(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="log-prompt">
              <div className="log-for">
                <div className="log-info">
                  <strong>Logging for:</strong>
                  <span>{selectedMember.member_name}</span>
                </div>
                <button className="change-user-btn" onClick={() => setSelectedMember(null)}>
                  Change User
                </button>
              </div>


              {!transcript ? (
                <div className="mic-section">
                  {!isRecording ? (
                    <button
                      onClick={handleStartLogging}
                      className="primary-btn"
                    >
                      🎤 Start Logging
                    </button>
                  ) : (
                    <div className="mic-visual">
                      <div className="mic-dot" />
                      <p>Listening...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p>Detected: "{transcript}"</p>
                  <button
                    onClick={handleParseTranscript}
                    disabled={loading}
                    className="primary-btn"
                  >
                    {loading ? "Processing..." : "Confirm & Process"}
                  </button>
                  <button
                    onClick={() => setTranscript("")}
                    className="secondary-btn"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowMemberSelection(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* ✅ Result Section */}
    {resultJSON && resultJSON.log && (
      <div className="result-section">
        <h3>Action Summary</h3>
        {resultJSON.log.map((entry, idx) => (
          <div
            key={idx}
            className={`result-card ${
              entry.status === "success" ? "success" : "error"
            }`}
          >
            <p className="result-description">{entry.description}</p>
            {entry.data && entry.data.length > 0 ? (
              <ul className="result-list">
                {entry.data.map((item, i) => (
                  <li key={i} className="result-item">
                    <strong>
                      {householdMembers.find(
                        (m) => m.member_id === item.member
                      )?.member_name || "Someone"}
                    </strong>{" "}
                    {item.action === "add" ? "added" : "removed"}{" "}
                    <strong>
                      {item.quantity} {item.unit}
                    </strong>{" "}
                    of <strong>{item.itemName}</strong> ({item.category})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="result-empty">
                {entry.status === "unsuccessful"
                  ? "❌ Could not process your request. Try again."
                  : "No valid items were processed."}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

}
