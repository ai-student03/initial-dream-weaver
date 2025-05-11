
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Recipe } from '@/lib/types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SavedRecipes: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      fetchRecipes();
    };
    
    checkAuth();
  }, [navigate]);
  
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Recipe type
      const transformedRecipes = data.map((item) => ({
        id: item.id,
        recipeName: item.recipe_name,
        ingredients: item.ingredients,
        instructions: item.instructions,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        calories: item.calories,
        cookingTime: item.cooking_time,
        goals: item.goals,
        imageUrl: item.image_url,
        isFavorited: item.is_favorited,
        createdAt: new Date(item.created_at),
      }));
      
      setRecipes(transformedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load your saved recipes.");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .update({ is_favorited: !currentStatus })
        .eq('id', recipeId);
      
      if (error) throw error;
      
      // Update the local state
      setRecipes(recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorited: !currentStatus } 
          : recipe
      ));
      
      toast.success(currentStatus 
        ? "Recipe removed from favorites" 
        : "Recipe added to favorites"
      );
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status.");
    }
  };
  
  const deleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) throw error;
      
      // Update the local state
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      
      toast.success("Recipe deleted successfully");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe.");
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-5xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Loading recipes...</h1>
        </div>
      </div>
    );
  }

  const favoriteRecipes = recipes.filter(recipe => recipe.isFavorited);
  
  return (
    <div className="container max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">FiMe</h1>
        <p className="text-muted-foreground">Your Saved Recipes</p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate('/')}>New Recipe</Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Recipes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {recipes.length === 0 ? (
            <Card className="p-6 text-center">
              <p>You haven't saved any recipes yet.</p>
              <Button onClick={() => navigate('/')} className="mt-4">Create Your First Recipe</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteRecipe}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites">
          {favoriteRecipes.length === 0 ? (
            <Card className="p-6 text-center">
              <p>You haven't favorited any recipes yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onToggleFavorite={toggleFavorite}
                  onDelete={deleteRecipe}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string, isFavorited: boolean) => void;
  onDelete: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFavorite, onDelete }) => {
  const navigate = useNavigate();

  const viewRecipe = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      {recipe.imageUrl && (
        <div className="relative h-40">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.recipeName} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={() => recipe.id && onToggleFavorite(recipe.id, recipe.isFavorited)}
            className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={recipe.isFavorited ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={recipe.isFavorited ? "text-red-500" : "text-gray-500"}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </button>
        </div>
      )}
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg line-clamp-2 mb-1">{recipe.recipeName}</h3>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {recipe.goals.slice(0, 2).map((goal, index) => (
            <span key={index} className="tag text-xs">{goal}</span>
          ))}
          {recipe.goals.length > 2 && (
            <span className="tag text-xs">+{recipe.goals.length - 2}</span>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mb-3">
          <div className="flex justify-between">
            <span>{recipe.calories} cal</span>
            <span>{recipe.cookingTime} mins</span>
          </div>
        </div>
        
        <div className="mt-auto flex gap-2">
          <Button variant="outline" className="flex-1" onClick={viewRecipe}>
            View
          </Button>
          <Button 
            variant="outline"
            className="p-2 text-destructive"
            onClick={() => recipe.id && onDelete(recipe.id)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedRecipes;
