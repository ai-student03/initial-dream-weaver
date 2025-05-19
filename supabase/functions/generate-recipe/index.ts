
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

The user has the following:
Ingredients: ${ingredients}  
Goal: ${goals.join(", ")}  
Cooking time: ${cookingTime} minutes

Your task:
1. Suggest one realistic, healthy, and satisfying recipe that fits the goal and can be made in the available time.
2. Use only ingredients that logically go well together — you do not need to use all of them.
3. Be creative: e.g., you can use just the yolk or just the white of an egg.
4. Each ingredient should be considered individually.
5. If this is a follow-up request, generate a completely different dish.
6. Make sure the instructions are clear, numbered, and easy to follow.
7. Estimate nutritional values as accurately as possible based on the ingredients used.

❗ Important:
- **Always include a recipe name.**
- **Always include preparation steps.**
- **Always include nutritional values.**

---

🧾 Format your answer like this:

Recipe Name:  
[Insert name here]

Ingredients:  
- [ingredient 1]  
- [ingredient 2]  
...

Instructions:  
1. [Step one]  
2. [Step two]  
...

Nutritional Information (estimated):  
- Protein: ~Xg  
- Carbs: ~Xg  
- Fat: ~Xg  
- Calories: ~X`;

    // Add differentIdea flag instruction if this is a regeneration request
    if (differentIdea) {
      prompt += "\n\nPlease provide a completely different recipe than before. Change the dish style, structure, or cooking method.";
    }

    console.log("Calling OpenAI with prompt:", prompt.substring(0, 100) + "...");

    // Make request to OpenAI API with the FiMe Recipe Expert agent
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v1"  // Enable assistants API
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o for better recipe generation
        messages: [
          {
            role: "system",
            content: "You are FiMe Recipe Expert, a professional nutritionist who specializes in creating healthy recipes with accurate nutritional information."
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
    
    // Extract recipe name
    const recipeNameRegex = /Recipe Name:\s*\n([^\n]+)/;
    const recipeNameMatch = aiResponse.match(recipeNameRegex);
    const recipeName = recipeNameMatch ? recipeNameMatch[1].trim() : "Healthy Recipe";
    
    // Extract ingredients
    const ingredientsRegex = /Ingredients:\s*\n([\s\S]*?)(?=\n\s*Instructions:|$)/;
    const ingredientsMatch = aiResponse.match(ingredientsRegex);
    let ingredientList: string[] = [];
    
    if (ingredientsMatch && ingredientsMatch[1]) {
      const ingredientsText = ingredientsMatch[1].trim();
      ingredientList = ingredientsText.split("\n")
        .map(line => line.replace(/^[*\-•]\s*/, "").trim())
        .filter(item => item.length > 0);
    }
    
    // Extract instructions
    const instructionsRegex = /Instructions:\s*\n([\s\S]*?)(?=\n\s*Nutritional Information|$)/;
    const instructionsMatch = aiResponse.match(instructionsRegex);
    let instructions = "";
    
    if (instructionsMatch && instructionsMatch[1]) {
      instructions = instructionsMatch[1].trim();
    }
    
    // Extract nutritional information
    const nutritionRegex = /Nutritional Information[^:]*:\s*\n([\s\S]*?)(?=$)/;
    const nutritionMatch = aiResponse.match(nutritionRegex);
    
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
      recipeName: recipeName,
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
