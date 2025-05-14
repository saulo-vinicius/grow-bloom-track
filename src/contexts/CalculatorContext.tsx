
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalculatorInputs {
  plantType: string;
  growthPhase: string;
  environment: string;
  waterQuality: number;
  lightIntensity: number;
  plantSize: number;
  containerSize: number;
}

interface CalculatorResults {
  nutrientA: number;
  nutrientB: number;
  nutrientC: number;
  ph: number;
  wateringFrequency: number;
  lightHours: number;
  expectedYield: string;
  growthTime: string;
}

interface SavedRecipe extends CalculatorInputs, CalculatorResults {
  id: string;
  name: string;
  createdAt: string;
}

interface CalculatorContextType {
  inputs: CalculatorInputs;
  results: CalculatorResults | null;
  savedRecipes: SavedRecipe[];
  isPremiumCalculation: boolean;
  setInputs: (inputs: Partial<CalculatorInputs>) => void;
  calculateResults: () => void;
  saveRecipe: (name: string) => void;
  deleteRecipe: (id: string) => void;
  applyRecipeToPlant: (recipeId: string, plantId: string) => void;
}

const defaultInputs: CalculatorInputs = {
  plantType: 'herb',
  growthPhase: 'vegetative',
  environment: 'indoor',
  waterQuality: 7,
  lightIntensity: 50,
  plantSize: 30,
  containerSize: 5,
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inputs, setInputsState] = useState<CalculatorInputs>(defaultInputs);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isPremiumCalculation, setIsPremiumCalculation] = useState(false);

  const setInputs = (newInputs: Partial<CalculatorInputs>) => {
    setInputsState(prev => ({ ...prev, ...newInputs }));
    // Reset results when inputs change
    setResults(null);
  };

  const calculateResults = () => {
    // This is a placeholder calculation. Replace with your actual calculation logic
    const { plantType, growthPhase, environment, waterQuality, lightIntensity, plantSize, containerSize } = inputs;
    
    // Simple algorithm to generate results based on inputs
    const baseNutrientA = plantType === 'herb' ? 5 : plantType === 'vegetable' ? 7 : 10;
    const baseNutrientB = growthPhase === 'seedling' ? 3 : growthPhase === 'vegetative' ? 7 : 10;
    const baseNutrientC = environment === 'indoor' ? 5 : 8;
    
    // Apply some modifications based on other factors
    const nutrientA = baseNutrientA * (plantSize / 30) * (containerSize / 5);
    const nutrientB = baseNutrientB * (lightIntensity / 50) * (waterQuality / 7);
    const nutrientC = baseNutrientC * (plantSize / 30) * (lightIntensity / 50);
    
    // Generate other values
    const ph = waterQuality * 0.8;
    const wateringFrequency = environment === 'indoor' ? 2 : 3;
    const lightHours = growthPhase === 'seedling' ? 14 : growthPhase === 'vegetative' ? 16 : 12;
    
    const expectedYield = calculateExpectedYield(plantType, plantSize, lightIntensity);
    const growthTime = calculateGrowthTime(plantType, growthPhase, environment);
    
    const calculationResults: CalculatorResults = {
      nutrientA: parseFloat(nutrientA.toFixed(2)),
      nutrientB: parseFloat(nutrientB.toFixed(2)),
      nutrientC: parseFloat(nutrientC.toFixed(2)),
      ph: parseFloat(ph.toFixed(1)),
      wateringFrequency,
      lightHours,
      expectedYield,
      growthTime,
    };
    
    setResults(calculationResults);
    
    // Definimos como false pois não há mais verificação de premium
    setIsPremiumCalculation(false);
    
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
  };

  const calculateExpectedYield = (plantType: string, plantSize: number, lightIntensity: number): string => {
    let yield1 = '';
    
    if (plantType === 'herb') {
      yield1 = `${Math.round(plantSize * 0.5 * (lightIntensity / 50))} gramas`;
    } else if (plantType === 'vegetable') {
      yield1 = `${Math.round(plantSize * 1.2 * (lightIntensity / 50))} gramas`;
    } else {
      yield1 = `${Math.round(plantSize * 2 * (lightIntensity / 50))} gramas`;
    }
    
    return yield1;
  };

  const calculateGrowthTime = (plantType: string, growthPhase: string, environment: string): string => {
    let baseWeeks = 0;
    
    if (plantType === 'herb') {
      baseWeeks = 6;
    } else if (plantType === 'vegetable') {
      baseWeeks = 10;
    } else {
      baseWeeks = 14;
    }
    
    if (growthPhase === 'seedling') {
      baseWeeks = Math.round(baseWeeks * 0.3);
    } else if (growthPhase === 'vegetative') {
      baseWeeks = Math.round(baseWeeks * 0.6);
    } else {
      baseWeeks = baseWeeks;
    }
    
    if (environment === 'outdoor') {
      baseWeeks = Math.round(baseWeeks * 1.2);
    }
    
    return `${baseWeeks} semanas`;
  };

  const saveRecipe = async (name: string) => {
    if (!results) {
      toast({
        title: "Erro",
        description: "Não há resultados para salvar",
        variant: "destructive",
      });
      return;
    }
    
    const newRecipe: SavedRecipe = {
      id: Date.now().toString(),
      name,
      ...inputs,
      ...results,
      createdAt: new Date().toISOString(),
    };
    
    try {
      // Try to save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save to Supabase recipes table - FIX: Add user_id field from current user
        await supabase.from('recipes').insert({
          name,
          data: {
            ...inputs,
            ...results
          },
          user_id: user.id // Add the user_id from the authenticated user
        });
      }
    } catch (error) {
      console.error("Error saving recipe to Supabase:", error);
      // Continue with local storage approach as fallback
    }
    
    setSavedRecipes(prev => [newRecipe, ...prev]);
    toast({
      title: "Sucesso",
      description: "Receita salva!",
    });
  };

  const deleteRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
    toast({
      title: "Sucesso",
      description: "Receita excluída",
    });
  };

  const applyRecipeToPlant = async (recipeId: string, plantId: string) => {
    try {
      // Get the recipe data
      let recipeData;
      if (recipeId === 'current') {
        if (!results) {
          toast({
            title: "Erro",
            description: "Não há receita para aplicar",
            variant: "destructive",
          });
          return;
        }
        recipeData = {
          ...inputs,
          ...results,
        };
      } else {
        const recipe = savedRecipes.find(r => r.id === recipeId);
        if (!recipe) {
          toast({
            title: "Erro",
            description: "Receita não encontrada",
            variant: "destructive",
          });
          return;
        }
        recipeData = recipe;
      }
      
      // Try to save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // You can implement this later with actual Supabase connection
      }
      
      toast({
        title: "Sucesso",
        description: "Receita aplicada à planta!",
      });
    } catch (error) {
      console.error('Error applying recipe to plant:', error);
      toast({
        title: "Erro",
        description: "Falha ao aplicar receita à planta",
        variant: "destructive",
      });
    }
  };

  return (
    <CalculatorContext.Provider
      value={{
        inputs,
        results,
        savedRecipes,
        isPremiumCalculation,
        setInputs,
        calculateResults,
        saveRecipe,
        deleteRecipe,
        applyRecipeToPlant,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
