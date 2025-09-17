import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";

// Item images
import AppleImg from "./assets/Items/Apple.png";
import MilkImg from "./assets/Items/Milk.png";
import CheeseImg from "./assets/Items/Cheese.png";
import BroccoliImg from "./assets/Items/Broccoli.png";

// Cancel button
import CancelIcon from "./assets/Actions/Cancel.png";

const itemImages = {
  Apple: AppleImg,
  Milk: MilkImg,
  Cheese: CheeseImg,
  Broccoli: BroccoliImg,
};

export default function ItemPopup({ item, onClose, onDelete, onToggleClaim }) {
  const itemImg = itemImages[item.name] || null;
  const navigate = useNavigate();
  const [isClaimed, setIsClaimed] = useState(item.claimedBy.includes("You"));
  const [hover, setHover] = useState(false);

  if (!item) return null;

  const handleRecipeClick = () => {
    navigate("/recipes");
    window.scrollTo(0, 0);
    onClose();
  };

  const handleClaimToggle = () => {
    if (isClaimed) {
      alert(`❌ You unclaimed ${item.name}`);
      onToggleClaim(item.name, false);
      setIsClaimed(false);
    } else {
      alert(`✅ You claimed ${item.name}`);
      onToggleClaim(item.name, true);
      setIsClaimed(true);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box item-popup">
        {/* Close button */}
        <button className="popup-close" onClick={onClose}>
          <img src={CancelIcon} alt="Close" />
        </button>

        {/* Claim/Unclaim button (top-left) */}
        <p
          className={`claim-btn ${isClaimed ? "claimed" : ""}`}
          onClick={handleClaimToggle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {isClaimed ? (hover ? "Unclaim?" : "Claimed") : "Claim"}
        </p>

        {/* Item image */}
        {itemImg && (
          <div className="popup-img">
            <img src={itemImg} alt={item.name} />
          </div>
        )}

        {/* Item name */}
        <h2 className="item-title">{item.name}</h2>

        {/* Item details */}
        <div className="popup-details">
          <p>
            <strong>Claimed by:</strong> {item.claimedBy.join(", ")}
          </p>
          <p>
            <strong>Expiry Date:</strong> 2025-09-18
          </p>
          <p>
            <strong>Status:</strong> 2 days left
          </p>
        </div>

        {/* Suggestions */}
        <h3 className="suggestion-title">Recipe Suggestions</h3>
        <ul className="suggestion-list">
          <li>Stir-fry Beef</li>
          <li>{item.name} Chips</li>
        </ul>

        {/* Actions */}
        <div className="popup-actions">
          <button
            className="action-btn"
            onClick={() => {
              onDelete(item.name);
              onClose();
            }}
          >
            Mark as Used
          </button>
          <button className="action-btn" onClick={handleRecipeClick}>
            Go to Recipes
          </button>
        </div>
      </div>
    </div>
  );
}
