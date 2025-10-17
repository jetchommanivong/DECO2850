import React, { useState } from "react";
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onPress={() => Alert.alert(u.name, `Claimed: ${u.claimed.join(", ")}`)}
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
          onPress={() => Alert.alert("Invite User", "Feature not available on mobile")}
          style={{ alignItems: "center", marginRight: 10 }}
        >
          <Image source={InviteIcon} style={{ width: 60, height: 60 }} />
          <Text>Add a mate!</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Activity */}
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>Activity</Text>
      {activity.map((a, i) => (
        <Text key={i} style={{ marginVertical: 2 }}>
          • {a}
        </Text>
      ))}

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
              `Claimed by: ${item.claimedBy.join(", ")}`,
              [
                {
                  text: "Toggle Claim",
                  onPress: () => {
                    const alreadyClaimed = item.claimedBy.includes("You");
                    setItems((prev) =>
                      prev.map((i) =>
                        i.name === item.name
                          ? {
                              ...i,
                              claimedBy: alreadyClaimed
                                ? i.claimedBy.filter((u) => u !== "You")
                                : [...i.claimedBy, "You"],
                            }
                          : i
                      )
                    );
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.name === "You"
                          ? {
                              ...u,
                              claimed: alreadyClaimed
                                ? u.claimed.filter((c) => c !== item.name)
                                : [...u.claimed, item.name],
                            }
                          : u
                      )
                    );
                    setActivity((prev) => [
                      alreadyClaimed
                        ? `You unclaimed ${item.name}`
                        : `You claimed ${item.name}`,
                      ...prev,
                    ]);
                  },
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
            {item.claimedBy.map((u) => {
              const usr = users.find((x) => x.name === u);
              return (
                <Image
                  key={u}
                  source={usr?.avatar}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 12.5,
                    marginLeft: 5,
                  }}
                />
              );
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
            {m.joined.map((u) => {
              const usr = users.find((x) => x.name === u);
              return (
                <Image
                  key={u}
                  source={usr?.avatar}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 12.5,
                    marginRight: 5,
                  }}
                />
              );
            })}
            <TouchableOpacity
              onPress={() => {
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
                  Alert.alert("🎉 Joined!", "You’ve been added to this meal plan.");
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
    </ScrollView>
  );
}
