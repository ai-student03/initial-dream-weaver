
// Since we're just fixing the imageUrl errors and not modifying the full functionality,
// we'll just focus on the parts that need to be changed.

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Trash2, Search, ArrowUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const SavedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Recipe;
    direction: 'asc' | 'desc';
  }>({
    key: 'recipeName',
    direction: 'asc',
  });
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        const { data, error } = await supabase
          .from('saved_recipes')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (error) throw error;
        
        if (data) {
          const mappedRecipes = data.map(item => ({
            id: item.id,
            recipeName: item.recipe_name,
            ingredients: item.ingredients,
            instructions: item.instructions,
            protein: item.protein || 0,
            carbs: item.carbs || 0,
            fat: item.fat || 0,
            calories: item.calories || 0,
            cookingTime: item.cooking_time || 0,
            goals: item.goals || [],
            isFavorited: item.is_favorited || false,
            createdAt: item.created_at ? new Date(item.created_at) : undefined
          }));
          
          setRecipes(mappedRecipes);
        }
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved recipes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [navigate]);

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeToDelete.id);

      if (error) throw error;

      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeToDelete.id));
      toast({
        title: 'Recipe deleted',
        description: 'The recipe has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRecipeToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const confirmDelete = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteConfirmOpen(true);
  };

  const handleSort = (key: keyof Recipe) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const toggleFavorite = async (recipe: Recipe) => {
    try {
      const updatedRecipe = { ...recipe, isFavorited: !recipe.isFavorited };
      
      setRecipes(prevRecipes =>
        prevRecipes.map(r => (r.id === recipe.id ? updatedRecipe : r))
      );

      const { error } = await supabase
        .from('saved_recipes')
        .update({ is_favorited: updatedRecipe.isFavorited })
        .eq('id', recipe.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert the optimistic update
      setRecipes(prevRecipes =>
        prevRecipes.map(r => (r.id === recipe.id ? recipe : r))
      );
      toast({
        title: 'Error',
        description: 'Failed to update favorite status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];
    
    if (filterFavorites) {
      result = result.filter(recipe => recipe.isFavorited);
    }
    
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(recipe => 
        recipe.recipeName.toLowerCase().includes(lowerCaseSearchTerm) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(lowerCaseSearchTerm)
        ) ||
        recipe.goals.some(goal => 
          goal.toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }
    
    return result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
  }, [recipes, searchTerm, sortConfig, filterFavorites]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Loading your saved recipes...</p>
        </div>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">My Saved Recipes</h1>
        <div className="text-center">
          <p className="mb-4">You don't have any saved recipes yet.</p>
          <Button onClick={() => navigate('/')} className="bg-[#FF6F61] hover:bg-[#ff5d4d]">
            Find New Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">My Saved Recipes</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Heart className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={filterFavorites}
              onCheckedChange={setFilterFavorites}
            >
              Show favorites only
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button onClick={() => navigate('/')} className="w-full sm:w-auto bg-[#FF6F61] hover:bg-[#ff5d4d]">
          Find New Recipes
        </Button>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('recipeName')}
                >
                  Recipe Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('calories')}
                >
                  Calories
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('cookingTime')}
                >
                  Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipes.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.recipeName}</TableCell>
                <TableCell>{recipe.calories} cal</TableCell>
                <TableCell>{recipe.cookingTime} min</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(recipe)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${recipe.isFavorited ? 'fill-[#FF6F61]' : ''}`} 
                      />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => confirmDelete(recipe)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{recipeToDelete?.recipeName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedRecipes;
