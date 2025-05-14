
import React from 'react';

interface RecipeInstructionsProps {
  instructions: string;
}

const RecipeInstructions = ({ instructions }: RecipeInstructionsProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Instructions</h3>
      <div className="space-y-2">
        {instructions.split('\n').map((step, index) => (
          <p key={index}>{step}</p>
        ))}
      </div>
    </div>
  );
};

export default RecipeInstructions;
