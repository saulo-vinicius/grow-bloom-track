import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateNutrients as calculateNutrientsUtil } from "@/utils/calculatorUtils";

// Import components
import SubstancesPanel from "./calculator/SubstancesPanel";
import SelectedSubstancesPanel from "./calculator/SelectedSubstancesPanel";
import TargetElementsPanel from "./calculator/TargetElementsPanel";
import CalculationResults from "./calculator/CalculationResults";
import CustomSubstanceDialog from "./calculator/CustomSubstanceDialog";
import SaveRecipeDialog from "./calculator/SaveRecipeDialog";
import SavedRecipesDialog from "./calculator/SavedRecipesDialog";
import SelectPlantDialog from "./calculator/SelectPlantDialog";
import VolumeUnitSelector from "./calculator/VolumeUnitSelector";
import GrowthPhaseSelector from "./calculator/GrowthPhaseSelector";
import ActionButtons from "./calculator/ActionButtons";

// Import types and utilities
import { 
  Substance, 
  SelectedSubstance, 
  CalculationResult, 
  SimpleUser, 
  CustomSubstance, 
  asSubstance 
} from "@/types/calculator";

import { 
  defaultElements,
  defaultSubstanceDatabase,
  nutrientColors,
  resetElements,
  getElementColor as getColorForElement
} from "@/utils/calculatorConstants";

const BoraGrowCalculator = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // State for solution parameters
  const [calculationType, setCalculationType] = useState<string>("desired");
  const [solutionVolume, setSolutionVolume] = useState<number>(1);
  const [volumeUnit, setVolumeUnit] = useState<string>("liters");
  const [massUnit, setMassUnit] = useState<string>("g");
  
  // State for substances and elements
  const [selectedSubstances, setSelectedSubstances] = useState<SelectedSubstance[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [elements, setElements] = useState<Record<string, number>>(defaultElements);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("targets");
  const [activePhase, setActivePhase] = useState<string>("none");

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
  
  // State for premium substances and user custom substances
  const [userCustomSubstances, setUserCustomSubstances] = useState<Substance[]>([]);
  const [premiumSubstances, setPremiumSubstances] = useState<PremiumSubstance[]>([]);
  const [isPremiumLoading, setIsPremiumLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<(Substance | PremiumSubstance)[]>([]);

  // Helper function to get color for element
  const getElementColor = (element: string): string => {
    return getColorForElement(element, nutrientColors);
  };

  // Filter substances based on search term
  useEffect(() => {
    const currentDatabase = [
      ...userCustomSubstances.map(asSubstance),
      ...defaultSubstanceDatabase,
    ];

    const searchDatabase = [...currentDatabase, ...premiumSubstances];

    if (searchTerm.trim() === "") {
      setSearchResults(searchDatabase);
      return;
    }

    const filtered = searchDatabase.filter((substance) =>
      substance.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setSearchResults(filtered);
  }, [searchTerm, userCustomSubstances, premiumSubstances]);

  // Auto-recalculate when inputs change
  useEffect(() => {
    if (selectedSubstances.length > 0) {
      const hasSubstancesWithWeight = selectedSubstances.some(s => s.weight > 0);
      if (hasSubstancesWithWeight) {
        performCalculation();
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
        setLoadingRecipes(true);
        const recipes = await getUserRecipes().catch(error => {
          console.error("Error loading recipes:", error);
          return [];
        });
        setSavedRecipes(recipes);
        
        const substances = await getUserCustomSubstances().catch(error => {
          console.error("Error loading custom substances:", error);
          return [];
        });
        
        const validSubstances = substances.map(substance => ({
          ...substance,
          id: substance.id || uuidv4()
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
      setEditingSubstance(substance);
      setCustomSubstanceName(substance.name);
      setCustomSubstanceFormula(substance.formula || "");
      setCustomSubstanceElements(substance.elements);
    } else {
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

      if (Object.keys(customSubstanceElements).length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um elemento à substância",
          variant: "destructive",
        });
        return;
      }

      const newSubstance: CustomSubstance = {
        id: editingSubstance?.id || uuidv4(),
        name: customSubstanceName,
        formula: customSubstanceFormula,
        elements: customSubstanceElements,
        user_id: user.id
      };

      const savedSubstance = await saveCustomSubstance(newSubstance);

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

  const performCalculation = () => {
    // This function calls the utility function with a different name to avoid recursion
    if (selectedSubstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma substância",
        variant: "destructive",
      });
      return;
    }
    
    const calculationResults = calculateNutrientsUtil(
      selectedSubstances,
      elements,
      solutionVolume,
      volumeUnit
    );
    
    setResults(calculationResults);
    
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
  };

  const resetAllValues = () => {
    setActivePhase("none");
    setElements(resetElements);
    setSelectedSubstances([]);
    setResults(null);
    toast({
      title: "Valores resetados",
      description: "Todos os valores foram zerados",
    });
  };

  // Handle save recipe
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

      // Restructure the recipe data to match the database schema
      const recipeData: NutrientRecipe = {
        name: recipeName,
        description: recipeDescription,
        substances: results.substances || [],
        elements: results.elements || [],
        solution_volume: solutionVolume,
        volume_unit: volumeUnit,
        ec_value: parseFloat(results.ecValue || "0"),
        user_id: user.id
      };

      const cleanedData = JSON.parse(JSON.stringify(recipeData));
      
      const savedRecipe = await saveNutrientRecipe(cleanedData);
      
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
        description: "Falha ao salvar receita: " + (error instanceof Error ? error.message : "Erro desconhecido"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteNutrientRecipe(recipeId);
      
      setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
      
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a receita",
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
    setSolutionVolume(recipe.solution_volume);
    setVolumeUnit(recipe.volume_unit);
    
    if (recipe.substances && Array.isArray(recipe.substances)) {
      const loadedSubstances = recipe.substances.map((substance: any) => {
        const foundSubstance = [...defaultSubstanceDatabase, ...userCustomSubstances, ...premiumSubstances]
          .find(s => s.name === substance.name);
        
        if (foundSubstance) {
          return {
            ...foundSubstance,
            weight: substance.weight
          };
        }
        
        return {
          id: `loaded-${Date.now()}-${substance.name}`,
          name: substance.name,
          elements: {},
          weight: substance.weight
        };
      });
      
      setSelectedSubstances(loadedSubstances);
    }
    
    if (recipe.elements && Array.isArray(recipe.elements)) {
      const newElements = { ...elements };
      
      recipe.elements.forEach((elem: any) => {
        if (elem.element in newElements) {
          newElements[elem.element] = elem.target;
        }
      });
      
      setElements(newElements);
    }
    
    // Create a results object from the recipe
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
      name: undefined,
      description: undefined
    });
    
    setSavedRecipesDialogOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Receita carregada com sucesso",
    });
  };

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

  const handleDeleteCustomSubstance = async (substanceId: string) => {
    try {
      await deleteCustomSubstance(substanceId);
      
      setUserCustomSubstances(prevSubstances => 
        prevSubstances.filter(substance => substance.id !== substanceId)
      );
      
      toast({
        title: "Substância excluída",
        description: "A substância foi removida com sucesso",
      });
    } catch (error) {
      console.error("Error deleting custom substance:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a substância",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-background">
      <div className="max-w-[1200px] mx-auto px-2">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Calculadora de Nutrientes</h2>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={handleOpenSavedRecipes}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" />
              Receitas Salvas
            </Button>
          </div>

          <VolumeUnitSelector 
            solutionVolume={solutionVolume}
            setSolutionVolume={setSolutionVolume}
            volumeUnit={volumeUnit}
            setVolumeUnit={setVolumeUnit}
            massUnit={massUnit}
            setMassUnit={setMassUnit}
          />

          <GrowthPhaseSelector 
            activePhase={activePhase}
            setActivePhase={setActivePhase}
            setElements={setElements}
            setSelectedSubstances={setSelectedSubstances}
            setResults={setResults}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
              <TabsTrigger value="targets">Concentrações Alvo</TabsTrigger>
              <TabsTrigger value="substances">Seleção de Substâncias</TabsTrigger>
            </TabsList>

            <TabsContent value="substances" className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  onDeleteCustomSubstance={handleDeleteCustomSubstance}
                />
                
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

          <ActionButtons 
            selectedSubstances={selectedSubstances}
            elements={elements}
            solutionVolume={solutionVolume}
            volumeUnit={volumeUnit}
            setResults={setResults}
            resetValues={resetAllValues}
          />

          {results && (
            <div ref={resultsRef} className="w-full overflow-x-auto">
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
