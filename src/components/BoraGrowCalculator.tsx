import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, X, Calculator } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  fetchPremiumSubstances,
  mockPremiumSubstances,
  PremiumSubstance,
} from "@/lib/premium-substances";
import { useCalculator } from "@/contexts/CalculatorContext";
import { 
  saveNutrientRecipe, 
  getUserRecipes, 
  deleteNutrientRecipe, 
  NutrientRecipe,
  saveCustomSubstance,
  getUserCustomSubstances,
  deleteCustomSubstance
} from "@/lib/recipes";
import { v4 as uuidv4 } from 'uuid';

// Import our refactored components
import SubstancesPanel from "./calculator/SubstancesPanel";
import SelectedSubstancesPanel from "./calculator/SelectedSubstancesPanel";
import TargetElementsPanel from "./calculator/TargetElementsPanel";
import CalculationResults from "./calculator/CalculationResults";
import CustomSubstanceDialog from "./calculator/CustomSubstanceDialog";
import SaveRecipeDialog from "./calculator/SaveRecipeDialog";
import SavedRecipesDialog from "./calculator/SavedRecipesDialog";
import SelectPlantDialog from "./calculator/SelectPlantDialog";
import { 
  Substance, 
  SelectedSubstance, 
  CalculationResult, 
  SimpleUser, 
  CustomSubstance, 
  asSubstance 
} from "@/types/calculator";

// Define a simplified User type that matches what our AuthContext provides
const BoraGrowCalculator = () => {
  const { user } = useAuth();
  const [calculationType, setCalculationType] = useState<string>("desired");
  const [solutionVolume, setSolutionVolume] = useState<number>(1);
  const [volumeUnit, setVolumeUnit] = useState<string>("liters");
  const [massUnit, setMassUnit] = useState<string>("g");
  const [selectedSubstances, setSelectedSubstances] = useState<SelectedSubstance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("targets");

  // Dialogs state
  const [customSubstanceDialogOpen, setCustomSubstanceDialogOpen] = useState<boolean>(false);
  const [editingSubstance, setEditingSubstance] = useState<Substance | null>(null);
  const [saveRecipeDialogOpen, setSaveRecipeDialogOpen] = useState<boolean>(false);
  const [recipeName, setRecipeName] = useState<string>("");
  const [recipeDescription, setRecipeDescription] = useState<string>("");
  const [savedRecipes, setSavedRecipes] = useState<NutrientRecipe[]>([]);
  const [savedRecipesDialogOpen, setSavedRecipesDialogOpen] = useState<boolean>(false);
  const [selectPlantDialogOpen, setSelectPlantDialogOpen] = useState<boolean>(false);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);

  // Custom substance form state
  const [customSubstanceName, setCustomSubstanceName] = useState<string>("");
  const [customSubstanceFormula, setCustomSubstanceFormula] = useState<string>("");
  const [customSubstanceElements, setCustomSubstanceElements] = useState<Record<string, number>>({});

  // Calculator context
  const calculatorContext = useCalculator();
  
  // Define nutrient color coding
  const nutrientColors: Record<string, string> = {
    // Primary Macronutrients
    "N (NO3-)": "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    "N (NH4+)": "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    P: "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    "P₂O₅": "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    K: "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    "K₂O": "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300",
    // Secondary Macronutrients
    Mg: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400",
    Ca: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400",
    S: "bg-gray-200 dark:bg-gray-700/30 text-gray-700 dark:text-gray-400",
    // Micronutrients - all using gray tones
    Fe: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Mn: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Zn: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    B: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Cu: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Mo: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Si: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    "SiO₂": "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Na: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
    Cl: "bg-gray-300 dark:bg-gray-600/30 text-gray-600 dark:text-gray-400",
  };

  // Get color for element
  const getElementColor = (element: string): string => {
    // Extract base element from compound notation (e.g., "N (NO3-)" -> "N")
    const baseElement = element.split(" ")[0];
    return (
      nutrientColors[element] ||
      nutrientColors[baseElement] ||
      "bg-muted text-foreground"
    );
  };

  // Define elements with their targets
  const [elements, setElements] = useState<Record<string, number>>({
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
  });

  // State for user's custom substances
  const [userCustomSubstances, setUserCustomSubstances] = useState<Substance[]>([]);

  // State for premium substances
  const [premiumSubstances, setPremiumSubstances] = useState<PremiumSubstance[]>([]);
  const [isPremiumLoading, setIsPremiumLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<(Substance | PremiumSubstance)[]>([]);

  // Expanded database of substances from HydroBuddy (matching the repository reference)
  const defaultSubstanceDatabase: Substance[] = [
    {
      id: "ammonium-nitrate",
      name: "Nitrato de Amônio",
      formula: "NH4NO3",
      elements: { "N (NH4+)": 17.5, "N (NO3-)": 17.5 },
    },
    {
      id: "calcium-nitrate",
      name: "Nitrato de Cálcio",
      formula: "Ca(NO3)2",
      elements: { Ca: 19.0, "N (NO3-)": 15.5 },
    },
    {
      id: "potassium-nitrate",
      name: "Nitrato de Potássio",
      formula: "KNO3",
      elements: { K: 38.7, "N (NO3-)": 13.9 },
    },
    {
      id: "magnesium-nitrate",
      name: "Nitrato de Magnésio",
      formula: "Mg(NO3)2·6H2O",
      elements: { Mg: 9.5, "N (NO3-)": 10.9 },
    },
    {
      id: "mono-potassium-phosphate",
      name: "Fosfato Monopotássico",
      formula: "KH2PO4",
      elements: { K: 28.7, P: 22.8 },
    },
    {
      id: "di-potassium-phosphate",
      name: "Fosfato Dipotássico",
      formula: "K2HPO4",
      elements: { K: 44.9, P: 17.8 },
    },
    {
      id: "potassium-sulfate",
      name: "Sulfato de Potássio",
      formula: "K2SO4",
      elements: { K: 45.0, S: 18.4 },
    },
    {
      id: "magnesium-sulfate",
      name: "Sulfato de Magnésio (Sal Epsom)",
      formula: "MgSO4·7H2O",
      elements: { Mg: 9.8, S: 13.0 },
    },
    {
      id: "calcium-sulfate",
      name: "Sulfato de Cálcio (Gesso)",
      formula: "CaSO4·2H2O",
      elements: { Ca: 23.3, S: 18.6 },
    },
    {
      id: "calcium-chloride",
      name: "Cloreto de Cálcio",
      formula: "CaCl2",
      elements: { Ca: 36.1, Cl: 63.9 },
    },
    {
      id: "potassium-chloride",
      name: "Cloreto de Potássio",
      formula: "KCl",
      elements: { K: 52.4, Cl: 47.6 },
    },
    {
      id: "calcium-carbonate",
      name: "Carbonato de Cálcio",
      formula: "CaCO3",
      elements: { Ca: 40.0 },
    },
    {
      id: "iron-edta",
      name: "Ferro EDTA (13%)",
      formula: "Fe-EDTA",
      elements: { Fe: 13.0 },
    },
    {
      id: "iron-dtpa",
      name: "Ferro DTPA (10%)",
      formula: "Fe-DTPA",
      elements: { Fe: 10.0 },
    },
    {
      id: "iron-eddha",
      name: "Ferro EDDHA (6%)",
      formula: "Fe-EDDHA",
      elements: { Fe: 6.0 },
    },
    {
      id: "manganese-sulfate",
      name: "Sulfato de Manganês",
      formula: "MnSO4·H2O",
      elements: { Mn: 32.5, S: 19.0 },
    },
    {
      id: "zinc-sulfate",
      name: "Sulfato de Zinco",
      formula: "ZnSO4·7H2O",
      elements: { Zn: 22.7, S: 11.0 },
    },
    {
      id: "copper-sulfate",
      name: "Sulfato de Cobre",
      formula: "CuSO4·5H2O",
      elements: { Cu: 25.5, S: 12.8 },
    },
    {
      id: "boric-acid",
      name: "Ácido Bórico",
      formula: "H3BO3",
      elements: { B: 17.5 },
    },
    {
      id: "sodium-molybdate",
      name: "Molibdato de Sódio",
      formula: "Na2MoO4·2H2O",
      elements: { Mo: 39.7, Na: 19.5 },
    }
  ];

  // Filter substances based on search term
  useEffect(() => {
    // Create a stable reference to the database
    const currentDatabase = [
      ...userCustomSubstances.map(asSubstance),
      ...defaultSubstanceDatabase,
    ];

    // Include premium substances in the results
    const searchDatabase = [...currentDatabase, ...premiumSubstances];

    // If search term is empty, show all substances
    if (searchTerm.trim() === "") {
      setSearchResults(searchDatabase);
      return;
    }

    // Filter by substance name
    const filtered = searchDatabase.filter((substance) =>
      substance.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setSearchResults(filtered);
  }, [searchTerm, userCustomSubstances, premiumSubstances]);

  // Auto-recalculate when inputs change
  useEffect(() => {
    if (selectedSubstances.length > 0) {
      // Check if any substance has weight > 0 before calculating
      const hasSubstancesWithWeight = selectedSubstances.some(s => s.weight > 0);
      if (hasSubstancesWithWeight) {
        calculateNutrients();
      }
    }
  }, [selectedSubstances, elements, solutionVolume]);

  // Effect to switch tabs when calculation type changes
  useEffect(() => {
    if (calculationType === "weights") {
      setActiveTab("substances");
    } else if (calculationType === "desired") {
      setActiveTab("targets");
    }
  }, [calculationType]);

  // Load saved recipes and custom substances on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Load saved recipes
        setLoadingRecipes(true);
        const recipes = await getUserRecipes().catch(error => {
          console.error("Error loading recipes:", error);
          return [];
        });
        setSavedRecipes(recipes);
        
        // Load custom substances
        const substances = await getUserCustomSubstances().catch(error => {
          console.error("Error loading custom substances:", error);
          return [];
        });
        
        // Ensure all custom substances have valid ids and can be used as Substance type
        const validSubstances = substances.map(substance => ({
          ...substance,
          id: substance.id || uuidv4() // Ensure every substance has an id
        }));
        
        setUserCustomSubstances(validSubstances);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados salvos",
          variant: "destructive",
        });
      } finally {
        setLoadingRecipes(false);
      }
    };

    loadUserData();
  }, [user]);

  // Set default active tab to targets and load premium substances
  useEffect(() => {
    setActiveTab("targets");
    
    // Load premium substances
    const loadPremiumSubstances = async () => {
      try {
        setIsPremiumLoading(true);
        const substances = await fetchPremiumSubstances();
        setPremiumSubstances(substances.length > 0 ? substances : mockPremiumSubstances);
      } catch (error) {
        console.error("Error loading premium substances:", error);
        setPremiumSubstances(mockPremiumSubstances);
      } finally {
        setIsPremiumLoading(false);
      }
    };
    
    loadPremiumSubstances();
  }, []);

  const handleAddSubstance = (substance: Substance): void => {
    // Check if substance already exists
    if (selectedSubstances.some((s) => s.id === substance.id)) {
      return;
    }

    setSelectedSubstances([...selectedSubstances, { ...substance, weight: 0 }]);
  };

  const handleUpdateWeight = (id: string, weight: number): void => {
    setSelectedSubstances(
      selectedSubstances.map((substance) =>
        substance.id === id ? { ...substance, weight } : substance,
      ),
    );
  };

  const handleRemoveSubstance = (id: string): void => {
    setSelectedSubstances(
      selectedSubstances.filter((substance) => substance.id !== id),
    );
  };

  const handleUpdateElementTarget = (element: string, value: number): void => {
    setElements({
      ...elements,
      [element]: value,
    });
  };

  const openCustomSubstanceDialog = (substance?: Substance): void => {
    if (substance) {
      // Editing existing substance
      setEditingSubstance(substance);
      setCustomSubstanceName(substance.name);
      setCustomSubstanceFormula(substance.formula || "");
      setCustomSubstanceElements(substance.elements);
    } else {
      // Creating new substance
      setEditingSubstance(null);
      setCustomSubstanceName("");
      setCustomSubstanceFormula("");
      setCustomSubstanceElements({});
    }
    setCustomSubstanceDialogOpen(true);
  };

  const handleSaveCustomSubstance = async (): Promise<void> => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "É necessário estar logado para salvar substâncias personalizadas",
          variant: "destructive",
        });
        return;
      }

      if (!customSubstanceName.trim()) {
        toast({
          title: "Erro",
          description: "O nome da substância é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Ensure at least one element is defined
      if (Object.keys(customSubstanceElements).length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um elemento à substância",
          variant: "destructive",
        });
        return;
      }

      // Use UUID instead of timestamp-based id
      const newSubstance: CustomSubstance = {
        id: editingSubstance?.id || uuidv4(),
        name: customSubstanceName,
        formula: customSubstanceFormula,
        elements: customSubstanceElements,
        user_id: user.id
      };

      // Save to Supabase using the function
      const savedSubstance = await saveCustomSubstance(newSubstance);

      // Update local state
      if (editingSubstance) {
        setUserCustomSubstances(
          userCustomSubstances.map((s) =>
            s.id === editingSubstance.id ? savedSubstance : s
          )
        );
      } else {
        setUserCustomSubstances([...userCustomSubstances, savedSubstance]);
      }

      toast({
        title: "Sucesso",
        description: "Substância salva com sucesso",
      });
      
      setCustomSubstanceDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving custom substance:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar substância: " + (error.message || "Falha desconhecida"),
        variant: "destructive",
      });
    }
  };

  const setVegetativeValues = () => {
    setElements({
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
    });
    toast({
      title: "Valores atualizados",
      description: "Valores para fase vegetativa aplicados",
    });
  };

  const setBloomValues = () => {
    setElements({
      "N (NO3-)": 150,
      "N (NH4+)": 0,
      P: 50,
      K: 300,
      Mg: 50,
      Ca: 170,
      S: 60,
      Fe: 2.5,
      Mn: 0.5,
      Zn: 0.05,
      B: 0.5,
      Cu: 0.02,
      Si: 0.0,
      Mo: 0.05,
      Na: 0,
      Cl: 0,
    });
    toast({
      title: "Valores atualizados",
      description: "Valores para fase de floração aplicados",
    });
  };

  const resetValues = () => {
    setElements({
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
    });
    setSelectedSubstances([]);
    setResults(null);
    toast({
      title: "Valores resetados",
      description: "Todos os valores foram zerados",
    });
  };

  const calculateNutrients = (): void => {
    if (selectedSubstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma substância",
        variant: "destructive",
      });
      return;
    }

    // Real calculation based on selected substances and target elements
    // Calculate contribution of each substance to the elements
    const totalElements: Record<string, number> = {};
    const contributionBySubstance: Record<string, Record<string, number>> = {};
    
    // Initialize totalElements with zeros for all target elements
    Object.keys(elements).forEach(element => {
      totalElements[element] = 0;
    });
    
    // Calculate the contribution of each substance to each element
    selectedSubstances.forEach(substance => {
      contributionBySubstance[substance.id] = {};
      
      // Skip if weight is zero
      if (substance.weight <= 0) return;
      
      // For each element in the substance
      Object.entries(substance.elements).forEach(([element, percentage]) => {
        // Calculate contribution in mg (ppm)
        // Formula: weight (g) * percentage (%) / solution volume (L) * 10 = ppm
        const contribution = (substance.weight * (percentage as number) / 100) / solutionVolume * 1000;
        
        // Store contribution for this substance and element
        contributionBySubstance[substance.id][element] = contribution;
        
        // Add to total for this element
        if (totalElements[element] !== undefined) {
          totalElements[element] += contribution;
        } else {
          totalElements[element] = contribution;
        }
      });
    });
    
    // Compare actual values with target values and calculate differences
    const elementResults = Object.entries(elements).map(([element, target]) => {
      const actual = totalElements[element] || 0;
      return {
        element,
        target,
        actual,
        difference: actual - target
      };
    });
    
    // Calculate volume per liter for each substance
    const substanceResults = selectedSubstances.map(substance => {
      const volumePerLiter = substance.weight / solutionVolume;
      return {
        name: substance.name,
        weight: substance.weight,
        volumePerLiter
      };
    });
    
    // Calculate EC value (simplified estimation)
    // EC is roughly 0.10 mS/cm per 100 ppm of total dissolved solids
    const totalPpm = Object.values(totalElements).reduce((sum, val) => sum + val, 0);
    const ecValue = (totalPpm / 100 * 0.10).toFixed(2);
    
    const calculationResults: CalculationResult = {
      substances: substanceResults,
      elements: elementResults,
      ecValue,
      solutionVolume,
      volumeUnit,
      // Add these empty fields to match the CalculationResult interface
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
    
    setResults(calculationResults);
    
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
  };

  const handleSaveRecipe = async () => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "É necessário estar logado para salvar receitas",
          variant: "destructive",
        });
        return;
      }

      if (!recipeName.trim()) {
        toast({
          title: "Erro",
          description: "O nome da receita é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!results) {
        toast({
          title: "Erro",
          description: "É necessário calcular os nutrientes antes de salvar",
          variant: "destructive",
        });
        return;
      }

      const recipeData: NutrientRecipe = {
        name: recipeName,
        description: recipeDescription,
        substances: results.substances || [],
        elements: results.elements || [],
        solution_volume: solutionVolume,
        volume_unit: volumeUnit,
        ec_value: parseFloat(results.ecValue || "0"),
        data: {
          ...results,
          name: recipeName,
          description: recipeDescription
        }
      };

      const savedRecipe = await saveNutrientRecipe(recipeData);
      
      // Update local state
      setSavedRecipes([savedRecipe, ...savedRecipes]);
      
      toast({
        title: "Sucesso",
        description: "Receita salva com sucesso",
      });
      
      setSaveRecipeDialogOpen(false);
      setRecipeName("");
      setRecipeDescription("");
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar receita",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteNutrientRecipe(recipeId);
      
      // Update local state
      setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
      
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir receita",
        variant: "destructive",
      });
    }
  };

  const handleOpenSavedRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const recipes = await getUserRecipes();
      setSavedRecipes(recipes);
      setSavedRecipesDialogOpen(true);
    } catch (error) {
      console.error("Error loading saved recipes:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar receitas salvas",
        variant: "destructive",
      });
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleLoadRecipe = (recipe: NutrientRecipe) => {
    // Set solution volume and unit
    setSolutionVolume(recipe.solution_volume);
    setVolumeUnit(recipe.volume_unit);
    
    // Load substances
    if (recipe.substances && Array.isArray(recipe.substances)) {
      const loadedSubstances = recipe.substances.map((substance: any) => {
        // Find the substance in our databases
        const foundSubstance = [...defaultSubstanceDatabase, ...userCustomSubstances, ...premiumSubstances]
          .find(s => s.name === substance.name);
        
        if (foundSubstance) {
          return {
            ...foundSubstance,
            weight: substance.weight
          };
        }
        
        // If not found, create a placeholder
        return {
          id: `loaded-${Date.now()}-${substance.name}`,
          name: substance.name,
          elements: {},
          weight: substance.weight
        };
      });
      
      setSelectedSubstances(loadedSubstances);
    }
    
    // Load element targets
    if (recipe.elements && Array.isArray(recipe.elements)) {
      const newElements = { ...elements };
      
      recipe.elements.forEach((elem: any) => {
        if (elem.element in newElements) {
          newElements[elem.element] = elem.target;
        }
      });
      
      setElements(newElements);
    }
    
    // Set the results
    if (recipe.data) {
      setResults({
        ...recipe.data,
        nutrientA: undefined,
        nutrientB: undefined,
        nutrientC: undefined,
        ph: undefined,
        wateringFrequency: undefined,
        lightHours: undefined,
        expectedYield: undefined,
        growthTime: undefined,
      });
    } else {
      setResults({
        substances: recipe.substances,
        elements: recipe.elements,
        ecValue: recipe.ec_value?.toString() || "0.0",
        solutionVolume: recipe.solution_volume,
        volumeUnit: recipe.volume_unit,
        nutrientA: undefined,
        nutrientB: undefined,
        nutrientC: undefined,
        ph: undefined,
        wateringFrequency: undefined,
        lightHours: undefined,
        expectedYield: undefined,
        growthTime: undefined,
      });
    }
    
    setSavedRecipesDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Receita carregada com sucesso",
    });
  };

  // Create a ref for the results section
  const resultsRef = React.useRef<HTMLDivElement>(null);
  
  const handleSelectPlantDialog = () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Faça login para aplicar receitas às plantas",
        variant: "destructive",
      });
      return;
    }
    
    if (!results) {
      toast({
        title: "Erro",
        description: "Calcule os nutrientes primeiro",
        variant: "destructive",
      });
      return;
    }
    
    setSelectPlantDialogOpen(true);
  };

  return (
    <div className="bg-background">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Calculadora de Nutrientes</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleOpenSavedRecipes}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Receitas Salvas
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="solution-volume">Volume da Solução</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="solution-volume"
                      type="number"
                      value={solutionVolume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value) || 1;
                        setSolutionVolume(newVolume);
                      }}
                      min="0.1"
                      step="0.1"
                    />
                    <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liters">Litros</SelectItem>
                        <SelectItem value="gallons">Galões</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mass-unit">Unidades de Massa</Label>
                  <Select value={massUnit} onValueChange={setMassUnit}>
                    <SelectTrigger id="mass-unit" className="mt-2">
                      <SelectValue placeholder="Selecione a unidade de massa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="mg">Miligramas (mg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase buttons */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex gap-3">
              <Button onClick={setVegetativeValues} variant="outline" className="flex items-center gap-1">
                Vegetativo
              </Button>
              <Button onClick={setBloomValues} variant="outline" className="flex items-center gap-1">
                Floração
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="targets">Concentrações Alvo</TabsTrigger>
              <TabsTrigger value="substances">Seleção de Substâncias</TabsTrigger>
            </TabsList>

            <TabsContent value="substances" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Substance Database */}
                <SubstancesPanel
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filteredSubstances={searchResults}
                  selectedSubstances={selectedSubstances}
                  handleAddSubstance={handleAddSubstance}
                  handleRemoveSubstance={handleRemoveSubstance}
                  openCustomSubstanceDialog={openCustomSubstanceDialog}
                  userCustomSubstances={userCustomSubstances}
                  getElementColor={getElementColor}
                />
                
                {/* Selected Substances */}
                <SelectedSubstancesPanel
                  selectedSubstances={selectedSubstances}
                  handleUpdateWeight={handleUpdateWeight}
                  handleRemoveSubstance={handleRemoveSubstance}
                  massUnit={massUnit}
                />
              </div>
            </TabsContent>

            <TabsContent value="targets" className="mt-4">
              <TargetElementsPanel
                elements={elements}
                handleUpdateElementTarget={handleUpdateElementTarget}
                getElementColor={getElementColor}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="px-8"
              onClick={calculateNutrients}
              disabled={selectedSubstances.length === 0}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Solução de Nutrientes
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8"
              onClick={resetValues}
            >
              <X className="mr-2 h-5 w-5" />
              Limpar Tudo
            </Button>
          </div>

          {results && (
            <div ref={resultsRef}>
              <CalculationResults
                results={results}
                openSaveDialog={() => setSaveRecipeDialogOpen(true)}
                massUnit={massUnit}
                volumeUnit={volumeUnit}
                getElementColor={getElementColor}
                solutionVolume={solutionVolume}
                user={user as SimpleUser | null}
                handleSelectPlantDialog={handleSelectPlantDialog}
              />
            </div>
          )}

          {/* Dialogs */}
          <CustomSubstanceDialog
            open={customSubstanceDialogOpen}
            onClose={() => setCustomSubstanceDialogOpen(false)}
            onSave={handleSaveCustomSubstance}
            customSubstanceName={customSubstanceName}
            setCustomSubstanceName={setCustomSubstanceName}
            customSubstanceFormula={customSubstanceFormula}
            setCustomSubstanceFormula={setCustomSubstanceFormula}
            customSubstanceElements={customSubstanceElements}
            setCustomSubstanceElements={setCustomSubstanceElements}
            editingSubstance={editingSubstance}
          />

          <SaveRecipeDialog
            open={saveRecipeDialogOpen}
            onClose={() => setSaveRecipeDialogOpen(false)}
            onSave={handleSaveRecipe}
            recipeName={recipeName}
            setRecipeName={setRecipeName}
            recipeDescription={recipeDescription}
            setRecipeDescription={setRecipeDescription}
          />

          <SavedRecipesDialog
            open={savedRecipesDialogOpen}
            onClose={() => setSavedRecipesDialogOpen(false)}
            savedRecipes={savedRecipes}
            handleLoadRecipe={handleLoadRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            loadingRecipes={loadingRecipes}
          />

          <SelectPlantDialog
            open={selectPlantDialogOpen}
            onClose={() => setSelectPlantDialogOpen(false)}
            currentRecipeData={results ? {
              ...results,
              name: recipeName || "Receita sem nome",
              description: recipeDescription
            } : null}
          />
        </div>
      </div>
    </div>
  );
};

export default BoraGrowCalculator;
