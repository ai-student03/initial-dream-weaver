
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, goals, cookingTime, differentIdea = false } = await req.json();

    // Validate input
    if (!ingredients || !goals || !cookingTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construct improved prompt
    let prompt = `Act as a professional nutritionist and recipe developer.

The user has provided:
- Ingredients: ${ingredients}  
- Goal: ${goals.join(", ")}  
- Cooking time: ${cookingTime} minutes

Your task:
1. Suggest **one healthy and satisfying recipe** that fits the user's goal and available time.
2. Use only ingredients that logically go well together. It is not necessary to use all the ingredients.
3. Be creative: you may use only parts of an ingredient (e.g., egg yolk or white).
4. Treat each ingredient individually — not as a fixed bundle.
5. If this is a follow-up request (like "Give me another idea"), make sure the recipe is **clearly different** from the previous one (change the dish style, structure, or cooking method).

Make sure all recipe instructions are **clear, numbered, and easy to follow**.

✅ Most importantly:
- **Verify that the quantities and nutritional values you provide are reasonable and accurate.**
- Ensure the calorie, protein, carb, and fat estimations reflect the ingredients and their amounts realistically.
- If unsure, give rounded estimates and state that they are approximate.

---

📦 Format your response like this:

**Recipe Name**

**Ingredients**  
(List each with quantities, e.g.: 2 eggs, 1 slice whole grain bread, 1 tbsp tahini)

**Preparation Instructions**  
1. Step one...  
2. Step two...  
3. Etc.

**Nutritional Information (estimated)**  
Protein: ~X g  
Carbs: ~X g  
Fat: ~X g  
Calories: ~X`;

    // Add differentIdea flag instruction if this is a regeneration request
    if (differentIdea) {
      prompt += "\n\nPlease provide a completely different recipe than before. Change the dish style, structure, or cooking method.";
    }

    console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

    // Make direct fetch request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o for better recipe generation
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist who specializes in creating healthy recipes with accurate nutritional information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", JSON.stringify(errorData));
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.error?.message || "Unknown error"}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message?.content || "";
    console.log("AI Response:", aiResponse);
    
    // Fixed regex patterns with proper escaping of special characters
    const dishNamePattern = /(?:\*\*Recipe Name\*\*|\*\*Recipe Name)[\r\n\s]*([^\r\n]+)/i;
    const dishNameMatch = aiResponse.match(dishNamePattern);
    const dishName = dishNameMatch ? dishNameMatch[1].replace(/:/g, "").trim() : "Healthy Recipe";
    
    // Extract ingredients
    const ingredientsPattern = /(?:\*\*Ingredients\*\*|\*\*Ingredients)[\r\n\s]+([\s\S]*?)(?=\s*\*\*|\s*---|\s*$)/i;
    const ingredientsMatch = aiResponse.match(ingredientsPattern);
    let ingredientList: string[] = [];
    
    if (ingredientsMatch && ingredientsMatch[1]) {
      const ingredientsText = ingredientsMatch[1].trim();
      ingredientList = ingredientsText.split("\n")
        .map(line => line.replace(/^[*\-•]\s*/, "").trim())
        .filter(item => item.length > 0);
    }
    
    // Extract instructions
    const instructionsPattern = /(?:\*\*Preparation Instructions\*\*|\*\*Instructions|\*\*Preparation)[\r\n\s]+([\s\S]*?)(?=\s*\*\*|\s*---|\s*$)/i;
    const instructionsMatch = aiResponse.match(instructionsPattern);
    let instructions = "";
    
    if (instructionsMatch && instructionsMatch[1]) {
      instructions = instructionsMatch[1].trim();
    }
    
    // Extract nutritional information
    const nutritionPattern = /(?:\*\*Nutritional Information|\*\*Nutritional Information \(estimated\)\*\*)[\r\n\s]+([\s\S]*?)(?=\s*\*\*|\s*---|\s*$)/i;
    const nutritionMatch = aiResponse.match(nutritionPattern);
    
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let calories = 0;
    
    if (nutritionMatch && nutritionMatch[1]) {
      const nutritionText = nutritionMatch[1].trim();
      
      // Extract protein
      const proteinMatch = nutritionText.match(/Protein:?\s*~?(\d+(?:\.\d+)?)(?:\s*)?g/i);
      if (proteinMatch) protein = parseFloat(proteinMatch[1]);
      
      // Extract carbs
      const carbsMatch = nutritionText.match(/Carbs:?\s*~?(\d+(?:\.\d+)?)(?:\s*)?g/i);
      if (carbsMatch) carbs = parseFloat(carbsMatch[1]);
      
      // Extract fat
      const fatMatch = nutritionText.match(/Fat:?\s*~?(\d+(?:\.\d+)?)(?:\s*)?g/i);
      if (fatMatch) fat = parseFloat(fatMatch[1]);
      
      // Extract calories
      const caloriesMatch = nutritionText.match(/Calories:?\s*~?(\d+(?:\.\d+)?)/i);
      if (caloriesMatch) calories = parseFloat(caloriesMatch[1]);
    }
    
    // Create recipe object
    const recipe = {
      recipeName: dishName,
      ingredients: ingredientList,
      instructions: instructions,
      protein: protein,
      carbs: carbs,
      fat: fat,
      calories: calories,
      cookingTime: parseInt(cookingTime.toString()),
      goals: goals,
      isFavorited: false
    };

    return new Response(JSON.stringify(recipe), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    
    return new Response(
      JSON.stringify({ error: `Failed to generate recipe: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
