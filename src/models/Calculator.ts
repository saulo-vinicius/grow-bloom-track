
export interface Substance {
  id: string;
  name: string;
  category: string;
  n?: number; // Nitrogen percentage
  p?: number; // Phosphorus percentage
  k?: number; // Potassium percentage
  ca?: number; // Calcium percentage
  mg?: number; // Magnesium percentage
  s?: number; // Sulfur percentage
  fe?: number; // Iron percentage
  mn?: number; // Manganese percentage
  zn?: number; // Zinc percentage
  b?: number; // Boron percentage
  cu?: number; // Copper percentage
  mo?: number; // Molybdenum percentage
  density?: number; // g/ml
  isCustom?: boolean;
  userId?: string;
}

export interface CalcInputs {
  solutionVolume: number; // in liters
  substances: SubstanceInput[];
  plantType: string;
  growthPhase: string;
  environment: string;
  waterQuality: number;
}

export interface SubstanceInput {
  substanceId: string;
  substanceName: string;
  targetPPM: number;
  amount?: number; // calculated amount in ml or g
}

export interface CalcResults {
  substances: SubstanceResult[];
  totalNPK: NPKValues;
  ph: number;
  ec: number; // Electrical conductivity
  wateringFrequency: number;
  lightHours: number;
  expectedYield: string;
  growthTime: string;
}

export interface SubstanceResult {
  id: string;
  name: string;
  amount: number; // in ml or g
  ppm: number;
}

export interface NPKValues {
  n: number;
  p: number;
  k: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  createdAt: string;
  inputs: CalcInputs;
  results: CalcResults;
}

export const DEFAULT_SUBSTANCES: Substance[] = [
  {
    id: 'nutrient-a',
    name: 'Nutrient A',
    category: 'base',
    n: 4,
    p: 0,
    k: 1,
    ca: 2,
    mg: 0.5,
    density: 1.2
  },
  {
    id: 'nutrient-b',
    name: 'Nutrient B',
    category: 'base',
    n: 1,
    p: 3,
    k: 6,
    fe: 0.1,
    mn: 0.05,
    zn: 0.05,
    density: 1.3
  },
  {
    id: 'nutrient-c',
    name: 'Nutrient C',
    category: 'supplement',
    ca: 4,
    mg: 2,
    s: 1,
    density: 1.1
  },
  {
    id: 'ph-down',
    name: 'pH Down',
    category: 'ph',
    density: 1.2
  },
  {
    id: 'ph-up',
    name: 'pH Up',
    category: 'ph',
    density: 1.1
  }
]
