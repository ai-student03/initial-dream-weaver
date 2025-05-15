
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

        // Set the recipe data with imageUrl defaulting to empty string if not provided
        setRecipe({
          ...data,
          imageUrl: data.imageUrl || ''
        });
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
