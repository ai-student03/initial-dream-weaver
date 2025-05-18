
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

    // Construct our prompt
    let prompt = `Act as a professional nutritionist. Based on:
Ingredients: ${ingredients}
Goal: ${goals.join(", ")}
Time: ${cookingTime} minutes

Suggest one healthy and satisfying meal that matches the user's goal. Include:
- Dish name
- Ingredient list
- Preparation steps
- Nutritional values: protein, carbs, fat, calories`;

    // If this is a regeneration request, add the instruction for a different idea
    if (differentIdea) {
      prompt += "\n\nGive a different idea than before.";
    }

    // Make direct fetch request to OpenAI API instead of using the client library
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using the most recent model
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist who specializes in creating healthy recipes."
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
    
    // Use a regex pattern to extract the dish name (first line or line after any separator)
    const dishNamePattern = /(?:^|\n\n)(?:Dish name:|#|\*\*|)?\s*([^\n]+)/i;
    const dishNameMatch = aiResponse.match(dishNamePattern);
    const dishName = dishNameMatch ? dishNameMatch[1].replace(/:/g, "").trim() : "Healthy Recipe";
    
    // Extract ingredients
    const ingredientsPattern = /(?:Ingredients?:|(?:\n\n)|(?:-{3,}))\s*([\s\S]*?)(?:\n\n|Preparation|Instructions|Steps|Method|Directions|Nutritional|$)/i;
    const ingredientsMatch = aiResponse.match(ingredientsPattern);
    let ingredientList: string[] = [];
    
    if (ingredientsMatch && ingredientsMatch[1]) {
      // Extract items that look like ingredients (usually with a dash or asterisk)
      const ingredientsText = ingredientsMatch[1].trim();
      ingredientList = ingredientsText.split("\n")
        .map(line => line.replace(/^[*\-•]\s*/, "").trim())
        .filter(item => item.length > 0);
    }
    
    // Extract instructions
    const instructionsPattern = /(?:Instructions|Preparation|Steps|Method|Directions):\s*([\s\S]*?)(?:\n\n|Nutritional|$)/i;
    const instructionsMatch = aiResponse.match(instructionsPattern);
    let instructions = "";
    
    if (instructionsMatch && instructionsMatch[1]) {
      instructions = instructionsMatch[1].trim();
    } else {
      // If no specific section found, try to use the remaining text
      const restOfContent = aiResponse.split(/(?:Ingredients?:|(?:\n\n)|(?:-{3,}))\s*[\s\S]*?(?:\n\n|Preparation|Instructions|Steps|Method|Directions|$)/i)[1];
      if (restOfContent) {
        instructions = restOfContent.trim();
      }
    }
    
    // Extract nutritional information
    const nutritionPattern = /(?:Nutritional values:|Nutrition:|Nutritional information:)\s*([\s\S]*?)$/i;
    const nutritionMatch = aiResponse.match(nutritionPattern);
    
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let calories = 0;
    
    if (nutritionMatch && nutritionMatch[1]) {
      const nutritionText = nutritionMatch[1].trim();
      
      // Extract protein
      const proteinMatch = nutritionText.match(/Protein:?\s*(\d+)(?:\.\d+)?(?:\s*)?g/i);
      if (proteinMatch) protein = parseFloat(proteinMatch[1]);
      
      // Extract carbs
      const carbsMatch = nutritionText.match(/Carbs:?\s*(\d+)(?:\.\d+)?(?:\s*)?g/i);
      if (carbsMatch) carbs = parseFloat(carbsMatch[1]);
      
      // Extract fat
      const fatMatch = nutritionText.match(/Fat:?\s*(\d+)(?:\.\d+)?(?:\s*)?g/i);
      if (fatMatch) fat = parseFloat(fatMatch[1]);
      
      // Extract calories
      const caloriesMatch = nutritionText.match(/Calories:?\s*(\d+)(?:\.\d+)?/i);
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
