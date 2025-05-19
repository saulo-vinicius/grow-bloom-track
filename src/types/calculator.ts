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

// Interface para substâncias
export interface Substance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
}

// Interface para substâncias selecionadas
export interface SelectedSubstance extends Substance {
  weight: number;
}

// Interface para substâncias personalizadas
export interface CustomSubstance {
  id?: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
  user_id?: string;
}
