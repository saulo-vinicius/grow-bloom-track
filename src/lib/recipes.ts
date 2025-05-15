
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";

export interface NutrientRecipe {
  id?: string;
  name: string;
  description?: string;
  substances: any[];
  elements: any[];
  solution_volume: number;
  volume_unit: string;
  data?: any;
  ec_value?: number;
  user_id?: string;
  created_at?: string;
}

// Type to handle Supabase data conversion
type SupabaseNutrientRecipe = Omit<NutrientRecipe, 'substances' | 'elements' | 'data'> & {
  substances: Json;
  elements: Json;
  data: Json;
};

/**
 * Convert Supabase data to our internal format
 */
const convertSupabaseToNutrientRecipe = (data: SupabaseNutrientRecipe): NutrientRecipe => {
  return {
    ...data,
    substances: Array.isArray(data.substances) ? data.substances : [],
    elements: Array.isArray(data.elements) ? data.elements : [],
    data: data.data || null
  };
};

/**
 * Save a nutrient recipe to the database
 */
export const saveNutrientRecipe = async (recipe: NutrientRecipe): Promise<NutrientRecipe> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const recipeData = {
      ...recipe,
      user_id: user.id,
      substances: recipe.substances || [],
      elements: recipe.elements || [],
      data: {
        substances: recipe.substances || [],
        elements: recipe.elements || [],
        ecValue: recipe.ec_value || 0,
        solutionVolume: recipe.solution_volume || 1,
        volumeUnit: recipe.volume_unit || 'liters',
      }
    };

    console.log("Saving recipe:", recipeData);

    const { data, error } = await supabase
      .from("nutrient_recipes")
      .insert(recipeData)
      .select()
      .single();

    if (error) {
      console.error("Error saving recipe:", error);
      throw error;
    }

    return convertSupabaseToNutrientRecipe(data as SupabaseNutrientRecipe);
  } catch (error) {
    console.error("Error in saveNutrientRecipe:", error);
    throw error;
  }
};

/**
 * Get all recipes for the current user
 */
export const getUserRecipes = async (): Promise<NutrientRecipe[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("nutrient_recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }

  return (data || []).map(item => convertSupabaseToNutrientRecipe(item as SupabaseNutrientRecipe));
};

/**
 * Delete a recipe by ID
 */
export const deleteNutrientRecipe = async (recipeId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("nutrient_recipes")
    .delete()
    .eq("id", recipeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting recipe:", error);
    throw error;
  }
};

/**
 * Get a specific recipe by ID
 */
export const getRecipeById = async (recipeId: string): Promise<NutrientRecipe> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("nutrient_recipes")
    .select("*")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }

  return convertSupabaseToNutrientRecipe(data as SupabaseNutrientRecipe);
};

/**
 * Save a custom substance to the database
 */
export const saveCustomSubstance = async (substance: any): Promise<any> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const substanceData = {
    ...substance,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("custom_substances")
    .upsert(substanceData)
    .select()
    .single();

  if (error) {
    console.error("Error saving custom substance:", error);
    throw error;
  }

  return data;
};

/**
 * Get all custom substances for the current user
 */
export const getUserCustomSubstances = async (): Promise<any[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("custom_substances")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching custom substances:", error);
    throw error;
  }

  return data || [];
};

/**
 * Delete a custom substance by ID
 */
export const deleteCustomSubstance = async (substanceId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("custom_substances")
    .delete()
    .eq("id", substanceId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting custom substance:", error);
    throw error;
  }
};
