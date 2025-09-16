import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import FridgeLockScreen from "./FridgeLockScreen";
import RecipePage from "./RecipePage";
import InventoryPage from "./InventoryPage";
import ReceiptScan from "./ReceiptScan";
import TempItemPhoto from "./TempItemPhoto";
import NavBar from "./NavBar";

export default function App() {
  // Initial inventory
  const [inventory, setInventory] = useState([
  { id: "x1", name: "Milk", category: "Dairy", quantity: 1, unit: "carton" },
  { id: "x2", name: "Chicken Breast", category: "Meats", quantity: 1000, unit: "g" },
  { id: "x3", name: "Broccoli", category: "Vegetables", quantity: 2, unit: "pieces" },
  { id: "x4", name: "Tomato", category: "Fruits", quantity: 1, unit: "pieces" },
  { id: "x5", name: "Lettuce", category: "Vegetables", quantity: 1, unit: "pieces" },
]);

  // Add new item (from ReceiptScan)
  const handleAddItem = (item) => {
    setInventory((prev) => [...prev, item]);
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


  return (
    <Router>
      <Routes>
        <Route path="/" element={<FridgeLockScreen />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route
          path="/inventory"
          element={
            <InventoryPage
              items={inventory}
              onUpdateQuantity={handleUpdateQuantity}
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
      </Routes>
      <NavBar />
    </Router>
  );
}
