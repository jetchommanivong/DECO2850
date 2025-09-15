import React, { useState } from "react";
import "./RecipePage.css";

export default function RecipePage() {
  const recipes = [
    {
      name: "Pancakes",
      type: "Pancakes",
      image: "/icons/pancakes.jpg",
    },
    {
      name: "Stir-fry Beef",
      type: "Stir-fry Beef",
      image: "/icons/beef stir fry.jpg",
    },
  ];

  const [filter, setFilter] = useState("All");

  const filteredRecipes =
    filter === "All" ? recipes : recipes.filter((r) => r.type === filter);

  return (
    <div className="recipe-page">
      <h1>Recipes</h1>

      {/* Filter buttons */}
      <div className="recipe-filters">
        <button
          className={filter === "All" ? "active" : ""}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        <button
          className={filter === "Pancakes" ? "active" : ""}
          onClick={() => setFilter("Pancakes")}
        >
          Pancakes
        </button>
        <button
          className={filter === "Stir-fry Beef" ? "active" : ""}
          onClick={() => setFilter("Stir-fry Beef")}
        >
          Stir-fry Beef
        </button>
      </div>

      {/* Recipe grid */}
      <div className="recipe-list">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.name} className="recipe-card">
            <img src={recipe.image} alt={recipe.name} className="recipe-image" />
            <h3>{recipe.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
