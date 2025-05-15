
export interface PremiumSubstance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
  brand?: string;
  premium: boolean;
}

export const fetchPremiumSubstances = async (): Promise<PremiumSubstance[]> => {
  // In a real application, this would fetch from an API
  return mockPremiumSubstances;
};

export const mockPremiumSubstances: PremiumSubstance[] = [
  {
    id: "premium-1",
    name: "Super Grow X",
    formula: "NPK-20-15-10",
    elements: { "N (NO3-)": 20, P: 15, K: 10 },
    brand: "BoraGrow",
    premium: true
  },
  {
    id: "premium-2",
    name: "Bloom Accelerator",
    formula: "NPK-5-15-30",
    elements: { "N (NO3-)": 5, P: 15, K: 30, Ca: 5, Mg: 2 },
    brand: "BoraGrow",
    premium: true
  },
  {
    id: "premium-3",
    name: "Root Enhancer",
    formula: "NPK-10-45-10",
    elements: { "N (NH4+)": 10, P: 45, K: 10, Fe: 0.5 },
    brand: "BoraGrow",
    premium: true
  }
];
