export const promptTemplate = 
`
Sort, categorize, and clean the following body of text by removing any unnecessary information. Each extracted food item should be categorized into one of the following groups: **fruits, vegetables, grains, protein, dairy, fats, sugars**, or default to **"other"** if no match is found. Assign an appropriate **unit of measurement**—preferably one of **loaf, pcs, kg, g, mL, L**, or alternatively **bunch, box, can, jar** if none of the primary units fit.
Always use the appropriate unit of measurement for the item (e.g., use "mL" before "L" or "g" before "kg" when applicable).
For the expiry date, ensure it is formatted as "YYYY-MM-DD". If the expiry date is not explicitly mentioned, infer a reasonable default, starting from the date specified in text, based on common shelf lives (e.g., 7 days for fresh produce, 5 days for bread, 180 days for canned goods). If no reasonable inference can be made or date can not be found in text, set the expiry date to null.
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

**Note:** If the quantity is not specified, default it to 1. If the unit is not specified, default it to "pcs".

Now process the following text accordingly:
`