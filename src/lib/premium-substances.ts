
import { createClient } from "@/integrations/supabase/client";

export interface PremiumSubstance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
  premium?: boolean;
  brand?: string;
}

// Mock premium substances for testing
export const mockPremiumSubstances: PremiumSubstance[] = [
  {
    id: "calcium-nitrate-premium",
    name: "Calcium Nitrate",
    formula: "Ca(NO3)2",
    elements: { "N (NO3-)": 15.5, Ca: 19.0 },
    premium: true,
    brand: "ProNutrients"
  },
  {
    id: "potassium-nitrate-premium",
    name: "Potassium Nitrate",
    formula: "KNO3",
    elements: { "N (NO3-)": 13.0, K: 38.0 },
    premium: true,
    brand: "ProNutrients"
  },
  {
    id: "magnesium-sulfate-premium",
    name: "Magnesium Sulfate",
    formula: "MgSO4·7H2O",
    elements: { Mg: 9.8, S: 13.0 },
    premium: true,
    brand: "HydroNutri"
  },
  {
    id: "mono-potassium-phosphate-premium",
    name: "Mono Potassium Phosphate",
    formula: "KH2PO4",
    elements: { P: 22.8, K: 28.7 },
    premium: true,
    brand: "HydroNutri"
  },
  {
    id: "iron-chelate-premium",
    name: "Iron Chelate EDDHA",
    formula: "Fe-EDDHA",
    elements: { Fe: 6.0 },
    premium: true,
    brand: "MicroMix"
  },
  {
    id: "manganese-sulfate-premium",
    name: "Manganese Sulfate",
    formula: "MnSO4·H2O",
    elements: { Mn: 31.8, S: 18.5 },
    premium: true,
    brand: "MicroMix"
  }
];

/**
 * Fetch premium substances from database or API
 * In a real application, this would connect to a premium subscription service
 */
export const fetchPremiumSubstances = async (): Promise<PremiumSubstance[]> => {
  try {
    // In a real application, this would fetch from an API or database
    // For demo purposes, we're returning mock data
    
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data
    return mockPremiumSubstances;
  } catch (error) {
    console.error("Error fetching premium substances:", error);
    return [];
  }
};
