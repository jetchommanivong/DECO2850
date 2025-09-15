import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="nav-bar">
      <button
        className={location.pathname === "/" ? "active" : ""}
        onClick={() => navigate("/")}
      >
        Fridge
      </button>
      <button
        className={location.pathname === "/recipes" ? "active" : ""}
        onClick={() => navigate("/recipes")}
      >
        Recipes
      </button>
      <button
        className={location.pathname === "/inventory" ? "active" : ""}
        onClick={() => navigate("/inventory")}
      >
        Inventory
      </button>
      <button
        className={location.pathname === "/receipt" ? "active" : ""}
        onClick={() => navigate("/receipt")}
      >
        Receipt
      </button>
    </div>
  );
}
