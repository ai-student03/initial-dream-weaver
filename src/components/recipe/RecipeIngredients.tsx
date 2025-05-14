
import React from 'react';

interface RecipeIngredientsProps {
  ingredients: string[];
}

const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
      <ul className="list-disc pl-5 space-y-1">
        {ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeIngredients;
