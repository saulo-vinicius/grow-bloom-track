
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
  
  console.log("HydroBuddy EC Calculation - Solution Volume:", solutionVolume, "L");
  
  // Process each selected substance
  for (const substance of selectedSubstances) {
    if (!substance.weight || substance.weight <= 0) continue;
    
    console.log(`\n-------- Processing substance: ${substance.name}, weight: ${substance.weight}g --------`);
    
    // Check if we have a specific ion mapping for this substance
    const ionMapping = substanceIonMap[substance.name];
    
    if (ionMapping) {
      // For substances with known ion compositions
      console.log(`Found specific ion mapping for ${substance.name}`);
      
      for (const { ion, ratio, molarMass } of ionMapping) {
        // Calculate mmol/L based on substance weight, ratio, and molar mass
        // Formula: mmol/L = (weight_g * ratio / molarMass_g/mol) / volume_L * 1000
        const mmolPerL = (substance.weight * ratio / molarMass) / solutionVolume * 1000;
        
        // Add to existing concentration or initialize
        ionConcentrations[ion] = (ionConcentrations[ion] || 0) + mmolPerL;
        
        console.log(`  - Ion: ${ion}, ratio: ${ratio}, molar mass: ${molarMass} g/mol`);
        console.log(`  - Calculation: (${substance.weight} g * ${ratio} / ${molarMass} g/mol) / ${solutionVolume} L * 1000`);
        console.log(`  - Contribution: ${mmolPerL.toFixed(4)} mmol/L`);
      }
    } else {
      // For substances without specific ion mappings, use element composition
      console.log(`Using elemental composition for ${substance.name}`);
      
      for (const [element, percentage] of Object.entries(substance.elements)) {
        if (!elementToIons[element] || !elementWeights[element]) {
          console.log(`  - Element ${element} not found in mapping or has no weight data, skipping`);
          continue;
        }
        
        // Calculate grams of the element from the percentage
        const gElement = substance.weight * (percentage as number) / 100;
        
        // Convert to mmol/L using the element's molecular weight
        const mmolPerL = (gElement / elementWeights[element]) / solutionVolume * 1000;
        
        console.log(`  - Element: ${element}, percentage: ${percentage}%, element weight: ${gElement.toFixed(4)}g`);
        console.log(`  - Molecular weight: ${elementWeights[element]} g/mol`);
        console.log(`  - Calculation: (${gElement.toFixed(4)} g / ${elementWeights[element]} g/mol) / ${solutionVolume} L * 1000`);
        console.log(`  - Concentration: ${mmolPerL.toFixed(4)} mmol/L`);
        
        // Map to corresponding ions
        elementToIons[element].forEach(({ ion, factor }) => {
          const ionContribution = mmolPerL * factor;
          ionConcentrations[ion] = (ionConcentrations[ion] || 0) + ionContribution;
          
          console.log(`    - Mapped to ion: ${ion}, factor: ${factor}`);
          console.log(`    - Ion contribution: ${ionContribution.toFixed(4)} mmol/L`);
        });
      }
    }
  }
  
  // Log the final ion concentrations
  console.log('\n-------- Final Ion Concentrations (mmol/L) --------');
  Object.entries(ionConcentrations).forEach(([ion, conc]) => {
    console.log(`${ion}: ${conc.toFixed(4)} mmol/L`);
  });
  
  // Calculate EC based on ion concentrations and molar conductivity
  // EC (mS/cm) = Σ (λᵢ × [ionᵢ])
  let totalEC = 0;
  
  console.log('\n-------- EC Calculation by Ion --------');
  for (const [ion, mmolPerL] of Object.entries(ionConcentrations)) {
    if (ionConductivity[ion]) {
      // Convert mmol/L to mol/L and multiply by the ion's conductivity value
      const molPerL = mmolPerL / 1000; // convert mmol/L to mol/L
      const contribution = ionConductivity[ion] * molPerL;
      totalEC += contribution;
      
      console.log(`${ion}:`);
      console.log(`  - Concentration: ${mmolPerL.toFixed(4)} mmol/L = ${molPerL.toFixed(7)} mol/L`);
      console.log(`  - Conductivity: ${ionConductivity[ion]} S·cm²/mol`);
      console.log(`  - Calculation: ${ionConductivity[ion]} S·cm²/mol × ${molPerL.toFixed(7)} mol/L`);
      console.log(`  - Contribution to EC: ${contribution.toFixed(6)} mS/cm`);
    } else {
      console.log(`Warning: No conductivity value found for ion ${ion}`);
    }
  }
  
  console.log(`\n-------- Total calculated EC: ${totalEC.toFixed(3)} mS/cm --------`);
  
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
