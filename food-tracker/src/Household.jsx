import { useState } from "react";
import "./Household.css";
import UserPopup from "./UserPopup";
import ItemPopup from "./ItemPopup";
import MealPlanForm from "./MealPlanForm";
import InviteUserPopup from "./InviteUserPopup";

// Logos
import HomeLogo from "./assets/Logo/Home.png";
import DateIcon from "./assets/Logo/Date.png";

// Actions
import InviteIcon from "./assets/Actions/Invite User.png";
import AddPng from "./assets/Actions/Add.png";
import SearchIcon from "./assets/Actions/Search.png";

// Avatars
import User1 from "./assets/Avatar/User 1.png";
import User2 from "./assets/Avatar/User 2.png";
import User4 from "./assets/Avatar/User 4.png";
import User5 from "./assets/Avatar/User 5.png";

export default function Household() {
  const [users, setUsers] = useState([
    { id: 1, name: "John", avatar: User1, claimed: ["Milk"], meals: [] },
    { id: 2, name: "Mia", avatar: User2, claimed: ["Apple"], meals: [] },
    { id: 3, name: "You", avatar: User4, claimed: ["Cheese"], meals: [] },
    { id: 4, name: "Josh", avatar: User5, claimed: ["Broccoli"], meals: [] },
  ]);

  const [activity, setActivity] = useState([
    "Mia claimed Apple",
    "You claimed Milk",
    "Josh claimed Broccoli",
  ]);
  
  const [items, setItems] = useState([
    { id: 1, name: "Apple", claimedBy: ["Mia"] },
    { id: 2, name: "Milk", claimedBy: ["John", "You"] },
    { id: 3, name: "Cheese", claimedBy: ["You"] },
    { id: 4, name: "Broccoli", claimedBy: ["Josh"] },
  ]);

  const [mealPlans, setMealPlans] = useState([
    { id: 1, date: "2025-09-16", meal: "Chicken Curry", planner: "Josh", joined: ["John"] },
    { id: 2, date: "2025-09-17", meal: "Fried Rice", planner: "Mia", joined: [] },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="household-page">
      <div className="household-container">
        {/* Header */}
        <div className="household-header">
          <img src={HomeLogo} alt="Home" className="home-logo" />
          <h1>Household</h1>
        </div>

        {/* Users */}
        <div className="user-row">
          {users.map((u) => (
            <div
              key={u.id}
              className="user-avatar"
              onClick={() => setSelectedUser(u)}
            >
              <img src={u.avatar} alt={u.name} />
              <span>{u.name}</span>
            </div>
          ))}
          <div className="user-avatar" onClick={() => setShowInvitePopup(true)}>
              <div className="invite-btn">
                <img src={InviteIcon} alt="Invite" />
              </div>
              <span>Add a mate!</span>
            </div>
          </div>

        {/* Activity */}
        <h2>Activity</h2>
        <ul className="activity-log">
          {activity.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>

        {/* Items with search */}
        <h2>Items</h2>
        <div className="search-bar">
          <img src={SearchIcon} alt="Search" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ul className="items-list">
          {filteredItems.map((item) => (
            <li key={item.id} onClick={() => setSelectedItem(item)}>
              {item.name}
              <div className="claimed-icons">
                {item.claimedBy.map((u) => {
                  const usr = users.find((x) => x.name === u);
                  return <img key={u} src={usr?.avatar} alt={u} />;
                })}
              </div>
            </li>
          ))}
        </ul>

        {/* Meal Plan */}
        <div className="meal-plan-header">
          <h2>Meal Plan</h2>
          <button
          onClick={() => setShowMealForm(true)}
          className="add-meal-btn"
        >
          <img src={AddPng} alt="Add Meal" />
        </button>
        </div>
        <ul className="meal-plan">
          {mealPlans.map((m) => (
            <li key={m.id}>
              <div className="meal-info">
                <span className="meal-date">
                  <img src={DateIcon} alt="date" />
                  {new Date(m.date).toDateString()}
                </span>
                <span className="meal-name">{m.meal}</span>
                <span className="meal-planner">Planned by: {m.planner}</span>
              </div>

              <div className="meal-actions">
                <div className="joined-icons">
                  {m.joined.map((u) => {
                    const usr = users.find((x) => x.name === u);
                    return <img key={u} src={usr?.avatar} alt={u} />;
                  })}
                </div>
                <button
                  className="join-btn"
                  onClick={() => {
                  if (!m.joined.includes("You")) {
                    setMealPlans((prev) =>
                      prev.map((plan) =>
                        plan.id === m.id
                          ? { ...plan, joined: [...plan.joined, "You"] }
                          : plan
                      )
                    );
                    setActivity((prev) => [
                      `You joined a meal plan (${m.meal})`,
                      ...prev,
                    ]);  
                    alert("🎉 You’ve been added to this meal plan!");
                  }
                }}
                >
                  Join
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Popups */}
        {selectedUser && (
          <UserPopup
              user={selectedUser}
              mealPlans={mealPlans}   // Pass mealPlans here
              onClose={() => setSelectedUser(null)}
          />        
        )}

        {showInvitePopup && (
          <InviteUserPopup
            onAdd={(newUser) => setUsers((prev) => [...prev, newUser])}
            onClose={() => setShowInvitePopup(false)}
          />
        )}
        
        {selectedItem && (
          <ItemPopup
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={(name) =>
              setItems((prev) => prev.filter((i) => i.name !== name))
            }
            onToggleClaim={(itemName, claim) => {
              setItems((prev) =>
                prev.map((i) =>
                  i.name === itemName
                    ? {
                        ...i,
                        claimedBy: claim
                          ? [...i.claimedBy, "You"]
                          : i.claimedBy.filter((u) => u !== "You"),
                      }
                    : i
                )
              );
              setActivity((prev) => [
                claim
                  ? `You claimed ${itemName}`
                  : `You unclaimed ${itemName}`,
                ...prev,
              ]);
            }}
          />
        )}
        
        {showMealForm && (
          <MealPlanForm
            onClose={() => setShowMealForm(false)}
            onAdd={(meal) => {
              setMealPlans((prev) => [...prev, meal]);
              setActivity((prev) => [
                `You made a meal plan (${meal.meal})`,
                ...prev,
              ]);  // ✅ log new plan
            }}
          />
        )}

      </div>
    </div>
  );
}
