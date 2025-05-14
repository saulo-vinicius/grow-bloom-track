
export interface PremiumSubstance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
  premium: boolean;
  brand: string;
}

// Mock premium substances for testing or when API is unavailable
export const mockPremiumSubstances: PremiumSubstance[] = [
  {
    id: "advanced-micro",
    name: "Advanced Nutrients Micro",
    formula: "",
    elements: {
      "N (NO3-)": 5.0,
      "N (NH4+)": 0.4,
      Ca: 6.0,
      Fe: 0.1,
      Mn: 0.05,
      B: 0.02,
      Zn: 0.02,
      Cu: 0.01,
      Mo: 0.002
    },
    premium: true,
    brand: "Advanced Nutrients"
  },
  {
    id: "advanced-grow",
    name: "Advanced Nutrients Grow",
    formula: "",
    elements: {
      "N (NO3-)": 3.0,
      "N (NH4+)": 1.0,
      P: 1.0,
      K: 3.0,
      Mg: 0.5,
      S: 0.5
    },
    premium: true,
    brand: "Advanced Nutrients"
  },
  {
    id: "advanced-bloom",
    name: "Advanced Nutrients Bloom",
    formula: "",
    elements: {
      "N (NO3-)": 1.0,
      "N (NH4+)": 0.5,
      P: 4.0,
      K: 8.0,
      Mg: 0.5,
      S: 1.0
    },
    premium: true,
    brand: "Advanced Nutrients"
  },
  {
    id: "plant-prod-mj-boost",
    name: "Plant-Prod MJ Boost",
    formula: "",
    elements: {
      P: 10.0,
      K: 30.0,
      S: 9.0,
      Mg: 3.0
    },
    premium: true,
    brand: "Plant-Prod MJ"
  },
  {
    id: "plant-prod-mj-grow",
    name: "Plant-Prod MJ Grow",
    formula: "",
    elements: {
      "N (NO3-)": 12.0,
      "N (NH4+)": 1.0,
      P: 8.0,
      K: 18.0,
      Mg: 2.5,
      S: 3.0,
      Fe: 0.1,
      Mn: 0.05,
      B: 0.02,
      Zn: 0.02,
      Cu: 0.01,
      Mo: 0.002
    },
    premium: true,
    brand: "Plant-Prod MJ"
  }
];

// Function to fetch premium substances from Supabase storage
export const fetchPremiumSubstances = async (): Promise<PremiumSubstance[]> => {
  try {
    // In the future, this can be replaced with a real Supabase call
    // For now, just return the mock data
    return mockPremiumSubstances;
  } catch (error) {
    console.error("Error fetching premium substances:", error);
    return [];
  }
};
