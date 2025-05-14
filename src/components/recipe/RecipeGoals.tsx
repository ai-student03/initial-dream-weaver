
import React from 'react';

interface RecipeGoalsProps {
  goals: string[];
}

const RecipeGoals = ({ goals }: RecipeGoalsProps) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-2">Goals</h3>
      <div className="flex flex-wrap gap-2">
        {goals.map((goal, index) => (
          <span 
            key={index} 
            className="px-3 py-1 rounded-full bg-[#F8BBD0] bg-opacity-40 text-sm"
          >
            {goal}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecipeGoals;
