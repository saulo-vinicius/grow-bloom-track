
import { Json } from "@/integrations/supabase/types";

export interface SimpleUser {
  id: string;
  email?: string;
}

export interface CalculationResult {
  nutrientA: number;
  nutrientB: number;
  nutrientC: number;
  ph: number;
  wateringFrequency: number;
  lightHours: number;
  expectedYield: string;
  growthTime: string;
  elements?: any[];
  substances?: any[];
  solutionVolume?: number;
  volumeUnit?: string;
  ecValue?: string;
  name?: string;
  description?: string;
}

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

export interface Substance {
  id: string;
  name: string;
  elements: SubstanceElement[];
}

export interface CustomSubstance {
  id?: string;
  name: string;
  formula?: string;
  elements: NutrientElement[];
  user_id?: string;
}
