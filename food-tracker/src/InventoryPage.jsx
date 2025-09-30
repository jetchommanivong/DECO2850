import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./InventoryPage.css";

export default function InventoryPage({ items, onUpdateQuantity }) {
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

  // Prepare data for pie chart
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

  // Reset selected category if it no longer exists
  if (selectedCategory && !categories[selectedCategory]) {
    setSelectedCategory(null);
  }

  const householdMembers = [
    {
      member_id: 1,
      member_name: "Jack",
      member_icon: "image1.jpg",
    },
    {
      member_id: 2,
      member_name: "Jill",
      member_icon: "image1.jpg",
    },
    {
      member_id: 3,
      member_name: "John",
      member_icon: "image1.jpg",
    },
  ];

  const inventory = [
    {
      item_id: 1,
      item_name: "Tomato",
    },
    {
      item_id: 2,
      item_name: "Onion",
    },
    {
      item_id: 3,
      item_name: "Egg",
    },
    {
      item_id: 4,
      item_name: "Bread",
    },
    {
      item_id: 5,
      item_name: "Scallion"
    },
    {
      item_id: 6,
      item_name: "Garlic"
    }
  ];

  const membersItems = [
    {
      id: 1,
      item_id: 1,
      member_id: 1,
      quantity: 3,
    },
    {
      id: 2,
      item_id: 3,
      member_id: 1,
      quantity: 3,
    },
    {
      id: 3,
      item_id: 3,
      member_id: 2,
      quantity: 11,
    },
    {
      id: 4,
      item_id: 3,
      member_id: 3,
      quantity: 8,
    },
    {
      id: 5,
      item_id: 5,
      member_id: 2,
      quantity: 8,
    },
    {
      id: 6,
      item_id: 6,
      member_id: 2,
      quantity: 8,
    },
  ];

  const handleShowLog = () => {
    setShowMemberSelection(true);
    setSelectedMember(null);
    setTranscript("");
    setResultJSON(null);
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleStartLogging = () => {
    // use mock transcript for now
    // TODO: implement speech to text
    const mockTranscripts = [
      "I used 2 eggs and 1 slice of cheese",
      "I added 5 tomatoes to the fridge", 
      "I consumed half an onion",
      "I bought 12 eggs and 6 slices of bread",
      "I used 2 eggs, 1 stick of scallion, and 1 clove of garlic to make ramen"
    ];
    
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    setTranscript(randomTranscript);
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
          inventory,
          membersItems,
          householdMembers,
        }),
      });
      const json = await res.json();
      setResultJSON(json);
    } catch (err) {
      console.error("Error parsing transcript to JSON:", err);
    } finally {
      setLoading(false);
    }
  };

  // reset
  const handleResetLogging = () => {
    setShowMemberSelection(false);
    setSelectedMember(null);
    setTranscript("");
    setResultJSON(null);
  };

  return (
    <div className="inventory-page">
      <h1>Fridge Inventory</h1>

      {data.length > 0 ? (
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

      {/* Items list for selected category */}
      {selectedCategory && categories[selectedCategory]?.length > 0 && (
        <div className="category-items">
          <h2>{selectedCategory}</h2>
          <ul>
            {categories[selectedCategory].map((item) => (
              <li key={item.id}>
                {item.name} – {item.quantity} {item.unit}{" "}
                <button onClick={() => onUpdateQuantity(item.id, 1)}>-1</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Voice Logging Section */}
      <div className="voice-logging-section">       
        {!showMemberSelection ? (
          <button 
            onClick={handleShowLog}
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
                  {householdMembers.map((member) => (
                    <button
                      key={member.member_id}
                      onClick={() => handleMemberSelect(member)}
                    >
                      {member.member_name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleResetLogging}
                  className="cancel-button"
                  onMouseOver={(e) => e.target.style.backgroundColor = '#D1D1D1'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="log-prompt">
                <div className="log-for">
                  <strong>Logging for: </strong>{selectedMember.member_name}
                </div>
                
                {!transcript ? (
                  <div>
                    <p>
                      Click "Start Logging" and tell us what you used or added 
                      (e.g., "I used 2 eggs and 1 slice of cheese").
                    </p>
                    <button
                      onClick={handleStartLogging}   
                      className="primary-btn"                   
                    >
                      Start Logging
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="detected-text">
                      <strong>Detected:</strong> "{transcript}"
                    </div>
                    <div>
                      <button
                        onClick={handleParseTranscript}
                        disabled={loading}
                        className="primary-btn"
                      >
                        {loading ? 'Processing...' : 'Confirm & Process'}
                      </button>
                      <button
                        onClick={() => setTranscript("")}
                        disabled={loading}
                        className="secondary-btn"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleResetLogging}
                  className="cancel-button"
                  onMouseOver={(e) => e.target.style.backgroundColor = '#E1E2E3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {resultJSON && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Result:</h4>
          <pre className="result-json" style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '5px', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(resultJSON, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
