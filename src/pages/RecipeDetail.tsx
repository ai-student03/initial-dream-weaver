
// Since we're just fixing the imageUrl errors and not modifying the full functionality,
// we'll just focus on the parts that need to be changed.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Utensils, Heart, Home } from 'lucide-react';
import RecipeIngredients from '@/components/recipe/RecipeIngredients';
import RecipeInstructions from '@/components/recipe/RecipeInstructions';
import RecipeNutritionInfo from '@/components/recipe/RecipeNutritionInfo';
import RecipeGoals from '@/components/recipe/RecipeGoals';
import { useRecipeEmail } from '@/hooks/useRecipeEmail';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { emailLoading, emailSent, sendRecipeEmail } = useRecipeEmail();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        navigate('/saved-recipes');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setRecipe({
            id: data.id,
            recipeName: data.recipe_name,
            ingredients: data.ingredients,
            instructions: data.instructions,
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fat || 0,
            calories: data.calories || 0,
            cookingTime: data.cooking_time || 0,
            goals: data.goals || [],
            isFavorited: data.is_favorited || false,
            createdAt: data.created_at ? new Date(data.created_at) : undefined
          });
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the recipe. Please try again.',
          variant: 'destructive',
        });
        navigate('/saved-recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const toggleFavorite = async () => {
    if (!recipe) return;

    try {
      const updatedRecipe = { ...recipe, isFavorited: !recipe.isFavorited };
      setRecipe(updatedRecipe);

      const { error } = await supabase
        .from('saved_recipes')
        .update({ is_favorited: updatedRecipe.isFavorited })
        .eq('id', recipe.id);

      if (error) throw error;

      toast({
        title: updatedRecipe.isFavorited ? 'Added to favorites' : 'Removed from favorites',
        description: updatedRecipe.isFavorited
          ? 'Recipe has been added to your favorites.'
          : 'Recipe has been removed from your favorites.',
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorite status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Recipe not found.</p>
          <Button onClick={() => navigate('/saved-recipes')} className="mt-4">
            Back to Saved Recipes
          </Button>
        </div>
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
          <RecipeNutritionInfo recipe={recipe} />

          <div>
            <h3 className="font-semibold text-lg mb-2">Cooking Time</h3>
            <p>{recipe.cookingTime} minutes</p>
          </div>

          <RecipeGoals goals={recipe.goals} />
          <RecipeIngredients ingredients={recipe.ingredients} />
          <RecipeInstructions instructions={recipe.instructions} />

          <div className="mt-6 p-4 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => sendRecipeEmail(recipe)} disabled={emailLoading || emailSent} className="flex-1">
                {emailLoading ? 'Sending...' : emailSent ? 'Email Sent!' : 'Email Recipe'}
              </Button>
              <Button
                onClick={toggleFavorite}
                variant={recipe.isFavorited ? 'default' : 'outline'}
                className={`flex-1 ${
                  recipe.isFavorited ? 'bg-[#FF6F61] hover:bg-[#ff5d4d]' : 'border-[#F8BBD0] hover:border-[#FF6F61]'
                }`}
              >
                <Heart className={`mr-2 h-4 w-4 ${recipe.isFavorited ? 'fill-current' : ''}`} />
                {recipe.isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center py-6 border-t border-[#F8BBD0] bg-[#FFDAB9] bg-opacity-10">
          <Button variant="outline" onClick={() => navigate('/saved-recipes')} className="mr-2">
            <Home className="mr-2 h-4 w-4" /> Back to Saved Recipes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecipeDetail;
