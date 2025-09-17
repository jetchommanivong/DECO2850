import React from "react";
import "./Popup.css";
import CancelIcon from "./assets/Actions/Cancel.png";

export default function UserPopup({ user, mealPlans, onClose }) {
  if (!user) return null;

  // Filter meal plans where user is planner or joined
  const userMeals = mealPlans.filter(
    (m) => m.planner === user.name || m.joined.includes(user.name)
  );

  return (
    <div className="popup-overlay">
      <div className="popup-box user-popup">
        {/* Close Button */}
        <button className="popup-close" onClick={onClose}>
          <img src={CancelIcon} alt="Close" />
        </button>

        {/* Avatar + Name */}
        <div className="popup-header">
          <img src={user.avatar} alt={user.name} className="popup-avatar" />
          <h2>{user.name}</h2>
        </div>

        {/* Details */}
        <div className="popup-details user-details">
          <h3>Claimed Items</h3>
          {user.claimed.length > 0 ? (
            <ul>
              {user.claimed.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p>No claimed items</p>
          )}

          <h3>Meal Plans</h3>
          {userMeals.length > 0 ? (
            <ul>
              {userMeals.map((m) => (
                <li key={m.id}>
                  📅 {new Date(m.date).toDateString()} — {m.meal}{" "}
                  {m.planner === user.name ? "(Planned)" : "(Joined)"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No meal plans yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
