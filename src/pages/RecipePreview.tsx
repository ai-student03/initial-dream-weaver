
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeFormData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const RecipePreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as RecipeFormData;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  useEffect(() => {
    if (!formData) {
      navigate('/');
      return;
    }
    
    // Call the Supabase Edge Function to generate a recipe
    const generateRecipe = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('generate-recipe', {
          body: {
            ingredients: formData.ingredients,
            goals: formData.goals,
            cookingTime: formData.cookingTime
          }
        });
        
        if (error) {
          throw error;
        }
        
        setRecipe(data as Recipe);
      } catch (error) {
        console.error("Error generating recipe:", error);
        toast.error("Failed to generate a recipe. Please try again.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    generateRecipe();
  }, [formData, navigate]);

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    
    try {
      setSavingRecipe(true);
      
      // Get the user's ID from the session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to save recipes");
        navigate("/auth");
        return;
      }
      
      const { error } = await supabase.from('saved_recipes').insert({
        recipe_name: recipe.recipeName,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        calories: recipe.calories,
        cooking_time: recipe.cookingTime,
        goals: recipe.goals,
        image_url: recipe.imageUrl,
        is_favorited: recipe.isFavorited,
        user_id: session.user.id
      });
      
      if (error) throw error;
      
      toast.success("Recipe saved successfully!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Failed to save recipe. Please try again.");
    } finally {
      setSavingRecipe(false);
    }
  };

  const handleOpenEmailDialog = () => {
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe || !emailAddress || !emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setSendingEmail(true);
      
      const { data, error } = await supabase.functions.invoke('send-recipe-email', {
        body: {
          recipe,
          email: emailAddress
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Recipe sent to your email!");
      setEmailDialogOpen(false);
      setEmailAddress('');
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-xl px-4 py-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">FiMe</h1>
            <p className="text-muted-foreground">Creating your perfect recipe...</p>
          </div>
          
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-8" />
          <Skeleton className="w-3/4 h-8" />
          <div className="space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="container max-w-xl px-4 py-8">
      <div className="space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-primary">Your Recipe</h1>
        </div>
        
        {recipe.imageUrl && (
          <Card className="overflow-hidden">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.recipeName} 
              className="w-full h-[250px] object-cover"
            />
          </Card>
        )}
        
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">{recipe.recipeName}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.goals.map((goal) => (
              <span key={goal} className="tag">{goal}</span>
            ))}
            <span className="tag">{recipe.cookingTime} mins</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-md mb-6">
            <div className="text-center">
              <p className="text-lg font-bold">{recipe.calories}</p>
              <p className="text-xs text-muted-foreground">calories</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{recipe.protein}g</p>
              <p className="text-xs text-muted-foreground">protein</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{recipe.carbs}g</p>
              <p className="text-xs text-muted-foreground">carbs</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{recipe.fat}g</p>
              <p className="text-xs text-muted-foreground">fat</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <p className="whitespace-pre-line">{recipe.instructions}</p>
          </div>
        </Card>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleSaveRecipe} 
            variant="secondary" 
            className="flex-1"
            disabled={savingRecipe}
          >
            {savingRecipe ? 'Saving...' : 'Save Recipe'}
          </Button>
          <Button 
            onClick={handleOpenEmailDialog}
            className="flex-1"
            disabled={sendingEmail}
          >
            Email Recipe
          </Button>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          variant="outline" 
          className="w-full"
        >
          Create Another Recipe
        </Button>

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Recipe by Email</DialogTitle>
              <DialogDescription>
                Enter your email address to receive this recipe.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendEmail}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={sendingEmail}>
                  {sendingEmail ? 'Sending...' : 'Send Recipe'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RecipePreview;
