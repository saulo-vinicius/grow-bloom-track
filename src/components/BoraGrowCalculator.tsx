import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  Beaker,
  Plus,
  Trash2,
  X,
  Save,
  BookOpen,
  Search,
  User,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchPremiumSubstances,
  mockPremiumSubstances,
  PremiumSubstance,
} from "@/lib/premium-substances";
import { Textarea } from "@/components/ui/textarea";
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

interface Substance {
  id: string;
  name: string;
  formula?: string;
  elements: Record<string, number>;
}

interface SelectedSubstance extends Substance {
  weight: number;
}

const BoraGrowCalculator = () => {
  const { user } = useAuth();
  const [calculationType, setCalculationType] = useState<string>("desired");
  const [solutionVolume, setSolutionVolume] = useState<number>(1);
  const [volumeUnit, setVolumeUnit] = useState<string>("liters");
  const [massUnit, setMassUnit] = useState<string>("g");
  const [selectedSubstances, setSelectedSubstances] = useState<SelectedSubstance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("targets");
  const [customSubstanceDialogOpen, setCustomSubstanceDialogOpen] = useState<boolean>(false);
  const [editingSubstance, setEditingSubstance] = useState<Substance | null>(null);
  const [saveRecipeDialogOpen, setSaveRecipeDialogOpen] = useState<boolean>(false);
  const [recipeName, setRecipeName] = useState<string>("");
  const [recipeDescription, setRecipeDescription] = useState<string>("");
  const [savedRecipes, setSavedRecipes] = useState<NutrientRecipe[]>([]);
  const [savedRecipesDialogOpen, setSavedRecipesDialogOpen] = useState<boolean>(false);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);
  const calculatorContext = useCalculator();

  // Custom substance form state
  const [customSubstanceName, setCustomSubstanceName] = useState<string>("");
  const [customSubstanceFormula, setCustomSubstanceFormula] = useState<string>("");
  const [customSubstanceElements, setCustomSubstanceElements] = useState<Record<string, number>>({});

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
    // Micronutrients - all using gray tones as requested
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Expanded sample database of substances
  const defaultSubstanceDatabase: Substance[] = [
    {
      id: "ammonium-nitrate",
      name: "Ammonium Nitrate",
      formula: "NH4NO3",
      elements: { "N (NH4+)": 17.5, "N (NO3-)": 17.5 },
    },
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
      id: "potassium-dibasic-phosphate",
      name: "Potassium Dibasic Phosphate",
      formula: "K2HPO4",
      elements: { K: 44.9, P: 17.8 },
    },
    {
      id: "potassium-nitrate",
      name: "Potassium Nitrate",
      formula: "KNO3",
      elements: { K: 38.7, "N (NO3-)": 13.9 },
    },
    {
      id: "calcium-nitrate",
      name: "Calcium Nitrate",
      formula: "Ca(NO3)2",
      elements: { Ca: 19.0, "N (NO3-)": 15.5 },
    },
    {
      id: "magnesium-sulfate",
      name: "Magnesium Sulfate (Epsom Salt)",
      formula: "MgSO4·7H2O",
      elements: { Mg: 9.8, S: 13.0 },
    },
    {
      id: "calcium-chloride",
      name: "Calcium Chloride",
      formula: "CaCl2",
      elements: { Ca: 36.1, Cl: 63.9 },
    },
    {
      id: "potassium-sulfate",
      name: "Potassium Sulfate",
      formula: "K2SO4",
      elements: { K: 45.0, S: 18.4 },
    },
    {
      id: "mono-potassium-phosphate",
      name: "Mono Potassium Phosphate",
      formula: "KH2PO4",
      elements: { K: 28.7, P: 22.8 },
    },
    {
      id: "iron-edta",
      name: "Iron EDTA",
      formula: "Fe-EDTA",
      elements: { Fe: 13.0 },
    },
    {
      id: "manganese-sulfate",
      name: "Manganese Sulfate",
      formula: "MnSO4·H2O",
      elements: { Mn: 32.5, S: 19.0 },
    },
    {
      id: "zinc-sulfate",
      name: "Zinc Sulfate",
      formula: "ZnSO4·7H2O",
      elements: { Zn: 22.7, S: 11.0 },
    },
    {
      id: "copper-sulfate",
      name: "Copper Sulfate",
      formula: "CuSO4·5H2O",
      elements: { Cu: 25.5, S: 12.8 },
    },
    {
      id: "boric-acid",
      name: "Boric Acid",
      formula: "H3BO3",
      elements: { B: 17.5 },
    },
    {
      id: "sodium-molybdate",
      name: "Sodium Molybdate",
      formula: "Na2MoO4·2H2O",
      elements: { Mo: 39.7, Na: 19.5 },
    },
  ];

  // Filter substances based on search term
  React.useEffect(() => {
    // Create a stable reference to the database to prevent infinite loops
    const currentDatabase = [
      ...userCustomSubstances,
      ...defaultSubstanceDatabase,
    ];

    // Always include premium substances in the results
    const searchDatabase = [...currentDatabase, ...premiumSubstances];

    // If search term is empty, show all substances including premium ones
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

  // Create a memoized filtered substances list to prevent infinite loops
  const filteredSubstances = React.useMemo(() => {
    return searchResults;
  }, [searchResults]);

  // Effect to switch tabs when calculation type changes
  React.useEffect(() => {
    if (calculationType === "weights") {
      setActiveTab("substances");
    } else if (calculationType === "desired") {
      setActiveTab("targets");
    }
  }, [calculationType]);

  // Load saved recipes and custom substances on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Load saved recipes
        setLoadingRecipes(true);
        const recipes = await getUserRecipes();
        setSavedRecipes(recipes);
        
        // Load custom substances
        const substances = await getUserCustomSubstances();
        setUserCustomSubstances(substances);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load saved data",
          variant: "destructive",
        });
      } finally {
        setLoadingRecipes(false);
      }
    };

    loadUserData();
  }, [user]);

  // Set default active tab to targets and load premium substances
  React.useEffect(() => {
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
          title: "Error",
          description: "You must be logged in to save custom substances",
          variant: "destructive",
        });
        return;
      }

      if (!customSubstanceName.trim()) {
        toast({
          title: "Error",
          description: "Substance name is required",
          variant: "destructive",
        });
        return;
      }

      const newSubstance: Substance = {
        id: editingSubstance?.id || `custom-${Date.now()}`,
        name: customSubstanceName,
        formula: customSubstanceFormula,
        elements: customSubstanceElements,
      };

      // Save to Supabase using the new function
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
        title: "Success",
        description: "Substance saved successfully",
      });
      
      setCustomSubstanceDialogOpen(false);
    } catch (error) {
      console.error("Error saving custom substance:", error);
      toast({
        title: "Error",
        description: "Failed to save substance",
        variant: "destructive",
      });
    }
  };

  const calculateNutrients = (): void => {
    if (selectedSubstances.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one substance",
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
        const contribution = (substance.weight * percentage / 100) / solutionVolume * 1000;
        
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
    
    const calculationResults = {
      substances: substanceResults,
      elements: elementResults,
      ecValue
    };
    
    setResults(calculationResults);
    
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
    
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaveRecipe = async () => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save recipes",
          variant: "destructive",
        });
        return;
      }

      if (!recipeName.trim()) {
        toast({
          title: "Error",
          description: "Recipe name is required",
          variant: "destructive",
        });
        return;
      }

      if (!results) {
        toast({
          title: "Error",
          description: "You must calculate nutrients before saving",
          variant: "destructive",
        });
        return;
      }

      const recipeData: NutrientRecipe = {
        name: recipeName,
        description: recipeDescription,
        substances: results.substances,
        elements: results.elements,
        solution_volume: solutionVolume,
        volume_unit: volumeUnit,
        ec_value: parseFloat(results.ecValue)
      };

      const savedRecipe = await saveNutrientRecipe(recipeData);
      
      // Update local state
      setSavedRecipes([savedRecipe, ...savedRecipes]);
      
      toast({
        title: "Success",
        description: "Recipe saved successfully",
      });
      
      setSaveRecipeDialogOpen(false);
      setRecipeName("");
      setRecipeDescription("");
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error",
        description: "Failed to save recipe",
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
        title: "Success",
        description: "Recipe deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
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
        title: "Error",
        description: "Failed to load saved recipes",
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
      const loadedSubstances = recipe.substances.map(substance => {
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
      
      recipe.elements.forEach(elem => {
        if (elem.element in newElements) {
          newElements[elem.element] = elem.target;
        }
      });
      
      setElements(newElements);
    }
    
    // Set the results
    setResults({
      substances: recipe.substances,
      elements: recipe.elements,
      ecValue: recipe.ec_value?.toString() || "0.0"
    });
    
    setSavedRecipesDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Recipe loaded successfully",
    });
  };
  
  // Create a ref for the results section
  const resultsRef = React.useRef<HTMLDivElement>(null);

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
                        <SelectValue placeholder="Unit" />
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
                      <SelectValue placeholder="Select mass unit" />
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

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="targets">Concentrações Alvo</TabsTrigger>
              <TabsTrigger value="substances">Seleção de Substâncias</TabsTrigger>
            </TabsList>

            <TabsContent value="substances" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Substance Database */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Banco de Dados de Substâncias
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => openCustomSubstanceDialog()}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Personalizada
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Buscar substâncias..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      <div className="px-4 py-2">
                        {filteredSubstances.length > 0 ? filteredSubstances.map((substance) => (
                          <div
                            key={substance.id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {userCustomSubstances.some(
                                    (s) => s.id === substance.id,
                                  ) && (
                                    <span
                                      className="mr-1"
                                      title="Custom Substance"
                                    >
                                      <User className="h-4 w-4 text-orange-500" />
                                    </span>
                                  )}
                                  <p className="font-medium">
                                    {substance.name}
                                  </p>
                                </div>
                                {"premium" in substance &&
                                  substance.premium && (
                                    <span className="ml-1 text-amber-500 font-medium text-xs">
                                      (Premium)
                                    </span>
                                  )}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                {substance.formula}
                                {"brand" in substance && (
                                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 rounded-sm">
                                    {substance.brand}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(substance.elements).slice(0, 3).map(
                                  ([element, percentage]) => (
                                    <span
                                      key={element}
                                      className={`text-xs px-1.5 py-0.5 rounded-sm ${getElementColor(element)}`}
                                    >
                                      {element}: {percentage}%
                                    </span>
                                  ),
                                )}
                                {Object.entries(substance.elements).length > 3 && (
                                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                                    +{Object.entries(substance.elements).length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {selectedSubstances.some(
                                (s) => s.id === substance.id,
                              ) ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() =>
                                    handleRemoveSubstance(substance.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleAddSubstance(substance)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="py-8 text-center text-muted-foreground">
                            Nenhuma substância encontrada. Tente um termo de busca diferente.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* Selected Substances */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Substâncias Selecionadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedSubstances.length > 0 ? selectedSubstances.map((substance) => (
                        <div
                          key={substance.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{substance.name}</div>
                            <div className="text-xs text-muted-foreground">{substance.formula}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              value={substance.weight}
                              onChange={(e) => handleUpdateWeight(substance.id, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-right"
                              min="0"
                              step="0.01"
                            />
                            <span className="text-sm">{massUnit}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive"
                              onClick={() => handleRemoveSubstance(substance.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="py-8 text-center text-muted-foreground">
                          Nenhuma substância selecionada. Adicione substâncias do banco de dados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="targets" className="mt-4">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      Concentrações Alvo (ppm)
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reset all values to zero
                        const clearedElements = Object.keys(elements).reduce(
                          (acc, key) => {
                            acc[key] = 0;
                            return acc;
                          },
                          {} as Record<string, number>,
                        );

                        setElements(clearedElements);
                        toast({
                          title: "Limpeza Completa",
                          description:
                            "Todas as concentrações alvo foram limpas",
                        });
                      }}
                    >
                      Limpar Valores
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Set vegetative stage values
                        const vegElements = {
                          ...Object.keys(elements).reduce(
                            (acc, key) => {
                              acc[key] = 0;
                              return acc;
                            },
                            {} as Record<string, number>,
                          ),
                          "N (NO3-)": 199,
                          P: 62,
                          K: 207,
                          Ca: 242,
                          Mg: 60,
                          S: 132,
                        };

                        setElements(vegElements);
                        toast({
                          title: "Perfil Vegetativo Aplicado",
                          description:
                            "Concentrações alvo definidas para fase vegetativa",
                        });
                      }}
                    >
                      Vegetativo
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // Set flowering stage values
                        const floweringElements = {
                          ...Object.keys(elements).reduce(
                            (acc, key) => {
                              acc[key] = 0;
                              return acc;
                            },
                            {} as Record<string, number>,
                          ),
                          "N (NO3-)": 149,
                          P: 68,
                          K: 331,
                          Ca: 204,
                          Mg: 93,
                          S: 224,
                        };

                        setElements(floweringElements);
                        toast({
                          title: "Perfil de Floração Aplicado",
                          description:
                            "Concentrações alvo definidas para fase de floração",
                        });
                      }}
                    >
                      Floração
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(elements).map(([element, target]) => (
                      <div key={element} className="space-y-1">
                        <Label
                          htmlFor={`element-${element}`}
                          className={`text-sm font-medium px-2 py-1 rounded-sm ${getElementColor(element)}`}
                        >
                          {element}
                        </Label>
                        <Input
                          id={`element-${element}`}
                          type="number"
                          value={target}
                          onChange={(e) =>
                            handleUpdateElementTarget(
                              element,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="ppm"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
              onClick={() => {
                setSelectedSubstances([]);
                setResults(null);
                toast({
                  title: "Redefinição Completa",
                  description: "Todas as seleções e resultados foram limpos",
                });
              }}
            >
              <X className="mr-2 h-5 w-5" />
              Limpar Tudo
            </Button>
          </div>

          {results && (
            <Card className="h-full" ref={resultsRef}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resultados do Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Substance Weights */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Pesos das Substâncias para {solutionVolume} {volumeUnit}
                    </h3>
                    <div className="space-y-2">
                      {results.substances.map((result: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                        >
                          <span className="font-medium">{result.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24">
                              <Input
                                type="text"
                                value={result.weight.toString()}
                                className="h-8 text-right"
                                readOnly
                              />
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{massUnit}</div>
                              <div className="text-xs text-muted-foreground">
                                {result.volumePerLiter.toFixed(2)} {massUnit}/
                                {volumeUnit === "liters" ? "L" : "gal"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Element Concentrations */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Concentrações de Elementos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-xs text-muted-foreground border-b">
                            <th className="text-left p-2">Elemento</th>
                            <th className="text-right p-2">Alvo (ppm)</th>
                            <th className="text-right p-2">Atual (ppm)</th>
                            <th className="text-right p-2">Diferença</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.elements.map(
                            (result: any, index: number) => (
                              <tr key={index} className="border-b last:border-0 text-sm">
                                <td className="p-2 font-medium">
                                  <span
                                    className={`px-2 py-1 rounded-sm ${getElementColor(result.element)}`}
                                  >
                                    {result.element}
                                  </span>
                                </td>
                                <td className="p-2 text-right">
                                  {result.target.toFixed(2)}
                                </td>
                                <td className="p-2 text-right">
                                  {result.actual.toFixed(2)}
                                </td>
                                <td
                                  className={`p-2 text-right ${Math.abs(result.difference) > result.target * 0.1 ? "text-destructive" : "text-green-600"}`}
                                >
                                  {result.difference > 0 ? "+" : ""}
                                  {result.difference.toFixed(2)}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Predicted EC Value */}
                    <div className="mt-4 p-3 bg-primary/10 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          Valor EC Previsto:
                        </span>
                        <span className="text-lg font-bold">
                          {results.ecValue} mS/cm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        A Condutividade Elétrica (EC) é uma estimativa baseada em
                        nutrientes dissolvidos totais
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        // Generate CSV from results
                        const csvContent = [
                          `"Nome da Receita","Data","Volume","Unidade"`,
                          `"Receita Calculada","${new Date().toLocaleDateString()}","${solutionVolume}","${volumeUnit}"`,
                          `\n"Substância","Peso (${massUnit})","Por Litro (${massUnit}/L)"`,
                          ...results.substances.map((s: any) => 
                            `"${s.name}","${s.weight}","${s.volumePerLiter.toFixed(2)}"`
                          ),
                          `\n"Elemento","Alvo (ppm)","Atual (ppm)","Diferença"`,
                          ...results.elements.map((e: any) => 
                            `"${e.element}","${e.target.toFixed(2)}","${e.actual.toFixed(2)}","${e.difference.toFixed(2)}"`
                          )
                        ].join('\n');
                        
                        // Create download link
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `nutrient-recipe-${Date.now()}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        toast({
                          title: "Exportação Completa",
                          description: "A receita foi exportada como CSV",
                        });
                      }}
                    >
                      Exportar Receita (CSV)
                    </Button>
                    <Button
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Login Necessário",
                            description: "Faça login para salvar receitas",
                            variant: "destructive",
                          });
                          return;
                        }
                        setSaveRecipeDialogOpen(true);
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Salvar Receita
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Recipe Dialog */}
          <Dialog
            open={saveRecipeDialogOpen}
            onOpenChange={setSaveRecipeDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Salvar Receita de Nutrientes</DialogTitle>
                <DialogDescription>
                  Salve sua receita atual de solução de nutrientes para uso futuro.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Nome da Receita</Label>
                  <Input
                    id="recipe-name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="ex. Tomate Fase Vegetativa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-description">Descrição (opcional)</Label>
                  <Textarea
                    id="recipe-description"
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    placeholder="Adicione notas sobre esta receita..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveRecipeDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveRecipe}>
                  Salvar Receita
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Saved Recipes Dialog */}
          <Dialog
            open={savedRecipesDialogOpen}
            onOpenChange={setSavedRecipesDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Receitas Salvas</DialogTitle>
                <DialogDescription>
                  Visualize e gerencie suas receitas de nutrientes salvas.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {loadingRecipes ? (
                  <div className="text-center py-8">Carregando receitas...</div>
                ) : savedRecipes.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {savedRecipes.map((recipe) => (
                        <Card key={recipe.id} className="overflow-hidden">
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{recipe.name}</CardTitle>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleLoadRecipe(recipe)}
                                >
                                  <Beaker className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => handleDeleteRecipe(recipe.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 text-sm">
                            <p className="text-muted-foreground mb-2">
                              {recipe.description || "Sem descrição"}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <div className="text-xs bg-primary/10 rounded px-2 py-1">
                                Volume: {recipe.solution_volume} {recipe.volume_unit}
                              </div>
                              <div className="text-xs bg-primary/10 rounded px-2 py-1">
                                EC: {recipe.ec_value || "N/A"} mS/cm
                              </div>
                              <div className="text-xs bg-primary/10 rounded px-2 py-1">
                                Data: {new Date(recipe.created_at!).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <p>Você não tem receitas salvas.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Calcule uma receita e clique em "Salvar Receita" para começar.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSavedRecipesDialogOpen(false)}
                >
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Custom Substance Dialog */}
          <Dialog
            open={customSubstanceDialogOpen}
            onOpenChange={setCustomSubstanceDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSubstance ? "Editar Substância" : "Adicionar Nova Substância"}
                </DialogTitle>
                <DialogDescription>
                  Crie uma substância personalizada com seus próprios elementos e percentuais.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="substance-name">Nome da Substância</Label>
                    <Input
                      id="substance-name"
                      value={customSubstanceName}
                      onChange={(e) => setCustomSubstanceName(e.target.value)}
                      placeholder="ex. Nitrato de Cálcio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="substance-formula">Fórmula Química (opcional)</Label>
                    <Input
                      id="substance-formula"
                      value={customSubstanceFormula}
                      onChange={(e) => setCustomSubstanceFormula(e.target.value)}
                      placeholder="ex. Ca(NO3)2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Elementos e Percentuais</Label>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {Object.entries(customSubstanceElements).map(([element, percentage]) => (
                          <div key={element} className="flex items-center gap-2">
                            <Input
                              value={element}
                              onChange={(e) => {
                                const newElements = { ...customSubstanceElements };
                                delete newElements[element];
                                newElements[e.target.value] = percentage;
                                setCustomSubstanceElements(newElements);
                              }}
                              className="flex-1"
                              placeholder="Elemento (ex. N, P, K)"
                            />
                            <Input
                              type="number"
                              value={percentage}
                              onChange={(e) => {
                                setCustomSubstanceElements({
                                  ...customSubstanceElements,
                                  [element]: parseFloat(e.target.value) || 0,
                                });
                              }}
                              className="w-24"
                              placeholder="%"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8 text-destructive"
                              onClick={() => {
                                const newElements = { ...customSubstanceElements };
                                delete newElements[element];
                                setCustomSubstanceElements(newElements);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setCustomSubstanceElements({
                              ...customSubstanceElements,
                              [`Element-${Object.keys(customSubstanceElements).length + 1}`]: 0,
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Elemento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCustomSubstanceDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveCustomSubstance}>
                  Salvar Substância
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default BoraGrowCalculator;
