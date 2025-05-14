
import { createClient } from "@/integrations/supabase/client";

export interface NutrientRecipe {
  id?: string;
  name: string;
  description?: string;
  substances: Array<{
    name: string;
    weight: number;
    volumePerLiter: number;
  }>;
  elements: Array<{
    element: string;
    target: number;
    actual: number;
    difference: number;
  }>;
  solution_volume: number;
  volume_unit: string;
  ec_value?: number;
  created_at?: string;
  user_id?: string;
}

export const saveNutrientRecipe = async (recipeData: NutrientRecipe): Promise<NutrientRecipe> => {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to save recipes");
  }
  
  // Add user_id to the recipe data
  const recipeWithUser = {
    ...recipeData,
    user_id: user.id
  };
  
  // Save to Supabase
  const { data, error } = await supabase
    .from('nutrient_recipes')
    .insert(recipeWithUser)
    .select()
    .single();
    
  if (error) {
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
  
  return data;
};

export const getUserRecipes = async (): Promise<NutrientRecipe[]> => {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }
  
  // Fetch recipes for the current user
  const { data, error } = await supabase
    .from('nutrient_recipes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
  
  return data || [];
};

export const deleteNutrientRecipe = async (recipeId: string): Promise<void> => {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to delete recipes");
  }
  
  // Delete the recipe
  const { error } = await supabase
    .from('nutrient_recipes')
    .delete()
    .eq('id', recipeId)
    .eq('user_id', user.id); // Ensure the user can only delete their own recipes
    
  if (error) {
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
};
