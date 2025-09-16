import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./InventoryPage.css";

export default function InventoryPage({ items, onUpdateQuantity }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    </div>
  );
}
