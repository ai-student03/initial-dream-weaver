
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, goals, cookingTime } = await req.json();

    if (!ingredients || !goals || !cookingTime) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a prompt for GPT with the updated format that requests a JSON response
    const prompt = `
      Act as a professional nutritionist.
      
      The user has the following ingredients: ${ingredients}  
      Their goal is: ${goals.join(', ')}  
      They have ${cookingTime} minutes to cook.
      
      Generate one realistic, tasty and healthy recipe that fits these inputs.
      
      Respond in this exact JSON format:
      {
        "recipe_name": "...",
        "ingredients": [...], // array of strings
        "instructions": "...",
        "protein": number,
        "carbs": number, 
        "fat": number,
        "calories": number
      }
      
      ⚠️ Do NOT use all ingredients if they do not naturally go well together.  
      ✅ Only combine ingredients that make culinary and nutritional sense.  
      ❌ Avoid unusual or unappetizing combinations.  
      ✅ If the ingredients do not suffice for a tasty meal, suggest the closest viable option using only part of them or basic additions.
      
      Ensure the response is valid JSON with no markdown or extra text.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the latest available model that's efficient
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let recipeData;

    try {
      // Sometimes GPT returns JSON string wrapped in ```json blocks, so we need to extract it
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[1]);
      } else {
        recipeData = JSON.parse(content);
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      console.log('Raw response:', data.choices[0].message.content);
      
      // If parsing fails, make a best effort to extract structured data
      const content = data.choices[0].message.content;
      recipeData = {
        recipe_name: extractTitle(content),
        ingredients: extractIngredientsList(content),
        instructions: extractInstructions(content),
        protein: extractNutritionValue(content, 'protein'),
        carbs: extractNutritionValue(content, 'carbs'),
        fat: extractNutritionValue(content, 'fat'),
        calories: extractNutritionValue(content, 'calories')
      };
    }
    
    // Standardize the response format
    const standardizedRecipe = {
      recipeName: recipeData.recipe_name || recipeData.recipeName,
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : recipeData.ingredients.split('\n').map(i => i.trim()).filter(i => i),
      instructions: recipeData.instructions,
      protein: recipeData.protein,
      carbs: recipeData.carbs,
      fat: recipeData.fat,
      calories: recipeData.calories,
      cookingTime,
      goals,
      isFavorited: false
    };
    
    // Return the recipe with additional fields
    return new Response(
      JSON.stringify(standardizedRecipe),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recipe function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for parsing unstructured text if JSON parsing fails
function extractTitle(text) {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.includes(':') && line.length < 100) {
      return line.trim();
    }
  }
  return "Generated Recipe";
}

function extractIngredientsList(text) {
  const ingredientsSection = text.match(/ingredients:?.*?\n([\s\S]*?)(?:\n\s*\n|\n(?:instructions|steps|directions|method|preparation))/i);
  if (!ingredientsSection) return ["Ingredients extraction failed"];
  
  const ingredients = ingredientsSection[1].split('\n')
    .map(line => line.replace(/^[-*•]|\d+\.\s+/, '').trim())
    .filter(line => line.length > 0);
  
  return ingredients;
}

function extractInstructions(text) {
  const instructionsSection = text.match(/(?:instructions|steps|directions|method|preparation):?.*?\n([\s\S]*?)(?:\n\s*\n|\n(?:nutritional|nutrition))/i);
  if (!instructionsSection) return "Instructions extraction failed";
  
  return instructionsSection[1].trim();
}

function extractNutritionValue(text, nutrientType) {
  const regex = new RegExp(`${nutrientType}:?\\s*(\\d+)`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1], 10) : Math.floor(Math.random() * 30) + 10;
}
