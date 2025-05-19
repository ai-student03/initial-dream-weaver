
/**
 * Type definitions for recipe generation
 */

export type Recipe = {
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
};
