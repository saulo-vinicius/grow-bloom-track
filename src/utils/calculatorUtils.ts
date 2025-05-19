
import { SelectedSubstance, CalculationResult } from "@/types/calculator";
import { 
  elementToIons, 
  elementWeights, 
  ionConductivity, 
  substanceIonMap 
} from "./calculatorConstants";

// Improved EC calculation based on the HydroBuddy model
export const calculateAccurateEC = (
  selectedSubstances: SelectedSubstance[], 
  solutionVolume: number
): string => {
  // Initialize ion concentrations object (in mmol/L)
  const ionConcentrations: Record<string, number> = {};
  
  console.log("Starting EC calculation for a solution volume of", solutionVolume, "L");
  
  // Process each selected substance
  for (const substance of selectedSubstances) {
    if (!substance.weight || substance.weight <= 0) continue;
    
    console.log(`Processing substance: ${substance.name}, weight: ${substance.weight}g`);
    
    // Check if we have a specific ion mapping for this substance
    const ionMapping = substanceIonMap[substance.name];
    
    if (ionMapping) {
      // For substances with known ion compositions
      for (const { ion, ratio, molarMass } of ionMapping) {
        // Calculate mmol/L based on substance weight, ratio, and molar mass
        // Formula: mmol/L = (weight_g * ratio / molarMass_g/mol) / volume_L * 1000
        const mmolPerL = (substance.weight * ratio / molarMass) / solutionVolume * 1000;
        
        // Add to existing concentration or initialize
        ionConcentrations[ion] = (ionConcentrations[ion] || 0) + mmolPerL;
        
        console.log(`  - Ion: ${ion}, ratio: ${ratio}, molarMass: ${molarMass}, contribution: ${mmolPerL.toFixed(4)} mmol/L`);
      }
    } else {
      // For substances without specific ion mappings, use element composition
      console.log(`  - Using elemental composition for ${substance.name}`);
      
      for (const [element, percentage] of Object.entries(substance.elements)) {
        if (!elementToIons[element] || !elementWeights[element]) {
          console.log(`    - Element ${element} not found in mapping or has no weight data, skipping`);
          continue;
        }
        
        // Calculate grams of the element
        const gElement = substance.weight * (percentage as number) / 100;
        
        // Convert to mmol/L
        const mmolPerL = (gElement / elementWeights[element]) / solutionVolume * 1000;
        
        console.log(`    - Element: ${element}, percentage: ${percentage}%, weight: ${gElement.toFixed(4)}g, molecular weight: ${elementWeights[element]}, concentration: ${mmolPerL.toFixed(4)} mmol/L`);
        
        // Map to corresponding ions
        elementToIons[element].forEach(({ ion, factor }) => {
          const ionContribution = mmolPerL * factor;
          ionConcentrations[ion] = (ionConcentrations[ion] || 0) + ionContribution;
          
          console.log(`      - Mapped to ion: ${ion}, factor: ${factor}, contribution: ${ionContribution.toFixed(4)} mmol/L`);
        });
      }
    }
  }
  
  // Log the final ion concentrations
  console.log('Final ion concentrations (mmol/L):', Object.fromEntries(
    Object.entries(ionConcentrations).map(([ion, conc]) => [ion, parseFloat(conc.toFixed(4))])
  ));
  
  // Calculate EC based on ion concentrations and molar conductivity
  // EC (mS/cm) = Σ (λᵢ × [ionᵢ])
  let totalEC = 0;
  
  for (const [ion, mmolPerL] of Object.entries(ionConcentrations)) {
    if (ionConductivity[ion]) {
      // Convert mmol/L to mol/L and multiply by the ion's conductivity value
      // λᵢ (S·cm²/mol) × concentration (mol/L) = mS/cm contribution
      const contribution = ionConductivity[ion] * mmolPerL / 1000;
      totalEC += contribution;
      
      console.log(`Ion: ${ion}, Concentration: ${mmolPerL.toFixed(4)} mmol/L, Conductivity: ${ionConductivity[ion]} S·cm²/mol, Contribution: ${contribution.toFixed(6)} mS/cm`);
    } else {
      console.log(`Warning: No conductivity value found for ion ${ion}`);
    }
  }
  
  console.log(`Total calculated EC: ${totalEC.toFixed(3)} mS/cm`);
  
  return totalEC.toFixed(3);
};

export const calculateNutrients = (
  selectedSubstances: SelectedSubstance[],
  elements: Record<string, number>,
  solutionVolume: number,
  volumeUnit: string
): CalculationResult => {
  const totalElements: Record<string, number> = {};
  const contributionBySubstance: Record<string, Record<string, number>> = {};
  
  Object.keys(elements).forEach(element => {
    totalElements[element] = 0;
  });
  
  selectedSubstances.forEach(substance => {
    contributionBySubstance[substance.id] = {};
    
    if (substance.weight <= 0) return;
    
    Object.entries(substance.elements).forEach(([element, percentage]) => {
      const contribution = (substance.weight * (percentage as number) / 100) / solutionVolume * 1000;
      
      contributionBySubstance[substance.id][element] = contribution;
      
      if (totalElements[element] !== undefined) {
        totalElements[element] += contribution;
      } else {
        totalElements[element] = contribution;
      }
    });
  });
  
  const elementResults = Object.entries(elements).map(([element, target]) => {
    const actual = totalElements[element] || 0;
    return {
      element,
      target,
      actual,
      difference: actual - target
    };
  });
  
  const substanceResults = selectedSubstances.map(substance => {
    const volumePerLiter = substance.weight / solutionVolume;
    return {
      name: substance.name,
      weight: substance.weight,
      volumePerLiter
    };
  });
  
  const ecValue = calculateAccurateEC(selectedSubstances, solutionVolume);
  
  return {
    substances: substanceResults,
    elements: elementResults,
    ecValue,
    solutionVolume,
    volumeUnit,
    nutrientA: undefined,
    nutrientB: undefined,
    nutrientC: undefined,
    ph: undefined,
    wateringFrequency: undefined,
    lightHours: undefined,
    expectedYield: undefined,
    growthTime: undefined,
    name: undefined,
    description: undefined
  };
};
