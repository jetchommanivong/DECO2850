import React, { useState } from "react";
import "./ReceiptScan.css";

export default function ReceiptScan({ onAddItem }) {
  //hardcoded receipt items for MAKE ME A SANDWICH
  const receiptItems = [
    { id: 1, name: "Ham", category: "Meats", quantity: "100g" },
    { id: 2, name: "Tomato", category: "Fruits", quantity: "1" },
    { id: 3, name: "Cheese", category: "Dairy", quantity: "10 Slices" },
    { id: 4, name: "Lettuce", category: "Vegetables", quantity: "1" },
    { id: 5, name: "Butter", category: "Dairy", quantity: "200g" },
  ];

  const [added, setAdded] = useState([]);

  const handleAdd = (item) => {
    if (!added.includes(item.id)) {
      onAddItem(item); 
      setAdded([...added, item.id]);
    }
  };

  return (
    <div className="receipt-page">
      <h1>Receipt Scan</h1>
      <p>Click "Add" to send items to inventory.</p>

      <ul className="receipt-list">
        {receiptItems.map((item) => (
          <li key={item.id} className="receipt-item">
            <span>
              {item.quantity} {item.name} ({item.category})
            </span>
            <button
              onClick={() => handleAdd(item)}
              disabled={added.includes(item.id)}
            >
              {added.includes(item.id) ? "✔ Added" : "Add"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
