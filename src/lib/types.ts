
// Adding FiMe app types to the existing types

export type NutritionGoal = 
  | 'Build muscle' 
  | 'Lose fat' 
  | 'Maintain weight' 
  | 'Cycle-based nutrition' 
  | 'Vegan' 
  | 'Gluten-free' 
  | 'Kosher';

export type RecipeFormData = {
  ingredients: string;
  goals: NutritionGoal[];
  cookingTime: number;
};

export type Recipe = {
  id?: string;
  recipeName: string;
  ingredients: string[];
  instructions: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  cookingTime: number;
  goals: string[];
  isFavorited: boolean;
  createdAt?: Date;
};

export type NutritionProfile = {
  id: string;
  preferredGoals: string[];
  dietaryRestrictions: string[];
  favoriteIngredients: string[];
};

// Adding the missing types for TaskFlow components
export type Priority = 'low' | 'medium' | 'high';

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  tags: Tag[];
};
