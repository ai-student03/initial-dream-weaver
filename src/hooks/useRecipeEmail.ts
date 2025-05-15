
import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRecipeEmail = () => {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const sendRecipeEmail = async (recipe: Recipe, email?: string) => {
    if (!recipe) return;
    
    try {
      setEmailLoading(true);
      
      // Get the user's email if not provided
      const userEmail = email || prompt("Please enter your email address:");
      
      if (!userEmail) {
        setEmailLoading(false);
        return;
      }
      
      // Ensure imageUrl is defined and properly formatted
      const recipeData = {
        recipeName: recipe.recipeName,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        calories: recipe.calories,
        cookingTime: recipe.cookingTime,
        goals: recipe.goals,
        imageUrl: recipe.imageUrl || 'https://source.unsplash.com/featured/?food,cooking' // Always provide an image URL
      };
      
      console.log("Sending recipe email with data:", recipeData);
      console.log("Image URL being sent:", recipeData.imageUrl);
      
      // Call the send-recipe-email function
      const { data, error } = await supabase.functions.invoke('send-recipe-email', {
        body: {
          recipe: recipeData,
          email: userEmail
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Recipe sent to your email!",
        variant: "default",
      });
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return { emailLoading, emailSent, sendRecipeEmail };
};
