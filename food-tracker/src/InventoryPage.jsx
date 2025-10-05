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

        // ✅ Stop if unsuccessful
        if (!json.log || json.log[0].status !== "success") {
          console.warn("Transcript validation failed:", json);
          return;
        }

        // ✅ Deduplicate similar items by name + action
        const uniqueData = Array.from(
          new Map(json.log[0].data.map(item => [`${item.itemName}-${item.action}`, item])).values()
        );

        // ✅ Apply changes to inventory
        uniqueData.forEach((item) => {
          if (item.action === "remove") {
            // Find matching item in the inventory
            const match = items.find(
              (i) => i.name.toLowerCase() === item.itemName.toLowerCase()
            );
            if (match) {
              onUpdateQuantity(match.id, item.quantity);
            } else {
              console.warn(`⚠️ Could not find ${item.itemName} in inventory.`);
            }
          } else if (item.action === "add") {
            // Use AI’s category instead of hardcoded “Misc”
            onAddItem({
              id: Date.now().toString(),
              name: item.itemName,
              category: item.category || "Other",
              quantity: item.quantity,
              unit: item.unit,
            });
          }

          // ✅ Optional logging — who did what
          console.log(
            `${selectedMember.member_name} ${item.action}ed ${item.quantity} ${item.unit} of ${item.itemName} (${item.category})`
          );
        });

        // ✅ Generate a human-readable summary
        const readableSummary = uniqueData
          .map(
            (item) =>
              `${selectedMember.member_name} ${item.action}ed ${item.quantity} ${item.unit} of ${item.itemName} (${item.category})`
          )
          .join("\n");

        setResultJSON({
          message: `Successfully validated ${uniqueData.length} item(s) for ${selectedMember.member_name}`,
          details: readableSummary,
        });
      } catch (err) {
        console.error("Error parsing transcript to JSON:", err);
      } finally {
        setLoading(false);
      }
    };




  return (
  <div className="inventory-page">
    <h1>Fridge Inventory</h1>

    {/* --- Pie Chart Section --- */}
    <div className="chart-container">
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
    </div>

    {selectedCategory && (
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


    {/* --- Voice Logging Section --- */}
    <div className="voice-logging-section">
      {!showMemberSelection ? (
        <button onClick={() => setShowMemberSelection(true)} className="primary-btn">
          Log
        </button>
      ) : !selectedMember ? (
        <div>
          <p>Who are you logging as?</p>
          <div className="household-member">
            {householdMembers.map((m) => (
              <button key={m.member_id} onClick={() => setSelectedMember(m)}>
                {m.member_name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowMemberSelection(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <div className="log-for">
            <strong>Logging for:</strong> {selectedMember.member_name}
          </div>

          {!transcript ? (
            <div className="start-logging">
              <p>
                Click “Start Logging” and say something like:
                <br />
                <em>“I used 2 eggs and 1 slice of cheese.”</em>
              </p>
              <button onClick={handleStartLogging} className="primary-btn">
                Start Logging
              </button>
            </div>
          ) : (
            <div>
              <div className="detected-text">
                <strong>Detected:</strong> "{transcript}"
              </div>
              <button onClick={handleParseTranscript} disabled={loading} className="primary-btn">
                {loading ? "Processing..." : "Confirm & Process"}
              </button>
              <button onClick={() => setTranscript("")} className="secondary-btn">
                Try Again
              </button>
            </div>
          )}

          <button onClick={() => setShowMemberSelection(false)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
        {resultJSON && (
          <div className="result-section">
            <h3>Action Summary</h3>
            <div className="result-card success">
              <p className="result-description">{resultJSON.message}</p>
              <pre className="result-details">{resultJSON.details}</pre>
            </div>
          </div>
        )}
  </div>
);
}
