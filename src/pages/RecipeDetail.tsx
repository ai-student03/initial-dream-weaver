
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from '@/lib/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/saved-recipes');
      return;
    }

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) {
          toast.error("Recipe not found");
          navigate('/saved-recipes');
          return;
        }
        
        // Transform the data to match our Recipe type
        setRecipe({
          id: data.id,
          recipeName: data.recipe_name,
          ingredients: data.ingredients,
          instructions: data.instructions,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          calories: data.calories,
          cookingTime: data.cooking_time,
          goals: data.goals,
          imageUrl: data.image_url,
          isFavorited: data.is_favorited,
          createdAt: new Date(data.created_at),
        });
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Failed to load recipe");
        navigate('/saved-recipes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, navigate]);

  const handleToggleFavorite = async () => {
    if (!recipe?.id) return;
    
    try {
      const updatedStatus = !recipe.isFavorited;
      
      const { error } = await supabase
        .from('saved_recipes')
        .update({ is_favorited: updatedStatus })
        .eq('id', recipe.id);
      
      if (error) throw error;
      
      setRecipe({ ...recipe, isFavorited: updatedStatus });
      
      toast.success(updatedStatus 
        ? "Added to favorites" 
        : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleSendEmail = async () => {
    if (!recipe) return;
    
    try {
      setSendingEmail(true);
      // Here we would call a Supabase Edge Function to send an email
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Recipe sent to your email!");
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
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="w-full h-[300px] rounded-lg" />
          <Skeleton className="w-full h-8" />
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
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/saved-recipes')}
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleFavorite}
            className={`${recipe.isFavorited ? 'text-red-500' : ''}`}
          >
            {recipe.isFavorited ? 'Unfavorite' : 'Favorite'}
          </Button>
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
            {recipe.goals.map((goal, index) => (
              <span key={index} className="tag">{goal}</span>
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
        
        <Button 
          onClick={handleSendEmail}
          className="w-full"
          disabled={sendingEmail}
        >
          {sendingEmail ? 'Sending...' : 'Email Recipe'}
        </Button>
      </div>
    </div>
  );
};

export default RecipeDetail;
