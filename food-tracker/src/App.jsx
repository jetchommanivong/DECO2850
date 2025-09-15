import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FridgeLockScreen from "./FridgeLockScreen";
import RecipePage from "./RecipePage";
import InventoryPage from "./InventoryPage";
import ReceiptScan from "./ReceiptScan";
import NavBar from "./NavBar";
import { useState } from "react";

export default function App() {

  //sets inventory of fridge at start of app 
  const [inventory, setInventory] = useState([
    { id: "x1", name: "Milk", category: "Dairy", quantity: "1 carton" },
    { id: "x2", name: "Chicken Breast", category: "Meats", quantity: "1kg" },
    { id: "x3", name: "Broccoli", category: "Vegetables", quantity: "2" },
    { id: "x4", name: "Apples", category: "Fruits", quantity: "6" },
  ]);

  const handleAddItem = (item) => {
    setInventory((prev) => [...prev, item]);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<FridgeLockScreen />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route path="/inventory" element={<InventoryPage items={inventory} />} />
        <Route path="/receipt" element={<ReceiptScan onAddItem={handleAddItem} />} />
      </Routes>
      <NavBar />
    </Router>
  );
}
