const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { generateObject } = require("ai");
const { openai } = require("@ai-sdk/openai");
const { z } = require("zod");

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

app.use((req, res, next) => {
  next();
});

// validation with detailed error tracking
function validateTranscript(parsed, selectedMemberId, inventory, membersItems, household) {
  const errors = [];
  const warnings = [];

  // presence and format checks
  if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
    errors.push({
      check: "Items presence",
      message: "No valid items found in transcript. Please mention specific items with quantities."
    });
    return { status: "unsuccessful", errors, warnings };
  }

  // validate selected member
  const member = household.find(m => m.member_id === selectedMemberId);
  if (!member) {
    errors.push({
      check: "Member validation",
      message: `Invalid member ID: ${selectedMemberId}`
    });
    return { status: "unsuccessful", errors, warnings };
  }

  const validatedItems = [];

  // validate each item in the transcript
  for (let i = 0; i < parsed.items.length; i++) {
    const item = parsed.items[i];
    const itemErrors = [];
    
    // check action
    if (!item.action || !["add", "remove"].includes(item.action)) {
      itemErrors.push(`Invalid or missing action. Expected "add" or "remove", got "${item.action}"`);
    }

    // check item name and find in inventory
    if (!item.itemName || typeof item.itemName !== "string") {
      itemErrors.push("Missing or invalid item name");
    } else {
      const inventoryItem = inventory.find(
        inv => inv.item_name.toLowerCase().includes(item.itemName.toLowerCase()) || 
               item.itemName.toLowerCase().includes(inv.item_name.toLowerCase())
      );
      
      if (!inventoryItem) {
        itemErrors.push(`Item "${item.itemName}" not found in inventory. Available items: ${inventory.map(i => i.item_name).join(', ')}`);
      } else {
        item.itemId = inventoryItem.item_id;
      }
    }

    // check quantity
    if (typeof item.quantity !== "number" || item.quantity <= 0 || isNaN(item.quantity)) {
      itemErrors.push(`Invalid quantity: ${item.quantity}. Must be a positive number.`);
    }

    // check unit (optional, but should be string if provided)
    if (item.unit && typeof item.unit !== "string") {
      itemErrors.push("Unit must be a string if provided");
    }

    // set default unit if not provided
    if (!item.unit || item.unit.trim() === "") {
      item.unit = "piece"; // default unit
      warnings.push(`No unit specified for ${item.itemName}, defaulting to "piece"`);
    }

    // ownership and quantity validation for remove actions
    if (item.action === "remove" && item.itemId && itemErrors.length === 0) {
      const memberItem = membersItems.find(
        mi => mi.item_id === item.itemId && mi.member_id === selectedMemberId
      );
      
      if (!memberItem) {
        itemErrors.push(`${member.member_name} does not own any "${item.itemName}"`);
      } else if (memberItem.quantity < item.quantity) {
        itemErrors.push(`${member.member_name} has only ${memberItem.quantity} ${item.itemName}, but tried to remove ${item.quantity}`);
      }
    }

    // if this item has errors, add them to the main errors array
    if (itemErrors.length > 0) {
      errors.push({
        check: `Item ${i + 1} validation`,
        message: `${item.itemName || 'Unknown item'}: ${itemErrors.join('; ')}`
      });
    } else {
      validatedItems.push({
        member: selectedMemberId,
        action: item.action,
        item: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit.trim()
      });
    }
  }

  if (errors.length > 0) {
    return { status: "unsuccessful", errors, warnings };
  }

  // all validations passed
  return {
    status: "success",
    description: `Successfully validated ${validatedItems.length} item(s) for ${member.member_name}`,
    data: validatedItems,
    warnings
  };
}

app.post("/api/parse-transcript", async (req, res) => {
  const { transcript, selectedMemberId, inventory, membersItems, householdMembers } = req.body;

  try {
    const aiResponse = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        items: z.array(z.object({
          action: z.enum(["add", "remove"]).describe("The action being performed"),
          itemName: z.string().describe("The name of the item"),
          quantity: z.number().positive().describe("The positive quantity of the item"),
          unit: z.string().optional().describe("The unit of measurement (optional)")
        })).describe("Array of items extracted from transcript")
      }),
      prompt: `You are an expert at parsing food inventory transcripts. Extract ALL items mentioned with their actions and quantities.

              TRANSCRIPT: "${transcript}"
                  
              AVAILABLE INVENTORY ITEMS: ${inventory.map(i => i.item_name).join(', ')}
                  
              INSTRUCTIONS:
              1. QUANTITY CONVERSION: Convert text quantities to numbers:
                 - "half" or "1/2" → 0.5
                 - "quarter" or "1/4" → 0.25  
                 - "a dozen" → 12
                  
              2. ACTION MAPPING:
                 - Words like "used", "ate", "consumed", "cooked with", "finished" → "remove"
                 - Words like "added", "bought", "put in", "restocked", "got" → "add"
                  
              3. ITEM MATCHING: Match mentioned items to available inventory items (case-insensitive, partial matches OK)
                  
              4. UNIT EXTRACTION: Extract units like "slices", "cups", "pieces", "grams", etc. If no unit mentioned, leave empty.
                  
              5. MULTIPLE ITEMS: If transcript mentions multiple items (e.g., "2 eggs and 3 slices of cheese"), extract each as separate items.
                  
              EXAMPLE:
              Input: "I used 2 eggs and half a tomato"
              Output: {
                "items": [
                  {"action": "remove", "itemName": "egg", "quantity": 2, "unit": "pieces"},
                  {"action": "remove", "itemName": "tomato", "quantity": 0.5, "unit": "pieces"}
                ]
              }
                  
              Be thorough and extract every item mentioned. If unclear, make reasonable assumptions based on context.`
    });

    const parsed = aiResponse.object;
    console.log("AI parsed result:", JSON.stringify(parsed, null, 2));

    // validation
    const result = validateTranscript(parsed, selectedMemberId, inventory, membersItems, householdMembers);
    
    console.log("Validation result:", result);

    res.json({ log: [result] });
  } catch (err) {
    console.error("Error in parse-transcript:", err);
    res.status(500).json({ 
      error: "Failed to parse transcript",
      details: err.message,
      log: [{
        status: "unsuccessful",
        errors: [{ check: "System error", message: "Internal server error occurred while processing transcript" }],
        warnings: []
      }]
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});