
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

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

    const configuration = new Configuration({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });
    const openai = new OpenAIApi(configuration);

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

    const response = await openai.createChatCompletion({
      model: "gpt-4",
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
    });

    // Parse the AI response to extract recipe information
    const aiResponse = response.data.choices[0].message?.content || "";
    
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
      cookingTime: parseInt(cookingTime),
      goals: goals,
      isFavorited: false
    };

    return new Response(JSON.stringify(recipe), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to generate recipe" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
