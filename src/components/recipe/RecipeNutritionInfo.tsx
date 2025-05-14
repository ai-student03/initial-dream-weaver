
import React from 'react';
import { Recipe } from '@/lib/types';

interface RecipeNutritionInfoProps {
  recipe: Recipe;
}

const RecipeNutritionInfo = ({ recipe }: RecipeNutritionInfoProps) => {
  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
      <div className="text-center">
        <p className="text-xl font-bold">{recipe.calories}</p>
        <p className="text-sm text-muted-foreground">calories</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">{recipe.protein}g</p>
        <p className="text-sm text-muted-foreground">protein</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">{recipe.carbs}g</p>
        <p className="text-sm text-muted-foreground">carbs</p>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold">{recipe.fat}g</p>
        <p className="text-sm text-muted-foreground">fat</p>
      </div>
    </div>
  );
};

export default RecipeNutritionInfo;
