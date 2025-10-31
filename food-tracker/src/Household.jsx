import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useItems, useMembers, useUsageLogs, store } from "./store";
import InviteUserPopup from "./InviteUserPopup";
import MealPlanForm from "./MealPlanForm";

// Images
import HomeLogo from "./assets/Logo/Home.png";
import DateIcon from "./assets/Logo/date.png";
import InviteIcon from "./assets/Actions/Invite User.png";
import AddPng from "./assets/Actions/Add.png";
import SearchIcon from "./assets/Actions/Search.png";
import User1 from "./assets/Avatar/User 1.png";
import User2 from "./assets/Avatar/User 2.png";
import User3 from "./assets/Avatar/User 3.png";
import User4 from "./assets/Avatar/User 4.png";
import User5 from "./assets/Avatar/User 5.png";
import User6 from "./assets/Avatar/User 6.png";

const AVATAR_OPTIONS = [User1, User2, User3, User4, User5, User6];

export default function Household() {
  const items = useItems();
  const members = useMembers();
  const usageLogs = useUsageLogs();

  const [mealPlans, setMealPlans] = useState([
    {
      id: 1,
      date: "2025-09-16",
      meal: "Chicken Curry",
      planner: "Josh",
      joined: ["John"],
    },
    { id: 2, date: "2025-09-17", meal: "Fried Rice", planner: "Mia", joined: [] },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [userAvatars, setUserAvatars] = useState({});
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);

  // ensure avatars sync with members
  useEffect(() => {
    const nextAvatars = { ...userAvatars };
    members.forEach((member, idx) => {
      if (!nextAvatars[member.member_id]) {
        nextAvatars[member.member_id] = AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length];
      }
    });
    setUserAvatars(nextAvatars);
  }, [members]);

  const users = members.map((m) => {
    const claimed = items
      .filter((item) => item.claimedBy?.includes(m.member_name))
      .map((item) => item.name);

    const userMeals = mealPlans.filter(
      (plan) => plan.planner === m.member_name || plan.joined.includes(m.member_name)
    );

    return {
      id: m.member_id,
      name: m.member_name,
      avatar: userAvatars[m.member_id] || User1,
      claimed,
      meals: userMeals,
    };
  });

  const currentUser = members.find((m) => m.member_name === "You") || members[0];

  // --- Claim / Unclaim ---
  const handleToggleClaim = (item) => {
    const userName = currentUser?.member_name || "You";
    const alreadyClaimed = item.claimedBy?.includes(userName);

    store.actions.items.setClaimedByName(item.name, userName, !alreadyClaimed);

    store.actions.logs.add({
      memberId: currentUser?.member_id || 0,
      action: alreadyClaimed ? "unclaimed" : "claimed",
      itemName: item.name,
      quantity: 1,
    });
  };

  // --- Delete item ---
  const handleDeleteItem = (itemName) => {
    Alert.alert("Delete Item", `Delete ${itemName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          store.actions.items.removeByName(itemName);
          store.actions.logs.add({
            memberId: currentUser?.member_id || 0,
            action: "deleted item",
            itemName,
            quantity: 1,
          });
        },
      },
    ]);
  };

  // --- Join meal ---
  const handleJoinMeal = (meal) => {
    const userName = currentUser?.member_name || "You";
    if (!meal.joined.includes(userName)) {
      setMealPlans((prev) =>
        prev.map((m) =>
          m.id === meal.id ? { ...m, joined: [...m.joined, userName] } : m
        )
      );

      store.actions.logs.add({
        memberId: currentUser?.member_id || 0,
        action: "joined meal",
        itemName: meal.meal,
        quantity: 1,
      });

      Alert.alert("🎉 Joined!", "You've joined this meal plan!");
    }
  };

  // --- Items retrieved directly from store ---
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activity = usageLogs
    .slice()
    .reverse()
    .map((log) => {
      const member = members.find((m) => m.member_id === log.memberId);
      const userName = member?.member_name || "Someone";
      return `${userName} ${log.action} ${log.itemName}`;
    });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
        <Image source={HomeLogo} style={{ width: 40, height: 40, marginRight: 10 }} />
        <Text style={{ fontSize: 26, fontWeight: "bold" }}>Household</Text>
      </View>

      {/* Users */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            onPress={() =>
              Alert.alert(u.name, `Claimed: ${u.claimed.join(", ") || "Nothing yet"}`)
            }
            style={{ alignItems: "center", marginRight: 10 }}
          >
            <Image
              source={u.avatar}
              style={{ width: 60, height: 60, borderRadius: 30 }}
            />
            <Text>{u.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setShowInvitePopup(true)}
          style={{ alignItems: "center", marginRight: 10 }}
        >
          <Image source={InviteIcon} style={{ width: 60, height: 60 }} />
          <Text>Add a mate!</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Activity */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>Activity</Text>
      {activity.length > 0 ? (
        activity.map((a, i) => (
          <Text key={i} style={{ marginVertical: 2 }}>
            • {a}
          </Text>
        ))
      ) : (
        <Text style={{ color: "#888" }}>No recent activity</Text>
      )}

      {/* Items */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>Items</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 10,
          marginVertical: 8,
        }}
      >
        <Image source={SearchIcon} style={{ width: 20, height: 20, marginRight: 8 }} />
        <TextInput
          placeholder="Search items..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={{ flex: 1, height: 40 }}
        />
      </View>

      {filteredItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() =>
            Alert.alert(
              item.name,
              `Claimed by: ${item.claimedBy?.join(", ") || "No one"}`,
              [
                { text: "Toggle Claim", onPress: () => handleToggleClaim(item) },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteItem(item.name),
                },
                { text: "Cancel", style: "cancel" },
              ]
            )
          }
          style={{
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text>{item.name}</Text>
          <View style={{ flexDirection: "row" }}>
            {item.claimedBy?.map((userName) => {
              const usr = users.find((x) => x.name === userName);
              return usr ? (
                <Image
                  key={userName}
                  source={usr.avatar}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 12.5,
                    marginLeft: 5,
                  }}
                />
              ) : null;
            })}
          </View>
        </TouchableOpacity>
      ))}

      {/* Meal Plan */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 25,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Meal Plan</Text>
        <TouchableOpacity onPress={() => setShowMealForm(true)}>
          <Image source={AddPng} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>

      {mealPlans.map((m) => {
        const alreadyJoined = m.joined.includes(currentUser?.member_name || "You");
        return (
          <View
            key={m.id}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={DateIcon}
                style={{ width: 20, height: 20, marginRight: 5 }}
              />
              <Text>{new Date(m.date).toDateString()}</Text>
            </View>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{m.meal}</Text>
            <Text>Planned by: {m.planner}</Text>

            <View style={{ flexDirection: "row", marginTop: 5, alignItems: "center" }}>
              {m.joined.map((userName) => {
                const usr = users.find((x) => x.name === userName);
                return usr ? (
                  <Image
                    key={userName}
                    source={usr.avatar}
                    style={{
                      width: 25,
                      height: 25,
                      borderRadius: 12.5,
                      marginRight: 5,
                    }}
                  />
                ) : null;
              })}
              {!alreadyJoined && (
                <TouchableOpacity
                  onPress={() => handleJoinMeal(m)}
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#007AFF",
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: "white" }}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      {/* Popups */}
      {showInvitePopup && (
        <InviteUserPopup
          onAdd={(newUser) => {
            store.actions.members.add(newUser.name);
            const newMember = store.getState().members.find(
              (m) => m.member_name === newUser.name
            );
            setUserAvatars((prev) => ({
              ...prev,
              [newMember.member_id]: newUser.avatar,
            }));
          }}
          onClose={() => setShowInvitePopup(false)}
        />
      )}

      {showMealForm && (
        <MealPlanForm
          onAdd={(newMeal) => {
            setMealPlans((prev) => [...prev, newMeal]);
            store.actions.logs.add({
              memberId: currentUser?.member_id || 0,
              action: "added meal plan",
              itemName: newMeal.meal,
              quantity: 1,
            });
          }}
          onClose={() => setShowMealForm(false)}
        />
      )}
    </ScrollView>
  );
}
