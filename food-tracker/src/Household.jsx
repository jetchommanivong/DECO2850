import React, { useState, useEffect } from "react";
import { useItems, useMembers, useUsageLogs, store } from "./store";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import InviteUserPopup from "./InviteUserPopup";

// Images
import HomeLogo from "./assets/Logo/Home.png";
import DateIcon from "./assets/Logo/date.png";
import InviteIcon from "./assets/Actions/Invite User.png";
import AddPng from "./assets/Actions/Add.png";
import SearchIcon from "./assets/Actions/Search.png";
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

  useEffect(() => {
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


  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current user
  const currentUser = members.find(m => m.member_name === "You") || members[0];

  const handleToggleClaim = (item) => {
    const currentUserName = currentUser?.member_name || "You";
    const alreadyClaimed = item.claimedBy?.includes(currentUserName);

    // Update item's claimedBy in store
    store.actions.items.setClaimedByName(item.name, currentUserName, !alreadyClaimed);

    // Log the activity
    store.actions.logs.add({
      memberId: currentUser?.member_id || 0,
      action: alreadyClaimed ? "unclaimed" : "claimed",
      itemName: item.name,
      quantity: 1
    });
  };

  const handleDeleteItem = (itemName) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${itemName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            store.actions.items.removeByName(itemName);
          }
        }
      ]
    );
  };

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

      {/* User row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            onPress={() => Alert.alert(u.name, `Claimed: ${u.claimed.join(", ") || "Nothing yet"}`)}
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
        <Text style={{ marginVertical: 2, color: "#999" }}>No activity yet</Text>
        )}

      {/* Items section */}
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
                {
                  text: "Toggle Claim",
                  onPress: () => handleToggleClaim(item)
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDeleteItem(item.name)
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
            alignItems: "center",
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
        <TouchableOpacity
          onPress={() => Alert.alert("Add Meal", "Meal creation popup not available")}
        >
          <Image source={AddPng} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>

      {mealPlans.map((m) => (
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
            <TouchableOpacity
              onPress={() => {
                const currentUserName = currentUser?.member_name || "You";

                if (!m.joined.includes(currentUserName)) {
                  setMealPlans((prev) =>
                    prev.map((plan) =>
                      plan.id === m.id
                      ? { ...plan, joined: [...plan.joined, currentUserName] }
                        : plan
                    )
                  );
                  Alert.alert("🎉 Joined!", "You've been added to this meal plan.");
                }
              }}
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
          </View>
        </View>
      ))}

      {/* Invite User Popup */}
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
    </ScrollView>
  );
}