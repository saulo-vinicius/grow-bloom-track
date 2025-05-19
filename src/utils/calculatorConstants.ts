// Constants used in the calculator

// Define nutrient color coding
export const nutrientColors: Record<string, string> = {
  "N (NO3-)": "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  "N (NH4+)": "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  P: "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  "P₂O₅": "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  K: "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  "K₂O": "bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300",
  Mg: "bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300",
  Ca: "bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300",
  S: "bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300",
  Fe: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Mn: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Zn: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  B: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Cu: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Mo: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Si: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  "SiO₂": "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Na: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
  Cl: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300",
};

// Define element to ions mapping for EC calculation
export const elementToIons: Record<string, Array<{ion: string, factor: number}>> = {
  "N (NO3-)": [{ ion: "NO3-", factor: 1 }],
  "N (NH4+)": [{ ion: "NH4+", factor: 1 }],
  "P": [{ ion: "H2PO4-", factor: 1 }],
  "K": [{ ion: "K+", factor: 1 }],
  "Mg": [{ ion: "Mg2+", factor: 1 }],
  "Ca": [{ ion: "Ca2+", factor: 1 }],
  "S": [{ ion: "SO42-", factor: 1 }],
  "Fe": [{ ion: "Fe2+", factor: 1 }],
  "Mn": [{ ion: "Mn2+", factor: 1 }],
  "Zn": [{ ion: "Zn2+", factor: 1 }],
  "Cu": [{ ion: "Cu2+", factor: 1 }],
  "B": [{ ion: "BO3-", factor: 1 }],
  "Mo": [{ ion: "MoO42-", factor: 1 }],
  "Si": [],
  "Na": [{ ion: "Na+", factor: 1 }],
  "Cl": [{ ion: "Cl-", factor: 1 }]
};

// Atomic weights of elements for mmol calculations
export const elementWeights: Record<string, number> = {
  "N (NO3-)": 14.0,
  "N (NH4+)": 14.0,
  "P": 30.97,
  "K": 39.10,
  "Mg": 24.31,
  "Ca": 40.08,
  "S": 32.06,
  "Fe": 55.85,
  "Mn": 54.94,
  "Zn": 65.38,
  "B": 10.81,
  "Cu": 63.55,
  "Si": 28.09,
  "Mo": 95.94,
  "Na": 22.99,
  "Cl": 35.45
};

// Updated ion conductivity values from HydroBuddy
export const ionConductivity: Record<string, number> = {
  "NH4+": 73.5,
  "K+": 73.5,
  "Ca2+": 119.0,
  "Mg2+": 106.0,
  "Fe2+": 108.0,
  "Mn2+": 107.0,
  "Zn2+": 105.6,
  "Cu2+": 108.0,
  "Na+": 50.1,
  "H+": 349.8,
  "NO3-": 71.5,
  "H2PO4-": 33.0,
  "HPO42-": 57.0,
  "SO42-": 160.0,
  "Cl-": 76.3,
  "HCO3-": 44.5,
  "BO3-": 32.0,
  "MoO42-": 74.5,
  "OH-": 198.0,
};

// Substance-to-ion mapping with accurate ratios
export const substanceIonMap: Record<string, { ion: string, ratio: number, molarMass: number }[]> = {
  "Ammonium Chloride": [
    { ion: "NH4+", ratio: 1, molarMass: 18.04 },
    { ion: "Cl-", ratio: 1, molarMass: 35.45 }
  ],
  "Ammonium Dibasic Phosphate": [
    { ion: "NH4+", ratio: 2, molarMass: 18.04 },
    { ion: "HPO42-", ratio: 1, molarMass: 96.0 }
  ],
  "Ammonium Monobasic Phosphate": [
    { ion: "NH4+", ratio: 1, molarMass: 18.04 },
    { ion: "H2PO4-", ratio: 1, molarMass: 97.0 }
  ],
  "Ammonium Sulfate": [
    { ion: "NH4+", ratio: 2, molarMass: 18.04 },
    { ion: "SO42-", ratio: 1, molarMass: 96.06 }
  ],
  "Boric Acid": [
    { ion: "H+", ratio: 1, molarMass: 1.01 },
    { ion: "BO3-", ratio: 1, molarMass: 58.8 }
  ],
  "Calcium Carbonate": [
    { ion: "Ca2+", ratio: 1, molarMass: 40.08 },
    { ion: "HCO3-", ratio: 1, molarMass: 61.0 }
  ],
  "Calcium Monobasic Phosphate": [
    { ion: "Ca2+", ratio: 1, molarMass: 40.08 },
    { ion: "H2PO4-", ratio: 2, molarMass: 97.0 }
  ],
  "Calcium Nitrate (ag grade)": [
    { ion: "Ca2+", ratio: 1, molarMass: 40.08 },
    { ion: "NO3-", ratio: 2, molarMass: 62.0 }
  ],
  "Calcium Sulfate (Dihydrate)": [
    { ion: "Ca2+", ratio: 1, molarMass: 40.08 },
    { ion: "SO42-", ratio: 1, molarMass: 96.06 }
  ],
  "Copper Sulfate (pentahydrate)": [
    { ion: "Cu2+", ratio: 1, molarMass: 63.55 },
    { ion: "SO42-", ratio: 1, molarMass: 96.06 }
  ],
  "Iron II Sulfate (Heptahydrate)": [
    { ion: "Fe2+", ratio: 1, molarMass: 55.85 },
    { ion: "SO42-", ratio: 1, molarMass: 96.06 }
  ],
  "Magnesium Sulfate (Heptahydrate)": [
    { ion: "Mg2+", ratio: 1, molarMass: 24.31 },
    { ion: "SO42-", ratio: 1, molarMass: 96.06 }
  ],
  "Potassium Chloride": [
    { ion: "K+", ratio: 1, molarMass: 39.1 },
    { ion: "Cl-", ratio: 1, molarMass: 35.45 }
  ],
  "Potassium Dibasic Phosphate": [
    { ion: "K+", ratio: 2, molarMass: 39.1 },
    { ion: "HPO42-", ratio: 1, molarMass: 96.0 }
  ],
  "Copper EDTA": [
    { ion: "Cu2+", ratio: 0.13, molarMass: 63.55 }
  ],
  "Iron DTPA": [
    { ion: "Fe2+", ratio: 0.11, molarMass: 55.85 }
  ],
  "Iron EDDHA": [
    { ion: "Fe2+", ratio: 0.06, molarMass: 55.85 }
  ],
  "Iron EDTA": [
    { ion: "Fe2+", ratio: 0.13, molarMass: 55.85 }
  ],
  "Mn EDTA": [
    { ion: "Mn2+", ratio: 0.13, molarMass: 54.94 }
  ]
};

// Default substances database
export const defaultSubstanceDatabase = [
  {
    id: "ammonium-chloride",
    name: "Ammonium Chloride",
    formula: "NH4Cl",
    elements: { "N (NH4+)": 26.2, Cl: 66.3 },
  },
  {
    id: "ammonium-dibasic-phosphate",
    name: "Ammonium Dibasic Phosphate",
    formula: "(NH4)2HPO4",
    elements: { "N (NH4+)": 21.2, P: 23.5 },
  },
  {
    id: "ammonium-monobasic-phosphate",
    name: "Ammonium Monobasic Phosphate",
    formula: "NH4H2PO4",
    elements: { "N (NH4+)": 12.2, P: 26.7 },
  },
  {
    id: "ammonium-sulfate",
    name: "Ammonium Sulfate",
    formula: "(NH4)2SO4",
    elements: { "N (NH4+)": 21.2, S: 24.3 },
  },
  {
    id: "boric-acid",
    name: "Boric Acid",
    formula: "H3BO3",
    elements: { B: 17.5 },
  },
  {
    id: "calcium-carbonate",
    name: "Calcium Carbonate",
    formula: "CaCO3",
    elements: { Ca: 40.0 },
  },
  {
    id: "calcium-monobasic-phosphate",
    name: "Calcium Monobasic Phosphate",
    formula: "Ca(H2PO4)2",
    elements: { Ca: 15.9, P: 24.6 },
  },
  {
    id: "calcium-nitrate-ag-grade",
    name: "Calcium Nitrate (ag grade)",
    formula: "Ca(NO3)2",
    elements: { Ca: 19.0, "N (NO3-)": 15.5 },
  },
  {
    id: "calcium-sulfate-dihydrate",
    name: "Calcium Sulfate (Dihydrate)",
    formula: "CaSO4·2H2O",
    elements: { Ca: 23.3, S: 18.6 },
  },
  {
    id: "copper-edta",
    name: "Copper EDTA",
    formula: "Cu-EDTA",
    elements: { Cu: 13.0 },
  },
  {
    id: "copper-nitrate-hexahydrate",
    name: "Copper Nitrate (Hexahydrate)",
    formula: "Cu(NO3)2·6H2O",
    elements: { Cu: 21.7, "N (NO3-)": 14.5 },
  },
  {
    id: "copper-sulfate-pentahydrate",
    name: "Copper Sulfate (pentahydrate)",
    formula: "CuSO4·5H2O",
    elements: { Cu: 25.5, S: 12.8 },
  },
  {
    id: "iron-dtpa",
    name: "Iron DTPA",
    formula: "Fe-DTPA",
    elements: { Fe: 11.0 },
  },
  {
    id: "iron-eddha",
    name: "Iron EDDHA",
    formula: "Fe-EDDHA",
    elements: { Fe: 6.0 },
  },
  {
    id: "iron-edta",
    name: "Iron EDTA",
    formula: "Fe-EDTA",
    elements: { Fe: 13.0 },
  },
  {
    id: "iron-ii-sulfate-heptahydrate",
    name: "Iron II Sulfate (Heptahydrate)",
    formula: "FeSO4·7H2O",
    elements: { Fe: 20.1, S: 11.5 },
  },
  {
    id: "magnesium-carbonate",
    name: "Magnesium Carbonate",
    formula: "MgCO3",
    elements: { Mg: 28.8 },
  },
  {
    id: "magnesium-sulfate-heptahydrate",
    name: "Magnesium Sulfate (Heptahydrate)",
    formula: "MgSO4·7H2O",
    elements: { Mg: 9.9, S: 13.0 },
  },
  {
    id: "mn-edta",
    name: "Mn EDTA",
    formula: "Mn-EDTA",
    elements: { Mn: 13.0 },
  },
  {
    id: "phosphoric-acid",
    name: "Phosphoric Acid (75%)",
    formula: "H3PO4",
    elements: { P: 23.7 },
  },
  {
    id: "potassium-carbonate",
    name: "Potassium Carbonate",
    formula: "K2CO3",
    elements: { K: 56.6 },
  },
  {
    id: "potassium-chloride",
    name: "Potassium Chloride",
    formula: "KCl",
    elements: { K: 52.4, Cl: 47.6 },
  },
  {
    id: "potassium-citrate",
    name: "Potassium Citrate",
    formula: "K3C6H5O7·H2O",
    elements: { K: 36.1 },
  },
  {
    id: "potassium-dibasic-phosphate",
    name: "Potassium Dibasic Phosphate",
    formula: "K2HPO4",
    elements: { K: 44.9, P: 17.8 },
  }
];

// Default target element values
export const defaultElements: Record<string, number> = {
  "N (NO3-)": 210,
  "N (NH4+)": 0,
  P: 31,
  K: 235,
  Mg: 48,
  Ca: 200,
  S: 64,
  Fe: 2.8,
  Mn: 0.5,
  Zn: 0.05,
  B: 0.5,
  Cu: 0.02,
  Si: 0.0,
  Mo: 0.05,
  Na: 0,
  Cl: 0,
};

// Growth phase presets
export const vegetativeElements: Record<string, number> = {
  "N (NO3-)": 199,
  "N (NH4+)": 0,
  P: 62,
  K: 207,
  Mg: 60,
  Ca: 242,
  S: 132,
  Fe: 0,
  Mn: 0,
  Zn: 0,
  B: 0,
  Cu: 0,
  Si: 0.0,
  Mo: 0,
  Na: 0,
  Cl: 0,
};

export const bloomElements: Record<string, number> = {
  "N (NO3-)": 149,
  "N (NH4+)": 0,
  P: 68,
  K: 331,
  Mg: 93,
  Ca: 204,
  S: 224,
  Fe: 0,
  Mn: 0,
  Zn: 0,
  B: 0,
  Cu: 0,
  Si: 0.0,
  Mo: 0,
  Na: 0,
  Cl: 0,
};

export const resetElements: Record<string, number> = {
  "N (NO3-)": 0,
  "N (NH4+)": 0,
  P: 0,
  K: 0,
  Mg: 0,
  Ca: 0,
  S: 0,
  Fe: 0,
  Mn: 0,
  Zn: 0,
  B: 0,
  Cu: 0,
  Si: 0,
  Mo: 0,
  Na: 0,
  Cl: 0,
};

// Helper function to get color for element
export const getElementColor = (element: string, nutrientColors: Record<string, string>): string => {
  const baseElement = element.split(" ")[0];
  return (
    nutrientColors[element] ||
    nutrientColors[baseElement] ||
    "bg-muted text-foreground"
  );
};
