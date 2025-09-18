import React, { useMemo, useState } from 'react';
import './RecipePage.css';

import lasagnaImg from "./assets/Images/lasagna.jpg";
import appleFrittersImg from "./assets/Images/fritters.jpg";
import applePieImg from "./assets/Images/applepie.jpg";

import mainCourseImg from "./assets/Images/main.jpg";
import breakfastImg from "./assets/Images/breakfast.jpg";
import dessertImg from "./assets/Images/dessert.jpg";
import snackImg from "./assets/Images/snack.jpg";

export default function Recipes({
  // extra for later
  onSelectRecipe,
  onSelectCourse,
  delegatedColor = '#2ecc71', // household member color (green for now, supposing user selected green
}) {
  // Sample items rn
  const suggestedRecipes = useMemo(() => ([
    {
      id: 'spinach-cheese-lasagna',
      title: 'Spinach & Cheese Lasagna',
      image: lasagnaImg,
      count: 4,
      hasDelegatedItems: true,
      memberColor: delegatedColor,
    },
    {
      id: 'apple-fritters',
      title: 'Apple Fritters',
      image: appleFrittersImg,
      count: 2,
      hasDelegatedItems: false,
    },
    {
      id: 'apple-pie',
      title: 'Apple Pie',
      image: applePieImg,
      count: 3,
      hasDelegatedItems: true,
      memberColor: delegatedColor,
    },
  ]), [delegatedColor]);

  const ingredientOptions = useMemo(() => ([
    'Apple',
    'Banana',
    'Beef (ground)',
    'Cheese (brie)',
    'Cheese (mozzarella)',
    'Chicken (breast)',
  ]), []);

  const courses = useMemo(() => ([
    {
      id: 'main',
      title: 'Main',
      image: mainCourseImg,
    },
    {
      id: 'breakfast',
      title: 'Breakfast',
      image: breakfastImg,
    },
    {
      id: 'dessert',
      title: 'Dessert',
      image: dessertImg,
    },
    {
      id: 'snack',
      title: 'Snack',
      image: snackImg,
    },
  ]), []);

  // UI state
  const [infoOpen, setInfoOpen] = useState(false);
  const [search, setSearch] = useState('');

  // just filters the checkbox list itself
  const filteredIngredientOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ingredientOptions;
    return ingredientOptions.filter(i => i.toLowerCase().includes(q));
  }, [ingredientOptions, search]);

  const handleRecipeClick = (recipe) => {
    if (onSelectRecipe) onSelectRecipe(recipe);
    else {
      // Replace later
      console.log('Open recipe detail:', recipe);
    }
  };

  const handleCourseClick = (course) => {
    if (onSelectCourse) onSelectCourse(course);
    else {
      console.log('Filter by course:', course);
    }
  };

  return (
    <main className="recipesPage" aria-label="Recipes">
      {/* Header (Title + Info Row) */}
      <header className="pageHeader">
        <h1 className="pageTitle">Recipes</h1>

        <div className="infoRow" aria-live="polite">
          <div className="infoLeft">
            <span className="sublabel" id="suggestedLabel">Suggested</span>
            <button
              className="infoBtn"
              aria-expanded={infoOpen}
              aria-controls="suggestedInfoText"
              title="What does Suggested mean?"
              onClick={() => setInfoOpen(v => !v)}
            >
              i
            </button>
          </div>

          <p
            id="suggestedInfoText"
            className={`infoText ${infoOpen ? '' : 'isHidden'}`}
            role="note"
            aria-hidden={!infoOpen}
          >
            Suggested items are based off the number of items you’ve claimed, and how close they are to expiry.
          </p>
        </div>
      </header>

      {/* HorizontalScrollView “Suggested” (cards) */}
      <section className="carouselSection" aria-label="Suggested recipes">
        <div className="carousel" id="suggestedCarousel" tabIndex={0}>
          {suggestedRecipes.map(recipe => (
            <article
              key={recipe.id}
              className="recipeCard"
              role="button"
              tabIndex={0}
              aria-label={`${recipe.title}, ${recipe.count} items`}
              onClick={() => handleRecipeClick(recipe)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRecipeClick(recipe);
                }
              }}
            >
              <div className="media">
                <img src={recipe.image} alt={recipe.title} />
              </div>
              <div className="overlay" />
              <div className="title">{recipe.title}</div>
              <div className="badge">{recipe.count}</div>
              {recipe.hasDelegatedItems && (
                <div
                  className="sideTab"
                  style={{ background: recipe.memberColor ?? delegatedColor }}
                />
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Ingredient Filter (search + checkboxes) */}
      <section className="filterSection" aria-label="Select Ingredients">
        <h2 className="sectionTitle">Select Ingredients</h2>

        <div className="searchbar">
          <input
            id="ingredientSearch"
            type="search"
            placeholder="Search ingredients"
            aria-label="Search ingredients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          <span className="searchIcon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 3H2l8 9v7l4 2v-9l8-9z"></path>
            </svg>
          </span>
        </div>

        <div className="checkboxGrid" role="group" aria-label="Ingredients">
          {filteredIngredientOptions.map((name, idx) => {
            const id = `ing-${idx}`;
            return (
              <div key={id} className="checkbox">
                <input id={id} type="checkbox" value={name} />
                <label htmlFor={id}>{name}</label>
              </div>
            );
          })}
        </div>
      </section>

      {/* HorizontalScrollView “Course” (cards) */}
      <section className="carouselSection" aria-label="Course">
        <h2 className="sectionTitle">Course</h2>
        <div className="carousel courseCarousel" id="courseCarousel" tabIndex={0}>
          {courses.map(course => (
            <article
              key={course.id}
              className="courseCard"
              role="button"
              tabIndex={0}
              aria-label={course.title}
              onClick={() => handleCourseClick(course)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCourseClick(course);
                }
              }}
            >
              <div className="media">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="overlay" />
              <div className="title">{course.title}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
