import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast, toastUtils } from '@/components/ui/use-toast';
import { 
  Substance, 
  CalcInputs, 
  CalcResults, 
  SavedRecipe, 
  SubstanceInput, 
  SubstanceResult,
  NPKValues,
  DEFAULT_SUBSTANCES 
} from '../models/Calculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface AdvancedCalculatorContextType {
  inputs: CalcInputs;
  results: CalcResults | null;
  savedRecipes: SavedRecipe[];
  substances: Substance[];
  customSubstances: Substance[];
  isPremiumCalculation: boolean;
  loading: boolean;
  setInputs: (inputs: Partial<CalcInputs>) => void;
  calculateResults: () => void;
  saveRecipe: (name: string) => void;
  deleteRecipe: (id: string) => void;
  applyRecipeToPlant: (recipeId: string, plantId: string) => void;
  addSubstance: (substance: SubstanceInput) => void;
  removeSubstance: (substanceId: string) => void;
  updateSubstance: (index: number, updates: Partial<SubstanceInput>) => void;
  addCustomSubstance: (substance: Substance) => void;
}

const defaultInputs: CalcInputs = {
  solutionVolume: 10,
  plantType: 'herb',
  growthPhase: 'vegetative',
  environment: 'indoor',
  waterQuality: 7,
  substances: [
    {
      substanceId: 'nutrient-a',
      substanceName: 'Nutrient A',
      targetPPM: 500,
    }
  ]
};

const AdvancedCalculatorContext = createContext<AdvancedCalculatorContextType | undefined>(undefined);

export const AdvancedCalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [inputs, setInputsState] = useState<CalcInputs>(defaultInputs);
  const [results, setResults] = useState<CalcResults | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [substances, setSubstances] = useState<Substance[]>(DEFAULT_SUBSTANCES);
  const [customSubstances, setCustomSubstances] = useState<Substance[]>([]);
  const [isPremiumCalculation, setIsPremiumCalculation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch custom substances and recipes when user changes
  React.useEffect(() => {
    if (user) {
      fetchCustomSubstances();
      fetchSavedRecipes();
    }
  }, [user]);

  const fetchCustomSubstances = async () => {
    if (!user) return;

    try {
      // Como a tabela 'substances' não existe ainda no Supabase, vamos apenas usar dados locais
      console.log('Custom substances would be fetched here if table existed');
      setCustomSubstances([]); // Por enquanto, define como vazio
    } catch (error) {
      console.error('Error fetching custom substances:', error);
      toastUtils({
        title: "Error",
        description: "Failed to load custom substances",
        variant: "destructive"
      });
    }
  };

  const fetchSavedRecipes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data) {
        const recipes = data.map(item => {
          // Parse the data field if it's a string
          let recipeData;
          if (typeof item.data === 'string') {
            recipeData = JSON.parse(item.data);
          } else if (item.data && typeof item.data === 'object') {
            recipeData = item.data;
          } else {
            recipeData = { inputs: defaultInputs, results: null };
          }
            
          return {
            id: item.id,
            name: item.name,
            createdAt: item.created_at,
            inputs: recipeData.inputs as CalcInputs,
            results: recipeData.results as CalcResults
          };
        });
        setSavedRecipes(recipes);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      toastUtils({
        title: "Error",
        description: "Failed to load saved recipes",
        variant: "destructive"
      });
    }
  };

  const setInputs = (newInputs: Partial<CalcInputs>) => {
    setInputsState(prev => ({ ...prev, ...newInputs }));
    // Reset results when inputs change
    setResults(null);
  };

  const addSubstance = (substance: SubstanceInput) => {
    setInputsState(prev => ({
      ...prev,
      substances: [...prev.substances, substance]
    }));
    setResults(null);
  };

  const removeSubstance = (substanceId: string) => {
    setInputsState(prev => ({
      ...prev,
      substances: prev.substances.filter(s => s.substanceId !== substanceId)
    }));
    setResults(null);
  };

  const updateSubstance = (index: number, updates: Partial<SubstanceInput>) => {
    setInputsState(prev => {
      const newSubstances = [...prev.substances];
      newSubstances[index] = { ...newSubstances[index], ...updates };
      return { ...prev, substances: newSubstances };
    });
    setResults(null);
  };

  const addCustomSubstance = async (substance: Substance) => {
    if (!user) {
      toastUtils.error('You need to be logged in to add custom substances');
      return;
    }

    try {
      // Como a tabela 'substances' não existe ainda, nós apenas adicionamos localmente
      const newSubstance = {
        ...substance,
        id: `custom-${Date.now()}`,
        isCustom: true,
        userId: user.id
      };

      // Em um cenário real, guardaríamos no Supabase
      // const { error } = await supabase
      //   .from('substances')
      //   .insert([newSubstance]);
      // 
      // if (error) throw error;

      setCustomSubstances(prev => [...prev, newSubstance]);
      toastUtils.success('Custom substance added successfully');
    } catch (error) {
      console.error('Error adding custom substance:', error);
      toastUtils.error('Failed to add custom substance');
    }
  };

  const calculateResults = () => {
    setLoading(true);
    
    try {
      // Get all available substances (default + custom)
      const allSubstances = [...substances, ...customSubstances];
      
      // Find each substance data from our inputs
      const substanceResults: SubstanceResult[] = inputs.substances.map(substanceInput => {
        const substanceData = allSubstances.find(s => s.id === substanceInput.substanceId);
        
        if (!substanceData) {
          throw new Error(`Substance ${substanceInput.substanceName} not found`);
        }
        
        // Calculate the amount needed based on target PPM and solution volume
        // PPM = (amount in ml * density * 1000) / solution volume in liters
        // Therefore, amount = (PPM * solution volume) / (density * 1000)
        const density = substanceData.density || 1; // Default to 1 g/ml if not specified
        const amount = (substanceInput.targetPPM * inputs.solutionVolume) / (density * 1000);
        
        return {
          id: substanceInput.substanceId,
          name: substanceInput.substanceName,
          amount: parseFloat(amount.toFixed(2)),
          ppm: substanceInput.targetPPM
        };
      });
      
      // Calculate total NPK values
      const totalNPK = calculateTotalNPK(substanceResults, allSubstances);
      
      // Generate other values based on inputs
      const { plantType, growthPhase, environment, waterQuality } = inputs;
      
      // Determine pH based on water quality and plant type
      const ph = determineTargetPh(plantType, waterQuality);
      
      // Estimate EC based on total PPM
      const totalPPM = substanceResults.reduce((sum, s) => sum + s.ppm, 0);
      const ec = totalPPM / 500; // Rough estimation: EC ≈ PPM/500
      
      // Determine watering frequency based on plant type and environment
      const wateringFrequency = determineWateringFrequency(plantType, environment);
      
      // Determine light hours based on growth phase
      const lightHours = determineLightHours(growthPhase);
      
      // Calculate expected yield
      const expectedYield = calculateExpectedYield(plantType, totalNPK, environment);
      
      // Calculate growth time
      const growthTime = calculateGrowthTime(plantType, growthPhase, environment);
      
      const calculationResults: CalcResults = {
        substances: substanceResults,
        totalNPK,
        ph: parseFloat(ph.toFixed(1)),
        ec: parseFloat(ec.toFixed(2)),
        wateringFrequency,
        lightHours,
        expectedYield,
        growthTime,
      };
      
      setResults(calculationResults);
      
      // Determine if this is a premium calculation
      const isPremium = 
        plantType !== 'herb' || 
        growthPhase === 'flowering' || 
        inputs.substances.length > 2;
        
      setIsPremiumCalculation(isPremium);
      
      toastUtils.success('Calculation complete!');
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Error",
        description: "Error during calculation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNPK = (
    substanceResults: SubstanceResult[], 
    allSubstances: Substance[]
  ): NPKValues => {
    // Initialize totals
    let totalN = 0;
    let totalP = 0;
    let totalK = 0;
    
    // For each substance in the result
    substanceResults.forEach(result => {
      // Find the substance data
      const substanceData = allSubstances.find(s => s.id === result.id);
      
      if (substanceData) {
        // Calculate the actual nutrient amounts based on the amount used
        const density = substanceData.density || 1;
        const substanceWeightInGrams = result.amount * density;
        
        // Add to totals (convert percentage to actual amount)
        if (substanceData.n) totalN += (substanceData.n / 100) * substanceWeightInGrams;
        if (substanceData.p) totalP += (substanceData.p / 100) * substanceWeightInGrams;
        if (substanceData.k) totalK += (substanceData.k / 100) * substanceWeightInGrams;
      }
    });
    
    return {
      n: parseFloat(totalN.toFixed(2)),
      p: parseFloat(totalP.toFixed(2)),
      k: parseFloat(totalK.toFixed(2))
    };
  };

  const determineTargetPh = (plantType: string, waterQuality: number): number => {
    // Different plant types prefer different pH ranges
    switch (plantType) {
      case 'herb':
        return 6.3;
      case 'vegetable':
        return 6.0;
      case 'fruit':
        return 5.8;
      default:
        return 6.0;
    }
  };

  const determineWateringFrequency = (plantType: string, environment: string): number => {
    // Base frequency
    let frequency = 2; // times per week
    
    // Adjust based on plant type
    if (plantType === 'herb') frequency += 1;
    if (plantType === 'fruit') frequency -= 1;
    
    // Adjust based on environment
    if (environment === 'outdoor') frequency += 1;
    
    return Math.max(1, frequency); // At least once per week
  };

  const determineLightHours = (growthPhase: string): number => {
    switch (growthPhase) {
      case 'seedling':
        return 16;
      case 'vegetative':
        return 18;
      case 'flowering':
        return 12;
      default:
        return 16;
    }
  };

  const calculateExpectedYield = (
    plantType: string, 
    npk: NPKValues,
    environment: string
  ): string => {
    let baseYield = 0;
    
    // Base yield by plant type (in grams)
    if (plantType === 'herb') baseYield = 30;
    else if (plantType === 'vegetable') baseYield = 150;
    else if (plantType === 'fruit') baseYield = 200;
    
    // Adjust by NPK values - more nutrients generally means better yield
    // but with diminishing returns
    const nutrientFactor = Math.min(2, 1 + (npk.n + npk.p + npk.k) / 20);
    
    // Environment factor
    const environmentFactor = environment === 'indoor' ? 1 : 1.2;
    
    const finalYield = baseYield * nutrientFactor * environmentFactor;
    
    return `${Math.round(finalYield)} grams`;
  };

  const calculateGrowthTime = (
    plantType: string, 
    growthPhase: string, 
    environment: string
  ): string => {
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
    
    return `${baseWeeks} weeks`;
  };

  const saveRecipe = async (name: string) => {
    if (!results) {
      toast({
        title: "Error",
        description: "No results to save",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save recipes",
        variant: "destructive"
      });
      return;
    }

    if (!user.isPremium && isPremiumCalculation) {
      toast({
        title: "Error",
        description: "Premium subscription required to save this recipe",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert the data to a string to avoid JSON type issues
      const recipeData = JSON.stringify({
        inputs,
        results
      });

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          name,
          data: recipeData, 
          user_id: user.id
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Parse the data back to an object for local state
        const parsedData = JSON.parse(data[0].data as string);
        
        const newRecipe: SavedRecipe = {
          id: data[0].id,
          name,
          createdAt: data[0].created_at,
          inputs: parsedData.inputs,
          results: parsedData.results
        };
        
        setSavedRecipes(prev => [newRecipe, ...prev]);
        toastUtils.success('Recipe saved!');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
      toastUtils.success('Recipe deleted');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive"
      });
    }
  };

  const applyRecipeToPlant = async (recipeId: string, plantId: string) => {
    if (!user?.isPremium && isPremiumCalculation) {
      toast({
        title: "Error",
        description: "Premium subscription required to apply this recipe",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real app, you would implement logic to apply the recipe to a plant
      // For now, we'll just show a success toast
      toastUtils.success('Recipe applied to plant!');
    } catch (error) {
      console.error('Error applying recipe to plant:', error);
      toast({
        title: "Error",
        description: "Failed to apply recipe to plant",
        variant: "destructive"
      });
    }
  };

  return (
    <AdvancedCalculatorContext.Provider
      value={{
        inputs,
        results,
        savedRecipes,
        substances,
        customSubstances,
        isPremiumCalculation,
        loading,
        setInputs,
        calculateResults,
        saveRecipe,
        deleteRecipe,
        applyRecipeToPlant,
        addSubstance,
        removeSubstance,
        updateSubstance,
        addCustomSubstance,
      }}
    >
      {children}
    </AdvancedCalculatorContext.Provider>
  );
};

export const useAdvancedCalculator = () => {
  const context = useContext(AdvancedCalculatorContext);
  if (context === undefined) {
    throw new Error('useAdvancedCalculator must be used within a AdvancedCalculatorProvider');
  }
  return context;
};
