import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeFormData } from '@/lib/types';
import { toast } from 'sonner';
import { Loader, Mail, Utensils, Check } from 'lucide-react';

const RecipePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const formData = location.state?.formData as RecipeFormData;

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
      } catch (error) {
        console.error('Error generating recipe:', error);
        toast.error('Failed to generate a recipe. Please try again.');
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
      toast.success('Recipe saved to your favorites!');
    }
  };

  const handleSendEmail = async () => {
    if (!recipe) return;
    
    try {
      setEmailLoading(true);
      
      // Get the user's email - in a real app this would come from authentication
      const userEmail = prompt("Please enter your email address:");
      
      if (!userEmail) {
        setEmailLoading(false);
        return;
      }
      
      // Call the send-recipe-email function
      const { data, error } = await supabase.functions.invoke('send-recipe-email', {
        body: {
          recipe,
          email: userEmail
        }
      });
      
      if (error) throw error;
      
      toast.success('Recipe sent to your email!');
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send the email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-center space-y-4">
          <Loader className="mx-auto h-12 w-12 text-[#FF6F61] animate-spin" />
          <h3 className="text-xl font-medium text-[#FF6F61]">Creating your perfect meal...</h3>
          <p className="text-muted-foreground">Based on your ingredients and goals</p>
        </div>
      </div>
    );
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
          {recipe.imageUrl && (
            <div className="flex justify-center mb-6">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.recipeName} 
                className="rounded-xl max-h-64 object-cover shadow-sm"
              />
            </div>
          )}
          
          {/* Nutritional Information */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
            <div className="text-center">
              <p className="text-xl font-bold">{recipe.calories}</p>
              <p className="text-sm text-muted-foreground">calories</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{recipe.protein}g</p>
              <p className="text-sm text-muted-foreground">protein</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{recipe.carbs}g</p>
              <p className="text-sm text-muted-foreground">carbs</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{recipe.fat}g</p>
              <p className="text-sm text-muted-foreground">fat</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Cooking Time</h3>
            <p>{recipe.cookingTime} minutes</p>
          </div>
          
          {/* Goals */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Goals</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.goals.map((goal, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 rounded-full bg-[#F8BBD0] bg-opacity-40 text-sm"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
          
          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Instructions</h3>
            <div className="space-y-2">
              {recipe.instructions.split('\n').map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
          </div>
          
          {/* Email Prompt */}
          <div className="mt-6 p-4 bg-[#FFDAB9] bg-opacity-20 rounded-lg">
            <p className="text-center mb-4">Like this recipe? Want me to send it to your email?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleSendEmail} 
                disabled={emailLoading || emailSent}
                className="bg-[#FF6F61] hover:bg-[#ff5d4d] flex-1"
              >
                {emailLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : emailSent ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Sent!
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Send to my email
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/nutrition')}
                className="border-[#F8BBD0] hover:border-[#FF6F61] flex-1"
              >
                Back to chat
              </Button>
            </div>
          </div>
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
