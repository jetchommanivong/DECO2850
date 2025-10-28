export const promptTemplate = 
`
Sort, categorize, and clean the following body of text by removing any unnecessary information. Each extracted food item should be categorized into one of the following groups: **fruits, vegetables, grains, protein, dairy, fats, sugars**, or default to **"other"** if no match is found.

Use the following examples as a guide:
- **fruits** → apple, banana, orange, lemon, mango, berries
- **vegetables** → broccoli, spinach, lettuce, onion, carrot, tomato, potato
- **grains** → rice, bread, pasta, oats, flour, cereal, noodles
- **protein** → chicken, beef, pork, fish, eggs, tofu, beans, lentils
- **dairy** → milk, cheese, butter, yogurt, cream
- **fats** → oil, olive oil, margarine, avocado, peanut butter
- **sugars** → sugar, chocolate, syrup, honey, sweets, candy
If an item does not clearly fit any of these, assign **"other"**.

Assign an appropriate **unit of measurement**—preferably one of **loaf, pcs, kg, g, mL, L**, or alternatively **bunch, box, can, jar** if none of the primary units fit.
Always use the most precise and realistic unit of measurement for the item (e.g., use "mL" before "L" or "g" before "kg" when applicable).

For the expiry date, ensure it is formatted as "YYYY-MM-DD". 
If the expiry date is not explicitly mentioned, infer a reasonable default starting from the date specified in the text based on common shelf lives:

DAIRY:
  - Fresh milk: 7 days
  - Cheese (hard): 30-60 days
  - Cheese (soft): 7-14 days
  - Butter: 30-90 days
  - Yogurt: 7-14 days

VEGETABLES:
  - Leafy greens: 5-7 days
  - Root vegetables: 14-30 days
  - Tomatoes: 5-7 days
  - Broccoli/cauliflower: 7-10 days
  - Onions/garlic: 30-60 days

FRUITS:
  - Berries: 3-5 days
  - Apples: 30-60 days
  - Bananas: 5-7 days (refrigerated)
  - Citrus: 14-21 days

MEATS:
  - Fresh raw chicken/fish: 1-2 days
  - Fresh raw beef/pork: 3-5 days
  - Cooked meat: 3-4 days
  - Deli meat: 3-5 days
  - Bacon: 7 days

OTHER:
  - Eggs: 21-28 days
  - Condiments: 60-180 days
  - Leftovers: 3-4 days
  - Bread/baked goods: 5 days
  - Canned/bottled/boxed goods: 180 days
  - Refriegrated dairy and protein products
  - Frozen/long-lasting pantry items: 365 days

If no reasonable inference can be made or date cannot be found, set the expiry date to null.

Present the cleaned and structured data in a valid ***JSON*** format that follows this structure:

{
 "items": [
    { 
      "item_id": 1, 
      "name": "Skim Milk", 
      "category": "dairy", 
      "quantity": 2, 
      "unit": "L", 
      "expiry": "2025-12-15",
      "member_id": null 
      },
    { 
      "item_id": 2, 
      "name": "Sparkling Water", 
      "category": "other", 
      "quantity": 750, 
      "unit": "mL", 
      "expiry": "2025-10-26",
      "member_id": null 
      },
    { 
      "item_id": 3, 
      "name": "Whole Wheat Bread", 
      "category": "grains", 
      "quantity": 1, 
      "unit": "loaf", 
      "expiry": "2025-10-30",
      "claimedBy": null 
      }
  ]
}

**Note:** 
- If the quantity is not specified, default it to 1. 
- If the unit is not specified, default it to "pcs".
- Category must always be one of: fruits, vegetables, grains, protein, dairy, fats, sugars, or other.

Now process the following text accordingly:
`;
