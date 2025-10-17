import { useState, useEffect } from "react";
import { useItems, useMembers, useUsageLogs, store } from "./store";
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

const AVATAR_OPTIONS = [User1, User2, User4, User5];

export default function Household() {
  // Get data from store
  const items = useItems();
  const members = useMembers();
  const usageLogs = useUsageLogs();

  // Local state for UI (meal plans stay local for now unless you want to add to store)
  const [mealPlans, setMealPlans] = useState([
    { id: 1, date: "2025-09-16", meal: "Chicken Curry", planner: "Josh", joined: ["John"] },
    { id: 2, date: "2025-09-17", meal: "Fried Rice", planner: "Mia", joined: [] },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  // Create a user display list with avatars
  const [userAvatars, setUserAvatars] = useState({});

  useEffect(() => {
    // Assign avatars to members who don't have one yet
    const newAvatars = { ...userAvatars };
    members.forEach((member, idx) => {
      if (!newAvatars[member.member_id]) {
        newAvatars[member.member_id] = AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length];
      }
    });
    setUserAvatars(newAvatars);
  }, [members]);

  // Convert members to display format
  const users = members.map(m => {
    const claimed = items
      .filter(item => item.claimedBy?.includes(m.member_name))
      .map(item => item.name);

    const userMeals = mealPlans.filter(
      plan => plan.planner === m.member_name || plan.joined.includes(m.member_name)
    );

    return {
      id: m.member_id,
      name: m.member_name,
      avatar: userAvatars[m.member_id] || User1,
      claimed,
      meals: userMeals,
    };
  });

  // Build activity log from usage logs
  const activity = usageLogs
    .slice()
    .reverse()
    .slice(0, 10) // Show last 10 activities
    .map((log) => {
      const member = members.find(m => m.member_id === log.memberId);
      const userName = member?.member_name || "Someone";
      
      if (log.action === "add") {
        return `${userName} added ${log.quantity} of ${log.itemName}`;
      } else if (log.action === "remove") {
        return `${userName} removed ${log.quantity} of ${log.itemName}`;
      }
      return `${userName} ${log.action} ${log.itemName}`;
    });

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current user (assuming it's the first "You" member or last added)
  const currentUser = members.find(m => m.member_name === "You") || members[0];

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
          {activity.length > 0 ? (
            activity.map((a, i) => <li key={i}>{a}</li>)
          ) : (
            <li>No activity yet</li>
          )}
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
                {item.claimedBy?.map((userName) => {
                  const usr = users.find((x) => x.name === userName);
                  return usr ? (
                    <img key={userName} src={usr.avatar} alt={userName} />
                  ) : null;
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
                  {m.joined.map((userName) => {
                    const usr = users.find((x) => x.name === userName);
                    return usr ? (
                      <img key={userName} src={usr.avatar} alt={userName} />
                    ) : null;
                  })}
                </div>
                <button
                  className="join-btn"
                  onClick={() => {
                    const currentUserName = currentUser?.member_name || "You";
                    if (!m.joined.includes(currentUserName)) {
                      setMealPlans((prev) =>
                        prev.map((plan) =>
                          plan.id === m.id
                            ? { ...plan, joined: [...plan.joined, currentUserName] }
                            : plan
                        )
                      );
                      alert("🎉 You've been added to this meal plan!");
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
            mealPlans={mealPlans}
            onClose={() => setSelectedUser(null)}
          />
        )}

        {showInvitePopup && (
          <InviteUserPopup
            onAdd={(newUser) => {
              // Add member to store
              store.actions.members.add(newUser.name);
              
              // Store avatar mapping
              const newMemberId = store.getState().members.length;
              setUserAvatars(prev => ({
                ...prev,
                [newMemberId]: newUser.avatar
              }));
            }}
            onClose={() => setShowInvitePopup(false)}
          />
        )}

        {selectedItem && (
          <ItemPopup
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={(name) => {
              // Remove item from store
              store.actions.items.removeByName(name);
            }}
            onToggleClaim={(itemName, claim) => {
              const currentUserName = currentUser?.member_name || "You";
              
              // Update item's claimedBy in store
              store.actions.items.setClaimedByName(itemName, currentUserName, claim);

              // Log the activity
              store.actions.logs.add({
                memberId: currentUser?.member_id || 0,
                action: claim ? "claimed" : "unclaimed",
                itemName: itemName,
                quantity: 1
              });
            }}
          />
        )}

        {showMealForm && (
          <MealPlanForm
            onClose={() => setShowMealForm(false)}
            onAdd={(meal) => {
              setMealPlans((prev) => [...prev, meal]);
            }}
          />
        )}
      </div>
    </div>
  );
}