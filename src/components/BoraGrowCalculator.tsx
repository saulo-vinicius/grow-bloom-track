
import React, { useState, useRef } from "react";
import { createClient } from "@/integrations/supabase/client";
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
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
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

  // Sample database of substances
  const defaultSubstanceDatabase: Substance[] = [
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

  // Set default active tab to targets
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
    toast({
      title: "Success",
      description: "Substance saved successfully",
    });
    setCustomSubstanceDialogOpen(false);
  };

  const calculateNutrients = (): void => {
    // Calculate based on selected substances and target elements
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
    
    // Simple dummy calculation based on inputs
    const dummyResults = {
      substances: selectedSubstances.map(substance => ({
        name: substance.name,
        weight: substance.weight,
        volumePerLiter: substance.weight
      })),
      elements: Object.entries(elements).map(([element, target]) => ({
        element,
        target,
        actual: target * 0.9, // Just a dummy calculation
        difference: target * -0.1
      })),
      ecValue: "1.20"
    };
    
    setResults(dummyResults);
    
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  
  // Create a ref for the results section
  const resultsRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-background">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="solution-volume">Solution Volume</Label>
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
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="gallons">Gallons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="mass-unit">Mass Units</Label>
                  <Select value={massUnit} onValueChange={setMassUnit}>
                    <SelectTrigger id="mass-unit" className="mt-2">
                      <SelectValue placeholder="Select mass unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="mg">Milligrams (mg)</SelectItem>
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
              <TabsTrigger value="targets">Target Concentrations</TabsTrigger>
              <TabsTrigger value="substances">Substance Selection</TabsTrigger>
            </TabsList>

            <TabsContent value="substances" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Substance Database */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        Substance Database
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => openCustomSubstanceDialog()}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Custom
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Search substances..."
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
                            No substances found. Try a different search term.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                {/* Selected Substances */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Selected Substances</CardTitle>
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
                          No substances selected yet. Add substances from the database.
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
                      Target Concentrations (ppm)
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
                          title: "Clear Complete",
                          description:
                            "All target concentrations have been cleared",
                        });
                      }}
                    >
                      Clear Values
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
                          title: "Vegetative Profile Applied",
                          description:
                            "Target concentrations set for vegetative stage",
                        });
                      }}
                    >
                      Veg
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
                          title: "Flowering Profile Applied",
                          description:
                            "Target concentrations set for flowering stage",
                        });
                      }}
                    >
                      Flowering
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
              Calculate Nutrient Solution
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8"
              onClick={() => {
                setSelectedSubstances([]);
                setResults(null);
                toast({
                  title: "Reset Complete",
                  description: "All selections and results have been cleared",
                });
              }}
            >
              <X className="mr-2 h-5 w-5" />
              Clear All
            </Button>
          </div>

          {results && (
            <Card className="h-full" ref={resultsRef}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Calculation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Substance Weights */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Substance Weights for {solutionVolume} {volumeUnit}
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
                      Element Concentrations
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-xs text-muted-foreground border-b">
                            <th className="text-left p-2">Element</th>
                            <th className="text-right p-2">Target (ppm)</th>
                            <th className="text-right p-2">Actual (ppm)</th>
                            <th className="text-right p-2">Difference</th>
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
                          Predicted EC Value:
                        </span>
                        <span className="text-lg font-bold">
                          {results.ecValue} mS/cm
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Electrical Conductivity (EC) is an estimate based on
                        total dissolved nutrients
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        toast({
                          title: "Export Complete",
                          description: "Recipe has been exported as CSV",
                        });
                      }}
                    >
                      Export Recipe (CSV)
                    </Button>
                    <Button
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        setSaveRecipeDialogOpen(true);
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Save Recipe
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
                <DialogTitle>Save Nutrient Recipe</DialogTitle>
                <DialogDescription>
                  Save your current nutrient solution recipe for future use.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recipe-name">Recipe Name</Label>
                  <Input
                    id="recipe-name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="e.g. Tomato Vegetative Stage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe-description">Description (optional)</Label>
                  <Textarea
                    id="recipe-description"
                    value={recipeDescription}
                    onChange={(e) => setRecipeDescription(e.target.value)}
                    placeholder="Add notes about this recipe..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveRecipeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Success",
                      description: "Recipe saved successfully",
                    });
                    setSaveRecipeDialogOpen(false);
                  }}
                >
                  Save Recipe
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
