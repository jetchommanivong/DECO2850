import { useState } from "react";
import "./Popup.css";

// Actions
import CancelIcon from "./assets/Actions/Cancel.png";
import DateIcon from "./assets/Logo/date.png";

export default function MealPlanForm({ onClose, onAdd }) {
  const [meal, setMeal] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ id: Date.now(), meal, date, planner: "You", joined: [] });
    alert(`✅ Meal plan "${meal}" added successfully!`);
    setMeal("");
    setDate("");
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box meal-popup">
        <button className="popup-close" onClick={onClose}>
          <img src={CancelIcon} alt="Close" />
        </button>

        <h2>Add Meal Plan</h2>
        <form onSubmit={handleSubmit} className="meal-form">
          <div className="form-row">
            <label className="form-label">Meal Name :</label>
            <input
              type="text"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label className="form-label">
              Date :
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
}
