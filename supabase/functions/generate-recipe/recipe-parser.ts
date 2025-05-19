
/**
 * Parser for extracting recipe information from AI response
 */

import { Recipe } from "./types.ts";

export function parseRecipeFromAIResponse(
  aiResponse: string,
  cookingTime: number,
  goals: string[]
): Recipe {
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
  return {
    recipeName,
    ingredients: ingredientList,
    instructions,
    protein,
    carbs,
    fat,
    calories,
    cookingTime: parseInt(cookingTime.toString()),
    goals,
    isFavorited: false
  };
}
