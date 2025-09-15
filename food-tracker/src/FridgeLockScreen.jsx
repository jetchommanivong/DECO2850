import React, { useState } from "react";
import ItemCard from "./ItemCard";
import "./FridgeLockScreen.css";

export default function FridgeLockScreen() {

  //hard code setting information on expiry dates and claiming of items
  const [items, setItems] = useState([
    { name: "Milk", expiry: "2025-09-15", icon: "/icons/milk.png", quantity: "1 carton", claimedBy: "Mary", recipes: ["Pancakes", "Oats"] },
    { name: "Broccoli", expiry: "2025-09-18", icon: "/icons/broccoli.png", quantity: "1 bag", claimedBy: "John", recipes: ["Stir-fry Beef", "Broccoli Chips"] },
    { name: "Apples", expiry: "2025-09-22", icon: "/icons/apple.png", className: "apple-icon", quantity: "6 pieces" },
  ]);


  const removeItem = (name) => {
    setItems(items.filter((item) => item.name !== name));
  };

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryClass = (daysLeft) => {
    if (daysLeft <= 0) return "expired";
    if (daysLeft === 1) return "urgent";
    if (daysLeft <= 3) return "warning";
    return "safe";
  };

  const groupedItems = { Today: [], "This Week": [], "Next Week": [] };
  items.forEach((item) => {
    const daysLeft = getDaysLeft(item.expiry);
    if (daysLeft <= 0) groupedItems.Today.push(item);
    else if (daysLeft <= 7) groupedItems["This Week"].push(item);
    else if (daysLeft <= 14) groupedItems["Next Week"].push(item);
  });


  
  const urgentCount = items.filter((item) => getDaysLeft(item.expiry) <= 3).length;
  const maxItems = items.length || 1;
  const barWidth = (urgentCount / maxItems) * 100;

  return (
    
    
    //for the bar above the expiry dates. Acting as a placeholder for the trash pile that increases when the expiry items increase
    <div className="lock-screen">
      <h1>Expiring Items</h1>
      <div className="status-bar-container">
        <div
          className="status-bar-fill"
          style={{
            width: `${barWidth}%`,
            backgroundColor:
              urgentCount / maxItems > 0.66 ? "red" : //math 
              urgentCount / maxItems > 0.33 ? "orange" : "green",
          }}
        />
      </div>

      {Object.entries(groupedItems).map(([groupName, groupItems]) =>
        groupItems.length > 0 && (
          <div key={groupName} className="group">
            <h2>{groupName}</h2>
            {groupItems.map((item) => (
              <ItemCard key={item.name} item={item} removeItem={removeItem} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
