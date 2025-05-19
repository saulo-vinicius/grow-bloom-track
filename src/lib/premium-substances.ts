
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
  return []; // Returning an empty array as per request to remove premium substances
};

// Mantendo a função mockPremiumSubstances mas com array vazio
export const mockPremiumSubstances: PremiumSubstance[] = [];
