import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ItemCard.css";

const ItemCard = ({ item, removeItem }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(item.expiry);

  const getExpiryClass = (days) => {
    if (days <= 0) return "expired";
    if (days === 1) return "urgent";
    if (days <= 3) return "warning";
    return "safe";
  };

  const goToRecipes = () => {
    if (item.recipes && item.recipes.length > 0) {
      navigate("/recipes", { state: { preselect: item.recipes[0] } });
    } else {
      navigate("/recipes");
    }
  };

  return (
    <>
      {/* Card preview */}
      <div className="item-card" onClick={() => setExpanded(true)}>
        <div className="item-left">
          <img src={item.icon} alt={item.name} className={`food-icon ${item.className || ""}`} />
          <div className="item-info">
            <span className="item-name">{item.name}</span>
            <span className="item-quantity">{item.quantity}</span>
            {item.claimedBy && <span className="item-claimed">Claimed by: {item.claimedBy}</span>}
          </div>
        </div>
        <span className={getExpiryClass(daysLeft)}>
          {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
        </span>
      </div>

      {/* Expanded modal/lightbox */}
      {expanded && (
        <div className="item-modal-overlay" onClick={() => setExpanded(false)}>
          <div className="item-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setExpanded(false)}>×</button>
            <div className="modal-header">
              <img src={item.icon} alt={item.name} className="modal-image" />
              <div className="modal-info">
                <h2>{item.name}</h2>
                <p>{item.quantity}</p>
                {item.claimedBy && <p>Claimed by: {item.claimedBy}</p>}
                <p>Expiry Date: {item.expiry}</p>
                <p className={getExpiryClass(daysLeft)}>
                  Status: {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
                </p>
              </div>
            </div>

            {item.recipes && item.recipes.length > 0 && (
              <div className="modal-recipes">
                <h3>Recipe Suggestions</h3>
                <ul>
                  {item.recipes.map((recipe, idx) => <li key={idx}>{recipe}</li>)}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => removeItem(item.name)}>Mark as Used</button>
              <button onClick={goToRecipes}>Go to Recipes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItemCard;
