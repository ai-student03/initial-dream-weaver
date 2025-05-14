
import React from 'react';
import { Loader } from 'lucide-react';

const RecipeLoadingState = () => {
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="animate-pulse text-center space-y-4">
        <Loader className="mx-auto h-12 w-12 text-[#FF6F61] animate-spin" />
        <h3 className="text-xl font-medium text-[#FF6F61]">Creating your perfect meal...</h3>
        <p className="text-muted-foreground">Based on your ingredients and goals</p>
      </div>
    </div>
  );
};

export default RecipeLoadingState;
