import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import FridgeLockScreen from "./FridgeLockScreen";
import InventoryPage from "./InventoryPage";
import ReceiptScan from "./ReceiptScan";
import TempItemPhoto from "./TempItemPhoto";
import Household from "./Household";
import NavBar from "./NavBar";
import VoiceInput from "./VoiceInput";


export default function App() {
  // Initial inventory
  const [inventory, setInventory] = useState([
  { id: "x1", name: "Milk", category: "Dairy", quantity: 1, unit: "carton" },
  { id: "x2", name: "Chicken Breast", category: "Meats", quantity: 1000, unit: "g" },
  { id: "x3", name: "Broccoli", category: "Vegetables", quantity: 2, unit: "pieces" },
  { id: "x4", name: "Tomato", category: "Fruits", quantity: 1, unit: "pieces" },
  { id: "x5", name: "Lettuce", category: "Vegetables", quantity: 1, unit: "pieces" },
]);

  // Add new item or merge inventory updates
  const handleAddItem = (data) => {
    setInventory((prev) => {
      // Case 1: If it's an array (from a merged update)
      if (Array.isArray(data)) {
        return data;
      }

      // Case 2: If it's a single item
      const existing = prev.find(
        (i) => i.name.toLowerCase() === data.name.toLowerCase()
      );

      if (existing) {
        // Merge quantity if same item already exists
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + data.quantity }
            : i
        );
      }

      // Add new item entirely
      return [...prev, data];
    });
  };


  const handleUpdateQuantity = (id, amount) => {
  setInventory((prev) =>
    prev
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - amount, 0) }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

const [usageLogs, setUsageLogs] = useState([]);

// Log an action (for auditing / analytics later)
const handleLogAction = (memberId, action, itemName, quantity) => {
  setUsageLogs(prev => [
    ...prev,
    { memberId, action, itemName, quantity, timestamp: new Date().toISOString() }
  ]);
};


const handleTranscript = async (text) => {
  console.log("Transcript:", text);

  try {
    const response = await fetch("http://localhost:4000/api/parse-transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript: text,
        selectedMemberId: "user1", // change later to actual household member
        inventory: inventory.map((i) => ({
          item_id: i.id,
          item_name: i.name,
        })),
        membersItems: [], // depends on your design
        householdMembers: [], // depends on your design
      }),
    });

    const result = await response.json();
    console.log("Backend parsed:", result);

    // optionally: update inventory directly if backend returns structured items
  } catch (err) {
    console.error("Error sending transcript:", err);
  }
};



  return (
    <Router>
      <NavBar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<FridgeLockScreen />} />
          <Route
            path="/inventory"
            element={
              <InventoryPage
                items={inventory}
                onUpdateQuantity={handleUpdateQuantity}
                onAddItem={handleAddItem}
                onLogAction={handleLogAction}
              />
            }
          />
          <Route path="/receipt" element={<ReceiptScan onAddItem={handleAddItem} />} />
          <Route
            path="/tempitemphoto"
            element={
              <TempItemPhoto
                inventory={inventory}
                onUpdateQuantity={handleUpdateQuantity}
              />
            }
          />
          <Route path="/household" element={<Household />} />
        </Routes>
      </div>
    </Router>
  );
}
