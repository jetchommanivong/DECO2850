import React, { useState } from "react";
import "./Popup.css";
import CancelIcon from "./assets/Actions/Cancel.png";

// Avatars
import User1 from "./assets/Avatar/User 1.png";
import User2 from "./assets/Avatar/User 2.png";
import User3 from "./assets/Avatar/User 3.png";
import User4 from "./assets/Avatar/User 4.png";
import User5 from "./assets/Avatar/User 5.png";
import User6 from "./assets/Avatar/User 6.png";

const avatarOptions = [User1, User2, User3, User4, User5, User6];

export default function InviteUserPopup({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedAvatar) {
      alert("Please enter a name and select an avatar.");
      return;
    }
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      avatar: selectedAvatar,
      claimed: [],
      meals: [],
    };
    onAdd(newUser);
    alert(`✅ ${name} has been added to your household!`);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box invite-popup">
        <button className="popup-close" onClick={onClose}>
          <img src={CancelIcon} alt="Close" />
        </button>

        <h2>Add a mate!</h2>

        <form onSubmit={handleSubmit} className="invite-form">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Enter a name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Choose Avatar:</label>
          <div className="avatar-options">
            {avatarOptions.map((a, i) => (
              <img
                key={i}
                src={a}
                alt={`Avatar ${i + 1}`}
                className={`avatar-option ${
                  selectedAvatar === a ? "selected" : ""
                }`}
                onClick={() => setSelectedAvatar(a)}
              />
            ))}
          </div>

          <button type="submit" className="submit-btn">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
