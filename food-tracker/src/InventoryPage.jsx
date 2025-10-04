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

  // Group items by category
  const categories = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || []).concat(item);
    return acc;
  }, {});

  const data = Object.keys(categories).map((cat) => ({
    name: cat,
    value: categories[cat].length,
  }));

  const CATEGORY_COLORS = {
    Meats: "#FF4C4C",
    Vegetables: "#4CAF50",
    Dairy: "#FFEB3B",
    Fruits: "#FF9800",
  };

  // household mock
  const householdMembers = [
    { member_id: 1, member_name: "Jack" },
    { member_id: 2, member_name: "Jill" },
    { member_id: 3, member_name: "John" },
  ];

  // --- Voice recognition ---
  const handleStartLogging = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => console.log("🎤 Listening...");
    recognition.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      console.log("Transcript:", transcriptText);
      setTranscript(transcriptText);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
    recognition.start();
  };

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

      if (json.log && json.log[0].status === "success") {
        json.log[0].data.forEach((item) => {
          if (item.action === "remove") {
            // Find the matching item in your React inventory by name
            const match = items.find(
              (i) => i.name.toLowerCase() === item.itemName.toLowerCase()
            );

            if (match) {
              onUpdateQuantity(match.id, item.quantity);
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
          }

          // ✅ Log who performed this
          onLogAction(
            selectedMember.member_id,
            item.action,
            item.itemName,
            item.quantity
          );
        });
      }
    } catch (err) {
      console.error("Error parsing transcript to JSON:", err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="inventory-page">
      <h1>Fridge Inventory</h1>

      {/* Pie chart */}
      {data.length > 0 ? (
        <PieChart width={300} height={350}>
          <Pie
            data={data}
            cx={150}
            cy={150}
            outerRadius={100}
            dataKey="value"
            onClick={(entry) =>
              setSelectedCategory(selectedCategory === entry.name ? null : entry.name)
            }
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={CATEGORY_COLORS[entry.name] || "#8884d8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      ) : (
        <p>No items left in the fridge.</p>
      )}

      {/* Category items */}
      {selectedCategory && (
        <div className="category-items">
          <h2>{selectedCategory}</h2>
          <ul>
            {categories[selectedCategory].map((item) => (
              <li key={item.id}>
                {item.name} – {item.quantity} {item.unit}
                <button onClick={() => onUpdateQuantity(item.id, 1)}>-1</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Voice logging flow */}
      <div className="voice-logging-section">
        {!showMemberSelection ? (
          <button onClick={() => setShowMemberSelection(true)}>Log</button>
        ) : !selectedMember ? (
          <div>
            <p>Who are you logging as?</p>
            {householdMembers.map((m) => (
              <button key={m.member_id} onClick={() => setSelectedMember(m)}>
                {m.member_name}
              </button>
            ))}
            <button onClick={() => setShowMemberSelection(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <p><strong>Logging for:</strong> {selectedMember.member_name}</p>
            {!transcript ? (
              <button onClick={handleStartLogging}>Start Logging</button>
            ) : (
              <>
                <p>Detected: "{transcript}"</p>
                <button onClick={handleParseTranscript} disabled={loading}>
                  {loading ? "Processing..." : "Confirm & Process"}
                </button>
                <button onClick={() => setTranscript("")}>Try Again</button>
              </>
            )}
            <button onClick={() => setShowMemberSelection(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Result debug */}
      {resultJSON && (
        <pre style={{ background: "#f5f5f5", padding: "1rem" }}>
          {JSON.stringify(resultJSON, null, 2)}
        </pre>
      )}
    </div>
  );
}
