
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecipeFormData } from '@/lib/types';
import { Utensils, RefreshCw, AlertCircle } from 'lucide-react';
import RecipeNutritionInfo from '@/components/recipe/RecipeNutritionInfo';
import RecipeGoals from '@/components/recipe/RecipeGoals';
import RecipeIngredients from '@/components/recipe/RecipeIngredients';
import RecipeInstructions from '@/components/recipe/RecipeInstructions';
import RecipeEmailPrompt from '@/components/recipe/RecipeEmailPrompt';
import RecipeLoadingState from '@/components/recipe/RecipeLoadingState';
import { useRecipeGeneration } from '@/hooks/useRecipeGeneration';
import { useRecipeEmail } from '@/hooks/useRecipeEmail';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const RecipePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as RecipeFormData;
  const { recipe, loading, error, handleSaveRecipe, handleRegenerateRecipe } = useRecipeGeneration(formData);
  const { emailLoading, emailSent, sendRecipeEmail } = useRecipeEmail();

  if (loading) {
    return <RecipeLoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto shadow-soft rounded-xl overflow-hidden border border-fime-green/20">
          <CardHeader className="bg-gradient-fime pb-4">
            <CardTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center">
              <AlertCircle className="mr-2 h-6 w-6 text-foreground" />
              Error Generating Recipe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <Alert variant="destructive">
              <AlertTitle>Failed to generate recipe</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button 
                onClick={handleRegenerateRecipe}
                className="flex items-center justify-center bg-fime-green hover:bg-fime-green/90 text-white font-medium rounded-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/nutrition')}
                variant="outline"
                className="border border-fime-green text-fime-green hover:bg-fime-green/10 font-medium rounded-full"
              >
                Back to Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-soft rounded-xl bg-white border border-fime-green/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>No recipe data available. Please try again.</p>
              <Button 
                onClick={() => navigate('/nutrition')}
                className="mt-4 bg-fime-green hover:bg-fime-green/90 text-white font-medium rounded-full"
              >
                Back to Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto border-fime-green/20 shadow-soft rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-fime pb-4">
          <CardTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center">
            <Utensils className="mr-2 h-6 w-6 text-foreground" />
            {recipe.recipeName}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <RecipeNutritionInfo recipe={recipe} />
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Cooking Time</h3>
            <p>{recipe.cookingTime} minutes</p>
          </div>
          
          <RecipeGoals goals={recipe.goals} />
          <RecipeIngredients ingredients={recipe.ingredients} />
          <RecipeInstructions instructions={recipe.instructions} />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button 
              variant="outline"
              onClick={handleRegenerateRecipe}
              className="flex items-center justify-center"
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Give Me Another Idea
            </Button>
          </div>
          
          <RecipeEmailPrompt 
            recipe={recipe}
            onSendEmail={() => sendRecipeEmail(recipe)} 
            emailLoading={emailLoading} 
            emailSent={emailSent} 
          />
        </CardContent>
        
        <CardFooter className="flex justify-center py-6 border-t border-fime-green/20 bg-fime-lightGreen">
          <p className="text-center text-sm text-muted-foreground">
            Glad I could help! Come back anytime you need meal inspiration 😊
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecipePreview;
