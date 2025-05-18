
import React from 'react';

interface RecipeInstructionsProps {
  instructions: string;
}

const RecipeInstructions = ({ instructions }: RecipeInstructionsProps) => {
  // Format instructions to properly handle numbered lists
  const formatInstructions = () => {
    if (!instructions) return <p>No instructions available</p>;
    
    // If instructions already contain numbered steps (1., 2., etc.)
    if (/^\d+\.\s/m.test(instructions)) {
      return instructions.split('\n').map((step, index) => (
        <p key={index} className="py-1">{step.trim()}</p>
      ));
    }
    
    // If not, format as a numbered list
    return instructions.split('\n')
      .filter(line => line.trim() !== '')
      .map((step, index) => (
        <div key={index} className="flex gap-2 py-1">
          <span className="font-medium">{index + 1}.</span>
          <span>{step.trim()}</span>
        </div>
      ));
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Instructions</h3>
      <div className="space-y-1">
        {formatInstructions()}
      </div>
    </div>
  );
};

export default RecipeInstructions;
