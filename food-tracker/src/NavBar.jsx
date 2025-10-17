import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";
import { Home, Book, ClipboardList, Receipt, Image, Users } from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Fridge" },
    { path: "/recipes", icon: Book, label: "Recipes" },
    { path: "/inventory", icon: ClipboardList, label: "Inventory" },
    { path: "/receipt", icon: Receipt, label: "Receipt" },
    { path: "/tempitemphoto", icon: Image, label: "ItemPhoto" },
    { path: "/household", icon: Users, label: "Household" },
  ];

  return (
    <div className="nav-bar">
      {navItems.map(({ path, icon: Icon, label }) => (
        <button
          key={path}
          className={location.pathname === path ? "active" : ""}
          onClick={() => navigate(path)}
          title={label}
        >
          <Icon size={24} />
        </button>
      ))}
    </div>
  );
}