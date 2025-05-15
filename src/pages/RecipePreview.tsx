
import React, { useState } from 'react';
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
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);

  const handleImageReceived = (imageUrl: string) => {
    console.log("AI-generated image received in RecipePreview:", imageUrl);
    setAiGeneratedImageUrl(imageUrl);
    
    // Update the recipe object with the new image URL
    if (recipe) {
      recipe.imageUrl = imageUrl;
    }
  };

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
          {(aiGeneratedImageUrl || recipe.imageUrl) && (
            <div className="flex flex-col items-center mb-6">
              <img 
                src={aiGeneratedImageUrl || recipe.imageUrl} 
                alt={recipe.recipeName} 
                className="rounded-xl max-h-64 object-cover shadow-sm"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.currentTarget.src = 'https://source.unsplash.com/featured/?food,cooking';
                }}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {aiGeneratedImageUrl 
                  ? 'AI-generated image based on your ingredients' 
                  : recipe.imageUrl.includes('unsplash.com') 
                    ? 'Using a stock photo (AI image generation in progress)' 
                    : 'AI-generated image based on your ingredients'}
              </p>
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
          
          {/* Send the image prompt and register the callback to receive the image URL */}
          {recipe.imagePrompt && (
            <RecipeImagePrompt 
              prompt={recipe.imagePrompt} 
              onImageReceived={handleImageReceived} 
            />
          )}
          
          <RecipeEmailPrompt 
            recipe={{...recipe, imageUrl: aiGeneratedImageUrl || recipe.imageUrl}}
            onSendEmail={() => sendRecipeEmail({...recipe, imageUrl: aiGeneratedImageUrl || recipe.imageUrl})} 
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
