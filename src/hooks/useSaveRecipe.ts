
import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSaveRecipe = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveRecipe = async (recipe: Recipe) => {
    if (!recipe) return;
    
    try {
      setIsSaving(true);
      
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save recipes.",
          variant: "destructive",
        });
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if recipe is already saved
      const { data: existingRecipes } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId)
        .eq('recipe_name', recipe.recipeName);
      
      if (existingRecipes && existingRecipes.length > 0) {
        toast({
          title: "Recipe Already Saved",
          description: "This recipe is already saved to your recipes.",
          variant: "default",
        });
        setIsSaved(true);
        return;
      }
      
      // Save the recipe
      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: userId,
          recipe_name: recipe.recipeName,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          calories: recipe.calories,
          cooking_time: recipe.cookingTime,
          goals: recipe.goals,
          is_favorited: false
        });
      
      if (error) throw error;
      
      toast({
        title: "Recipe Saved!",
        description: "Recipe successfully saved to your collection.",
      });
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save the recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, isSaved, saveRecipe };
};
