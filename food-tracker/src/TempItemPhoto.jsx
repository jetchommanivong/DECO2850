import React, { useState } from "react";
import "./ReceiptScan.css";

export default function TempItemPhoto({ inventory, onUpdateQuantity }) {
  const prototypeItems = ["Ham", "Tomato", "Cheese", "Lettuce", "Butter"];

  const [amounts, setAmounts] = useState({});
  const [removingIds, setRemovingIds] = useState([]);

  const handleInputChange = (id, value) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleTake = (item) => {
    const amount = parseFloat(amounts[item.id]);
    if (isNaN(amount) || amount <= 0) return;

    // Fade-out only if item will be fully removed
    const willRemoveCompletely = amount >= item.quantity;
    if (willRemoveCompletely) setRemovingIds((prev) => [...prev, item.id]);

    // Update inventory
    onUpdateQuantity(item.id, amount);

    // Clear input
    setAmounts((prev) => ({ ...prev, [item.id]: "" }));

    // Remove from removingIds after fade-out
    if (willRemoveCompletely) {
      setTimeout(() => {
        setRemovingIds((prev) => prev.filter((id) => id !== item.id));
      }, 400);
    }
  };

  // Filter items for the page based on prototypeItems and current inventory
  const itemsToShow = inventory.filter(
    (item) => prototypeItems.includes(item.name)
  );

  return (
    <div className="receipt-page">
      <h1>Photo of Taken Ingredients</h1>
      <p>Enter the quantity removed from the fridge</p>

      {itemsToShow.length > 0 ? (
        <ul className="receipt-list">
          {itemsToShow.map((item) => (
            <li
              key={item.id}
              className={`receipt-item ${
                removingIds.includes(item.id) ? "removing" : ""
              }`}
            >
              <span>
                {item.quantity} {item.unit} {item.name} ({item.category})
              </span>
              <input
                type="number"
                placeholder="Amount to take"
                value={amounts[item.id] || ""}
                onChange={(e) => handleInputChange(item.id, e.target.value)}
                min="0"
                max={item.quantity}
              />
              <button onClick={() => handleTake(item)}>Take</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>All items in this prototype set have been removed.</p>
      )}
    </div>
  );
}
