export interface Substance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
}

export interface SelectedSubstance extends Substance {
  weight: number;
}

export interface CalculationResult {
  substances: {
    name: string;
    weight: number;
    volumePerLiter: number;
  }[];
  elements: {
    element: string;
    target: number;
    actual: number;
    difference: number;
  }[];
  ecValue: string;
  name?: string;
  description?: string;
  solutionVolume?: number;
  volumeUnit?: string;
}

// Add a simple user type for the calculator component
export interface SimpleUser {
  id: string;
  email: string;
  isPremium: boolean;
}
