
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecipeFormData } from '@/lib/types';
import { Utensils } from 'lucide-react';
import RecipeNutritionInfo from '@/components/recipe/RecipeNutritionInfo';
import RecipeGoals from '@/components/recipe/RecipeGoals';
import RecipeIngredients from '@/components/recipe/RecipeIngredients';
import RecipeInstructions from '@/components/recipe/RecipeInstructions';
import RecipeEmailPrompt from '@/components/recipe/RecipeEmailPrompt';
import RecipeLoadingState from '@/components/recipe/RecipeLoadingState';
import RecipeImagePrompt from '@/components/recipe/RecipeImagePrompt';
import { useRecipeGeneration } from '@/hooks/useRecipeGeneration';
import { useRecipeEmail } from '@/hooks/useRecipeEmail';

const RecipePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as RecipeFormData;
  const { recipe, loading, handleSaveRecipe } = useRecipeGeneration(formData);
  const { emailLoading, emailSent, sendRecipeEmail } = useRecipeEmail();
  
  useEffect(() => {
    if (recipe) {
      console.log("recipe.imageUrl is:", recipe.imageUrl);
    }
  }, [recipe]);

  if (loading) {
    return <RecipeLoadingState />;
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>No recipe data available. Please try again.</p>
              <Button 
                onClick={() => navigate('/nutrition')}
                className="mt-4 bg-[#FF6F61] hover:bg-[#ff5d4d]"
              >
                Back to Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Also add a console log here to see the value immediately when recipe is available
  console.log("recipe.imageUrl is:", recipe.imageUrl);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto border-[#F8BBD0] shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#FFDAB9] to-[#F8BBD0] bg-opacity-50 pb-4">
          <CardTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center">
            <Utensils className="mr-2 h-6 w-6" />
            {recipe.recipeName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {recipe.imageUrl && (
            <div className="flex justify-center mb-6">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.recipeName} 
                className="rounded-xl max-h-64 object-cover shadow-sm"
              />
            </div>
          )}
          
          <RecipeNutritionInfo recipe={recipe} />
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Cooking Time</h3>
            <p>{recipe.cookingTime} minutes</p>
          </div>
          
          <RecipeGoals goals={recipe.goals} />
          <RecipeIngredients ingredients={recipe.ingredients} />
          <RecipeInstructions instructions={recipe.instructions} />
          
          {recipe.imagePrompt && (
            <RecipeImagePrompt prompt={recipe.imagePrompt} />
          )}
          
          <RecipeEmailPrompt 
            recipe={recipe} 
            onSendEmail={() => sendRecipeEmail(recipe)} 
            emailLoading={emailLoading} 
            emailSent={emailSent} 
          />
        </CardContent>
        
        <CardFooter className="flex justify-center py-6 border-t border-[#F8BBD0] bg-[#FFDAB9] bg-opacity-10">
          <p className="text-center text-sm text-muted-foreground">
            Glad I could help! Come back anytime you need meal inspiration 😊
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecipePreview;
