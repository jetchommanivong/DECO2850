import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import lasagnaImg from "./assets/Images/lasagna.jpg";
import appleFrittersImg from "./assets/Images/fritters.jpg";
import applePieImg from "./assets/Images/applepie.jpg";

import mainCourseImg from "./assets/Images/main.jpg";
import breakfastImg from "./assets/Images/breakfast.jpg";
import dessertImg from "./assets/Images/dessert.jpg";
import snackImg from "./assets/Images/snack.jpg";

export default function RecipePage({
  onSelectRecipe,
  onSelectCourse,
  delegatedColor = "#2ecc71",
}) {
  const suggestedRecipes = useMemo(
    () => [
      {
        id: "spinach-cheese-lasagna",
        title: "Spinach & Cheese Lasagna",
        image: lasagnaImg,
        count: 4,
        hasDelegatedItems: true,
        memberColor: delegatedColor,
      },
      {
        id: "apple-fritters",
        title: "Apple Fritters",
        image: appleFrittersImg,
        count: 2,
        hasDelegatedItems: false,
      },
      {
        id: "apple-pie",
        title: "Apple Pie",
        image: applePieImg,
        count: 3,
        hasDelegatedItems: true,
        memberColor: delegatedColor,
      },
    ],
    [delegatedColor]
  );

  const ingredientOptions = useMemo(
    () => [
      "Apple",
      "Banana",
      "Beef (ground)",
      "Cheese (brie)",
      "Cheese (mozzarella)",
      "Chicken (breast)",
    ],
    []
  );

  const courses = useMemo(
    () => [
      { id: "main", title: "Main", image: mainCourseImg },
      { id: "breakfast", title: "Breakfast", image: breakfastImg },
      { id: "dessert", title: "Dessert", image: dessertImg },
      { id: "snack", title: "Snack", image: snackImg },
    ],
    []
  );

  const [infoOpen, setInfoOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? ingredientOptions.filter((i) => i.toLowerCase().includes(q))
      : ingredientOptions;
  }, [ingredientOptions, search]);

  const handleRecipeClick = (r) =>
    onSelectRecipe ? onSelectRecipe(r) : console.log("Recipe:", r);
  const handleCourseClick = (c) =>
    onSelectCourse ? onSelectCourse(c) : console.log("Course:", c);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* Header */}
      <Text style={styles.title}>Recipes</Text>

      <TouchableOpacity onPress={() => setInfoOpen((v) => !v)}>
        <Text style={styles.infoToggle}>
          ℹ️ Suggested — tap for info
        </Text>
      </TouchableOpacity>
      {infoOpen && (
        <Text style={styles.infoText}>
          Suggested recipes are based on your claimed items and their expiry
          dates.
        </Text>
      )}

      {/* Suggested Recipes Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {suggestedRecipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => handleRecipeClick(recipe)}
          >
            <Image source={recipe.image} style={styles.recipeImage} />
            <View style={styles.recipeOverlay}>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.recipeBadge}>
                <Text style={styles.badgeText}>{recipe.count}</Text>
              </View>
              {recipe.hasDelegatedItems && (
                <View
                  style={[
                    styles.sideTab,
                    { backgroundColor: recipe.memberColor ?? delegatedColor },
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Ingredient Filter */}
      <Text style={styles.sectionHeader}>Select Ingredients</Text>
      <TextInput
        placeholder="Search ingredients"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <View style={styles.checkboxGrid}>
        {filteredIngredients.map((name, idx) => (
          <View key={idx} style={styles.checkboxRow}>
            <View style={styles.checkboxBox} />
            <Text style={styles.checkboxLabel}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Course Carousel */}
      <Text style={styles.sectionHeader}>Course</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => handleCourseClick(course)}
          >
            <Image source={course.image} style={styles.courseImage} />
            <View style={styles.courseOverlay}>
              <Text style={styles.courseTitle}>{course.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoToggle: {
    color: "#007AFF",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 15,
  },
  recipeCard: {
    width: 180,
    height: 200,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  recipeImage: { width: "100%", height: "100%" },
  recipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 10,
  },
  recipeTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  recipeBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#2ecc71",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: "white", fontWeight: "bold" },
  sideTab: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#888",
    marginRight: 8,
  },
  checkboxLabel: { fontSize: 15 },
  courseCard: {
    width: 150,
    height: 150,
    marginRight: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  courseImage: { width: "100%", height: "100%" },
  courseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    padding: 10,
  },
  courseTitle: { color: "white", fontWeight: "600", fontSize: 16 },
});
