
import { Json } from "@/integrations/supabase/types";

export interface SimpleUser {
  id: string;
  email?: string;
  isPremium?: boolean;
}

export interface CalculationResult {
  nutrientA?: number;
  nutrientB?: number;
  nutrientC?: number;
  ph?: number;
  wateringFrequency?: number;
  lightHours?: number;
  expectedYield?: string;
  growthTime?: string;
  elements?: any[];
  substances?: any[];
  solutionVolume?: number;
  volumeUnit?: string;
  ecValue?: string;
  name?: string;
  description?: string;
}

// Define as interfaces para nutrientes e elementos
export interface NutrientElement {
  symbol: string;
  name: string;
  percentage: number;
}

export interface SubstanceElement {
  symbol: string;
  name: string;
  percentage: number;
}

// Base interface for substance properties
export interface SubstanceBase {
  name: string;
  formula?: string;
  elements: Record<string, number>;
}

// Interface para substâncias
export interface Substance extends SubstanceBase {
  id: string;
}

// Interface para substâncias selecionadas
export interface SelectedSubstance extends Substance {
  weight: number;
}

// Interface para substâncias personalizadas
// Now ensures id is required to match Substance
export interface CustomSubstance extends SubstanceBase {
  id: string; // Changed from optional to required to match Substance
  user_id?: string;
}

// Helper functions for type conversion
export const asSubstance = (customSubstance: CustomSubstance): Substance => {
  return {
    id: customSubstance.id,
    name: customSubstance.name,
    formula: customSubstance.formula,
    elements: customSubstance.elements
  };
};

export const asCustomSubstance = (substance: Substance, userId?: string): CustomSubstance => {
  return {
    id: substance.id,
    name: substance.name,
    formula: substance.formula,
    elements: substance.elements,
    user_id: userId
  };
};
