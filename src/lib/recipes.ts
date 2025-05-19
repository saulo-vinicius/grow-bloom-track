
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { CustomSubstance } from "@/types/calculator";
import { v4 as uuidv4 } from 'uuid';

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
 * Check if the user is authenticated and get the user
 */
const getAuthenticatedUser = async (): Promise<User> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error(error?.message || "User not authenticated");
    }
    
    return user;
  } catch (error: any) {
    console.error("Authentication error:", error);
    toast("Erro de autenticação. Por favor, faça login novamente.");
    throw new Error("User not authenticated");
  }
};

/**
 * Save a nutrient recipe to the database
 */
export const saveNutrientRecipe = async (recipe: NutrientRecipe): Promise<NutrientRecipe> => {
  try {
    const user = await getAuthenticatedUser();
    
    // Ensure the recipe data is properly formatted for JSON serialization
    const recipeData = {
      ...recipe,
      id: recipe.id || uuidv4(), // Ensure valid UUID
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

    // Convert arrays to JSON compatible format
    const dbRecipe = {
      ...recipeData,
      substances: recipeData.substances as unknown as Json,
      elements: recipeData.elements as unknown as Json,
      data: recipeData.data as unknown as Json
    };

    console.log("Saving recipe:", dbRecipe);

    const { data, error } = await supabase
      .from("nutrient_recipes")
      .upsert(dbRecipe)
      .select()
      .single();

    if (error) {
      console.error("Error saving recipe:", error);
      throw error;
    }

    return convertSupabaseToNutrientRecipe(data as SupabaseNutrientRecipe);
  } catch (error: any) {
    console.error("Error in saveNutrientRecipe:", error);
    toast("Erro ao salvar receita: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Get all recipes for the current user
 */
export const getUserRecipes = async (): Promise<NutrientRecipe[]> => {
  try {
    const user = await getAuthenticatedUser();

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
  } catch (error: any) {
    console.error("Error in getUserRecipes:", error);
    toast("Erro ao carregar receitas: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Delete a recipe by ID
 */
export const deleteNutrientRecipe = async (recipeId: string): Promise<void> => {
  try {
    const user = await getAuthenticatedUser();

    const { error } = await supabase
      .from("nutrient_recipes")
      .delete()
      .eq("id", recipeId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  } catch (error: any) {
    console.error("Error in deleteNutrientRecipe:", error);
    toast("Erro ao excluir receita: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Get a specific recipe by ID
 */
export const getRecipeById = async (recipeId: string): Promise<NutrientRecipe> => {
  try {
    const user = await getAuthenticatedUser();

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
  } catch (error: any) {
    console.error("Error in getRecipeById:", error);
    toast("Erro ao carregar receita: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Save a custom substance to the database
 */
export const saveCustomSubstance = async (substance: CustomSubstance): Promise<CustomSubstance> => {
  try {
    const user = await getAuthenticatedUser();

    // Ensure there's a valid id
    if (!substance.id || substance.id.startsWith('custom-')) {
      substance.id = uuidv4();
    }

    // Ensure the substance data is properly formatted for JSON serialization
    const substanceData = {
      ...substance,
      user_id: user.id,
      elements: substance.elements as unknown as Json
    };

    console.log("Saving substance with ID:", substanceData.id);

    const { data, error } = await supabase
      .from("custom_substances")
      .upsert(substanceData)
      .select()
      .single();

    if (error) {
      console.error("Error saving custom substance:", error);
      throw error;
    }

    // Convert back to our internal format
    return {
      ...data,
      elements: data.elements as unknown as Record<string, number>
    };
  } catch (error: any) {
    console.error("Error in saveCustomSubstance:", error);
    toast("Erro ao salvar substância: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Get all custom substances for the current user
 */
export const getUserCustomSubstances = async (): Promise<CustomSubstance[]> => {
  try {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from("custom_substances")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching custom substances:", error);
      throw error;
    }

    // Convert elements to our internal format
    return (data || []).map(item => ({
      ...item,
      elements: item.elements as unknown as Record<string, number>
    }));
  } catch (error: any) {
    console.error("Error in getUserCustomSubstances:", error);
    toast("Erro ao carregar substâncias personalizadas: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};

/**
 * Delete a custom substance by ID
 */
export const deleteCustomSubstance = async (substanceId: string): Promise<void> => {
  try {
    const user = await getAuthenticatedUser();

    const { error } = await supabase
      .from("custom_substances")
      .delete()
      .eq("id", substanceId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting custom substance:", error);
      throw error;
    }
  } catch (error: any) {
    console.error("Error in deleteCustomSubstance:", error);
    toast("Erro ao excluir substância: " + (error.message || "Falha desconhecida"));
    throw error;
  }
};
