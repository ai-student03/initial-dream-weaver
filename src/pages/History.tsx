
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SearchHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Utensils, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import RecipeNutritionInfo from '@/components/recipe/RecipeNutritionInfo';
import RecipeGoals from '@/components/recipe/RecipeGoals';
import RecipeIngredients from '@/components/recipe/RecipeIngredients';
import RecipeInstructions from '@/components/recipe/RecipeInstructions';
import { toast } from '@/hooks/use-toast';

const History = () => {
  const [searches, setSearches] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<SearchHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        const { data, error } = await supabase
          .from('searches')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map the Supabase data to our SearchHistory type
        if (data) {
          const searchHistory: SearchHistory[] = data.map(item => ({
            id: item.id,
            ingredients: item.ingredients,
            goal: item.goal,
            cookingTime: item.cooking_time,
            recipeName: item.recipe_name,
            recipeDetails: item.recipe_details,
            createdAt: item.created_at
          }));
          
          setSearches(searchHistory);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
        toast({
          title: "Error",
          description: "Failed to load search history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchHistory();
  }, [navigate]);
  
  const handleViewRecipe = (search: SearchHistory) => {
    setSelectedRecipe(search);
    setDialogOpen(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading search history...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Recipe Search History</h1>
        
        {searches.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't searched for any recipes yet.</p>
                <Button onClick={() => navigate('/nutrition')}>Find a Recipe</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => (
              <Card key={search.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#FFDAB9] to-[#F8BBD0] bg-opacity-50 pb-4">
                  <CardTitle className="text-xl">{search.recipeName}</CardTitle>
                  <CardDescription>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {search.cookingTime} minutes
                    </span>
                    <span className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {formatDate(search.createdAt)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-3">
                    <div className="text-sm font-semibold">Ingredients:</div>
                    <div className="text-sm text-muted-foreground">{search.ingredients}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold">Goal:</div>
                    <div className="px-2 py-1 rounded-full bg-[#F8BBD0] bg-opacity-40 text-sm inline-block">
                      {search.goal}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-[#FF6F61] hover:bg-[#ff5d4d]" 
                    onClick={() => handleViewRecipe(search)}
                  >
                    <Utensils className="mr-2 h-4 w-4" /> View Recipe
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {selectedRecipe && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center text-2xl">
                <Utensils className="mr-2 h-6 w-6" /> 
                {selectedRecipe.recipeDetails.recipeName}
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" /> 
                  {selectedRecipe.cookingTime} minutes
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <RecipeNutritionInfo recipe={selectedRecipe.recipeDetails} />
              <RecipeGoals goals={selectedRecipe.recipeDetails.goals} />
              <RecipeIngredients ingredients={selectedRecipe.recipeDetails.ingredients} />
              <RecipeInstructions instructions={selectedRecipe.recipeDetails.instructions} />
            </div>
            
            <DialogFooter className="mt-4">
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default History;
