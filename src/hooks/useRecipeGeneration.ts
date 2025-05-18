
import { useState, useEffect } from 'react';
import { Recipe, RecipeFormData } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useRecipeGeneration = (formData: RecipeFormData | null) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const generateRecipe = async () => {
      if (!formData) {
        navigate('/nutrition');
        return;
      }

      try {
        setLoading(true);
        // Call the Supabase Edge Function to generate a recipe
        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            ingredients: formData.ingredients,
            goals: formData.goals,
            cookingTime: formData.cookingTime
          }
        });

        if (error) throw error;

        // Set the recipe data
        setRecipe(data);
        
        // Save the search to history if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await saveSearchToHistory(formData, data);
        }
      } catch (error) {
        console.error('Error generating recipe:', error);
        toast({
          title: "Error",
          description: "Failed to generate a recipe. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateRecipe();
  }, [formData, navigate]);

  const saveSearchToHistory = async (formData: RecipeFormData, recipeData: Recipe) => {
    try {
      // Convert the recipe data to a plain JSON-serializable object
      // This removes any Date objects which aren't directly serializable
      const recipeDetailsJson = JSON.parse(JSON.stringify(recipeData));
      
      const { error } = await supabase
        .from('searches')
        .insert({
          user_id: (await supabase.auth.getSession()).data.session?.user.id,
          ingredients: formData.ingredients,
          goal: formData.goals.join(', '),
          cooking_time: formData.cookingTime,
          recipe_name: recipeData.recipeName,
          recipe_details: recipeDetailsJson
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving search history:', error);
      // We don't show a toast here to avoid disrupting the user experience
    }
  };

  const handleSaveRecipe = () => {
    if (recipe) {
      // Save to local storage for now (we'll implement database saving later)
      const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      savedRecipes.push({...recipe, isFavorited: true});
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      toast({
        title: "Success",
        description: "Recipe saved to your favorites!",
        variant: "default",
      });
    }
  };

  return { recipe, loading, handleSaveRecipe };
};
