"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  Beaker,
  FlaskConical,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  BookOpen,
  Clock,
  Bookmark,
  Search,
  Crown,
  User,
} from "lucide-react";
import {
  fetchPremiumSubstances,
  mockPremiumSubstances,
  PremiumSubstance,
} from "@/lib/premium-substances";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  saveNutrientRecipe,
  getUserRecipes,
  deleteNutrientRecipe,
  NutrientRecipe,
} from "@/lib/recipes";
import { Textarea } from "@/components/ui/textarea";

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
  const [savedRecipes, setSavedRecipes] = useState<NutrientRecipe[]>([]);
  const [savedRecipesDialogOpen, setSavedRecipesDialogOpen] = useState<boolean>(false);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);

  // Custom substance form state
  const [customSubstanceName, setCustomSubstanceName] = useState<string>("");
  const [customSubstanceFormula, setCustomSubstanceFormula] = useState<string>("");
  const [customSubstanceElements, setCustomSubstanceElements] = useState<Record<string, number>>({});

  // Define nutrient color coding
  const nutrientColors: Record<string, string> = {
    // Primary Macronutrients
    "N (NO3-)": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    "N (NH4+)": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    P: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    "P₂O₅": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    K: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    "K₂O": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    // Secondary Macronutrients
    Mg: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    Ca: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    S: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    // Micronutrients - all using gray tones as requested
    Fe: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Mn: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Zn: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    B: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Cu: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Mo: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Si: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    "SiO₂": "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Na: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
    Cl: "bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300",
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

  // Load user's custom substances, recipes, and premium substances
  useEffect(() => {
    if (user) {
      loadUserSubstances();
      loadUserRecipes();
    }
    loadPremiumSubstances();
  }, [user]);

  // Load premium substances from Supabase storage
  const loadPremiumSubstances = async (): Promise<void> => {
    try {
      setIsPremiumLoading(true);
      // Try to fetch from Supabase storage
      const substances = await fetchPremiumSubstances();

      // If no substances were returned, use mock data
      if (substances.length === 0) {
        setPremiumSubstances(mockPremiumSubstances);
      } else {
        setPremiumSubstances(substances);
      }
    } catch (error) {
      console.error("Error loading premium substances:", error);
      // Fallback to mock data
      setPremiumSubstances(mockPremiumSubstances);
    } finally {
      setIsPremiumLoading(false);
    }
  };

  const loadUserSubstances = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("custom_substances")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Convert database substances to the format used in the app
      if (data && data.length > 0) {
        const userSubstances: Substance[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          formula: item.formula,
          elements: item.elements,
        }));

        // Add to the beginning of the database array
        setUserCustomSubstances(userSubstances);
      }
    } catch (error) {
      console.error("Error loading user substances:", error);
    }
  };

  const loadUserRecipes = async (): Promise<void> => {
    try {
      setLoadingRecipes(true);
      const recipes = await getUserRecipes();
      setSavedRecipes(recipes);
    } catch (error) {
      console.error("Error loading user recipes:", error);
      toast({
        title: "Error",
        description: "Failed to load saved recipes",
        variant: "destructive",
      });
    } finally {
      setLoadingRecipes(false);
    }
  };

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
    },
    // Greenhas products from the document
    {
      id: "vivema-twin",
      name: "Vivema Twin",
      formula: "",
      elements: { "N (NO3-)": 15.0, K: 5.0, Ca: 4.0, Fe: 0.05, Zn: 0.01 },
    },
    {
      id: "algaren-twin",
      name: "Algaren Twin",
      formula: "",
      elements: { "N (NO3-)": 3.0, K: 7.0, Mg: 2.0, S: 1.5, B: 0.2 },
    },
    {
      id: "eranthis",
      name: "Eranthis",
      formula: "",
      elements: { "N (NO3-)": 3.0, K: 15.0, Ca: 3.0, B: 0.5 },
    },
    {
      id: "drin",
      name: "Drin",
      formula: "",
      elements: {
        "N (NO3-)": 5.0,
        P: 8.0,
        K: 10.0,
        B: 0.1,
        Fe: 0.2,
        Mn: 0.1,
        Zn: 0.1,
      },
    },
    {
      id: "drin-on",
      name: "Drin On",
      formula: "",
      elements: {
        "N (NO3-)": 5.0,
        P: 8.0,
        K: 10.0,
        B: 0.1,
        Fe: 0.2,
        Mn: 0.1,
        Zn: 0.1,
      },
    },
    {
      id: "greit-vg",
      name: "Greit Vg",
      formula: "",
      elements: {
        "N (NO3-)": 8.0,
        P: 5.0,
        K: 10.0,
        B: 0.1,
        Fe: 0.2,
        Mn: 0.1,
        Zn: 0.1,
      },
    },
    {
      id: "calboron",
      name: "Calboron",
      formula: "",
      elements: { Ca: 8.0, B: 0.2 },
    },
    {
      id: "expando",
      name: "Expando",
      formula: "",
      elements: { "N (NO3-)": 3.0, Ca: 5.0, B: 0.1, Mo: 0.001 },
    },
    {
      id: "silvest",
      name: "Silvest",
      formula: "",
      elements: { Si: 8.0, K: 12.0 },
    },
    {
      id: "kiem",
      name: "Kiem",
      formula: "",
      elements: { "N (NO3-)": 6.0, P: 12.0, K: 6.0, Zn: 0.05 },
    },
    {
      id: "nutrigreen-ad",
      name: "Nutrigreen Ad",
      formula: "",
      elements: { "N (NO3-)": 8.0, "N (NH4+)": 1.0, K: 5.0 },
    },
    {
      id: "vit-org-vg",
      name: "Vit-Org Vg",
      formula: "",
      elements: { "N (NO3-)": 5.0, "N (NH4+)": 1.0, K: 6.0 },
    },
    {
      id: "zaminol",
      name: "Zaminol",
      formula: "",
      elements: { "N (NO3-)": 5.0, "N (NH4+)": 1.0, K: 7.0 },
    },
    {
      id: "greenhum-wp",
      name: "Greenhum Wp",
      formula: "",
      elements: { K: 10.0 },
    },
    {
      id: "magic-p-star",
      name: "Magic P Star",
      formula: "",
      elements: { P: 30.0 },
    },
    {
      id: "calfomyth",
      name: "Calfomyth",
      formula: "",
      elements: { Ca: 10.0, P: 5.0 },
    },
    {
      id: "foliacon-22",
      name: "Foliacon 22",
      formula: "",
      elements: { "N (NO3-)": 22.0 },
    },
    {
      id: "hascon-m10-ad",
      name: "Hascon M10 Ad",
      formula: "",
      elements: { Mg: 10.0, S: 13.0 },
    },
    {
      id: "molystar",
      name: "Molystar",
      formula: "",
      elements: { Mo: 8.0 },
    },
    {
      id: "kinglife-30-10-10",
      name: "Kinglife 30-10-10",
      formula: "",
      elements: { "N (NO3-)": 30.0, P: 10.0, K: 10.0 },
    },
    {
      id: "greenplant-vip-13-8-24-3",
      name: "Greenplant Vip 13-8-24+3",
      formula: "",
      elements: { "N (NO3-)": 13.0, P: 8.0, K: 24.0, Mg: 3.0 },
    },
    {
      id: "calfon-fruit",
      name: "Calfon Fruit",
      formula: "",
      elements: { Ca: 8.0, P: 10.0 },
    },
    {
      id: "magnesiogreen-attivato",
      name: "Magnesiogreen Attivato",
      formula: "",
      elements: { Mg: 15.0, S: 19.0 },
    },
    {
      id: "oligogreen",
      name: "Oligogreen",
      formula: "",
      elements: { Fe: 6.0, Mn: 2.0, Zn: 0.5, Cu: 0.5, B: 0.5, Mo: 0.02 },
    },
    {
      id: "daglas",
      name: "Daglas",
      formula: "",
      elements: { "N (NO3-)": 15.0, K: 15.0, S: 20.0 },
    },
    {
      id: "vyrer-plus",
      name: "Vyrer Plus",
      formula: "",
      elements: { "N (NO3-)": 20.0, Ca: 5.0, Mg: 2.0 },
    },
  ];

  // Filter substances based on search term
  useEffect(() => {
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

    // Check if searching for a brand name
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (
      lowerSearchTerm === "greenhas" ||
      lowerSearchTerm === "advanced" ||
      lowerSearchTerm === "advanced nutrients" ||
      lowerSearchTerm === "plant prod" ||
      lowerSearchTerm === "plant-prod" ||
      lowerSearchTerm === "plant-prod mj"
    ) {
      // Filter by brand name
      const filtered = searchDatabase.filter((substance) => {
        if ("brand" in substance) {
          const brand = (substance as PremiumSubstance).brand.toLowerCase();
          if (
            lowerSearchTerm === "advanced" ||
            lowerSearchTerm === "advanced nutrients"
          ) {
            return brand.includes("advanced");
          }
          if (
            lowerSearchTerm === "plant prod" ||
            lowerSearchTerm === "plant-prod" ||
            lowerSearchTerm === "plant-prod mj"
          ) {
            return brand.toLowerCase().includes("plant-prod");
          }
          return brand.includes(lowerSearchTerm);
        }
        return false;
      });
      setSearchResults(filtered);
      return;
    }

    // Regular search by substance name
    const filtered = searchDatabase.filter((substance) =>
      substance.name.toLowerCase().includes(lowerSearchTerm),
    );

    setSearchResults(filtered);
  }, [searchTerm, userCustomSubstances, premiumSubstances]);

  // Create a memoized filtered substances list to prevent infinite loops
  const filteredSubstances = React.useMemo(() => {
    return searchResults;
  }, [searchResults]);

  // Memoize defaultSubstanceDatabase to prevent it from causing re-renders
  const memoizedDefaultSubstanceDatabase = React.useMemo(
    () => defaultSubstanceDatabase,
    [],
  );

  // Effect to switch tabs when calculation type changes
  useEffect(() => {
    if (calculationType === "weights") {
      setActiveTab("substances");
    } else if (calculationType === "desired") {
      setActiveTab("targets");
    }
  }, [calculationType]);

  // Set default active tab to targets
  useEffect(() => {
    setActiveTab("targets");
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
    if (!customSubstanceName.trim()) {
      toast({
        title: "Error",
        description: "Substance name is required",
        variant: "destructive",
      });
      return;
    }

    // Convert any string values in customSubstanceElements to numbers
    const processedElements: Record<string, number> = {};
    Object.entries(customSubstanceElements).forEach(([key, value]) => {
      if (value !== undefined) {
        const numValue =
          typeof value === "string"
            ? parseFloat(value.toString().replace(/,/g, "."))
            : value;
        if (!isNaN(numValue)) {
          processedElements[key] = numValue;
        }
      }
    });

    try {
      // Check if user is logged in first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save custom substances",
          variant: "destructive",
        });
        return;
      }

      // First, ensure the user exists in the public.users table
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userData.user.id)
        .single();

      if (userCheckError || !userExists) {
        // User doesn't exist in the public.users table, create it
        const { error: createUserError } = await supabase.from("users").insert({
          id: userData.user.id,
          email: userData.user.email,
          username:
            userData.user.user_metadata?.username ||
            userData.user.email?.split("@")[0],
        });

        if (createUserError) {
          console.error("Error creating user record:", createUserError);
          throw new Error("Failed to create user record. Please try again.");
        }
      }

      const newSubstance: Substance = {
        id: editingSubstance ? editingSubstance.id : `custom-${Date.now()}`,
        name: customSubstanceName,
        formula: customSubstanceFormula || undefined,
        elements: processedElements,
      };

      // Convert to CustomSubstance format for database
      const substanceToSave = {
        name: newSubstance.name,
        formula: newSubstance.formula,
        elements: processedElements,
        user_id: userData.user.id, // Explicitly set user_id
      };

      let savedSubstance;

      if (editingSubstance) {
        // Update existing substance
        const { data, error } = await supabase
          .from("custom_substances")
          .update(substanceToSave)
          .eq("id", editingSubstance.id)
          .select()
          .single();

        if (error) throw error;
        savedSubstance = data;

        // Update in UI
        const updatedSelected = selectedSubstances.map((s) =>
          s.id === editingSubstance.id
            ? { ...newSubstance, id: data.id, weight: s.weight }
            : s,
        );
        setSelectedSubstances(updatedSelected);
      } else {
        // Insert new substance
        const { data, error } = await supabase
          .from("custom_substances")
          .insert(substanceToSave)
          .select()
          .single();

        if (error) throw error;
        savedSubstance = data;

        // Don't automatically add to selected substances
        // Just update the UI with the new substance in the database
      }

      // Refresh user substances
      loadUserSubstances();

      setCustomSubstanceDialogOpen(false);
      toast({
        title: "Success",
        description: "Substance saved successfully",
      });
    } catch (error: any) {
      console.error("Error saving substance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save substance",
        variant: "destructive",
      });
    }
  };

  const handleUpdateResultWeight = (
    substanceName: string,
    newWeightStr: string,
  ): void => {
    if (!results) return;

    // Replace any commas with periods for consistent decimal handling
    const cleanedWeightStr = newWeightStr.replace(/,/g, ".");
    const newWeight = parseFloat(cleanedWeightStr);

    if (isNaN(newWeight)) return;

    // Apply volume unit conversion if needed
    const volumeInLiters =
      volumeUnit === "gallons" ? solutionVolume * 3.78541 : solutionVolume;

    // Update substance weights
    const updatedSubstances = results.substances.map((substance: any) =>
      substance.name === substanceName
        ? {
            ...substance,
            weight: newWeight,
            volumePerLiter: newWeight / volumeInLiters,
          }
        : substance,
    );

    // Update the selected substances array with the new weight
    setSelectedSubstances(
      selectedSubstances.map((substance) =>
        substance.name === substanceName
          ? { ...substance, weight: newWeight }
          : substance,
      ),
    );

    // Find the substance in the database to get its composition
    const substanceToUpdate = selectedSubstances.find(
      (s) => s.name === substanceName,
    );
    if (!substanceToUpdate) return;

    // Initialize element concentrations with zeros
    const elementConcentrations: Record<string, number> = {};
    Object.keys(elements).forEach((element) => {
      elementConcentrations[element] = 0;
    });

    // Calculate actual element concentrations based on all substances
    selectedSubstances.forEach((substance) => {
      // Use the updated weight for the substance being changed
      const weight =
        substance.name === substanceName ? newWeight : substance.weight;
      if (weight <= 0) return;

      // For each element in the substance, add its contribution to the total
      Object.entries(substance.elements).forEach(
        ([elementName, percentage]) => {
          // Find the matching element in our elements object
          let matchingElement = null;

          // Handle different forms of nitrogen
          if (
            elementName === "N" &&
            Object.keys(elements).includes("N (NO3-)")
          ) {
            matchingElement = "N (NO3-)";
          } else if (
            elementName === "N" &&
            Object.keys(elements).includes("N (NH4+)")
          ) {
            matchingElement = "N (NH4+)";
          } else if (Object.keys(elements).includes(elementName)) {
            // Direct match
            matchingElement = elementName;
          }

          if (matchingElement) {
            // Calculate ppm contribution: (weight in g) * (percentage/100) * (1000 mg/g) / (volume in L)
            const ppmContribution =
              (weight * (percentage / 100) * 1000) / volumeInLiters;
            elementConcentrations[matchingElement] += ppmContribution;
          }
        },
      );
    });

    // Create updated element results array
    const updatedElements = Object.entries(elements).map(
      ([element, target]) => {
        const actual = elementConcentrations[element] || 0;

        // Apply conversions for oxide forms if needed - only for internal calculations
        let relatedElement = null;
        let relatedValue = 0;

        // Handle conversions between elemental and oxide forms
        if (element === "P" && elements["P"] > 0) {
          relatedValue = convertPtoP2O5(actual);
        } else if (element === "K" && elements["K"] > 0) {
          relatedValue = convertKtoK2O(actual);
        } else if (element === "Si" && elements["Si"] > 0) {
          relatedValue = convertSitoSiO2(actual);
        }

        return {
          element,
          target,
          actual,
          difference: actual - target,
          relatedElement,
          relatedValue,
        };
      },
    );

    // Recalculate EC value based on updated element concentrations
    const newEcValue = calculateECValue(updatedElements);

    const updatedResults = {
      substances: updatedSubstances,
      elements: updatedElements,
      ecValue: newEcValue,
    };

    setResults(updatedResults);
  };

  // Create a ref for the results section
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Conversion functions for P, K, and Si to their oxide forms
  // These conversion factors match HydroBuddy's implementation exactly
  const convertPtoP2O5 = (p: number): number => p * 2.2914; // P₂O₅ = P × 2.2914
  const convertKtoK2O = (k: number): number => k * 1.2046; // K₂O = K × 1.2046
  const convertSitoSiO2 = (si: number): number => si * 2.1392; // SiO₂ = Si × 2.1392

  // Inverse conversion functions
  const convertP2O5toP = (p2o5: number): number => p2o5 / 2.2914;
  const convertK2OtoK = (k2o: number): number => k2o / 1.2046;
  const convertSiO2toSi = (sio2: number): number => sio2 / 2.1392;

  // Function to calculate EC value based on nutrient concentrations
  const calculateECValue = (elementResults: any[]): string => {
    // More accurate EC calculation based on HydroBuddy approach
    // EC is proportional to the sum of all ionic concentrations with different weights
    // for different elements based on their ionic properties

    // Get sum of weighted element concentrations
    let weightedSum = 0;
    elementResults.forEach((result) => {
      const element = result.element;
      const concentration = result.actual;

      // Apply element-specific EC contribution factors
      // These factors match HydroBuddy's implementation more closely
      if (element === "N (NO3-)") weightedSum += concentration * 0.00175;
      else if (element === "N (NH4+)") weightedSum += concentration * 0.00236;
      else if (element === "P") weightedSum += concentration * 0.00195;
      else if (element === "K") weightedSum += concentration * 0.00256;
      else if (element === "Ca") weightedSum += concentration * 0.00244;
      else if (element === "Mg") weightedSum += concentration * 0.00486;
      else if (element === "S") weightedSum += concentration * 0.00208;
      else if (element === "Fe") weightedSum += concentration * 0.00054;
      else if (element === "Mn") weightedSum += concentration * 0.00055;
      else if (element === "B") weightedSum += concentration * 0.00093;
      else if (element === "Zn") weightedSum += concentration * 0.00047;
      else if (element === "Cu") weightedSum += concentration * 0.00047;
      else if (element === "Mo") weightedSum += concentration * 0.00031;
      else if (element === "Cl") weightedSum += concentration * 0.00282;
      else if (element === "Na") weightedSum += concentration * 0.00435;
      else if (element === "Si") weightedSum += concentration * 0.00071;
      else weightedSum += concentration * 0.001; // Default factor for other micronutrients
    });

    // Apply a correction factor to match typical EC values more closely
    // HydroBuddy uses a similar approach but with slightly different coefficients
    const ecValue = weightedSum * 1.0;
    return ecValue.toFixed(2);
  };

  const calculateNutrients = (): void => {
    // Apply volume unit conversion if needed
    const volumeInLiters =
      volumeUnit === "gallons" ? solutionVolume * 3.78541 : solutionVolume;

    // Calculate actual nutrient concentrations based on selected substances and their weights
    const substanceResults = selectedSubstances.map((substance) => ({
      name: substance.name,
      weight: substance.weight > 0 ? substance.weight : 0,
      volumePerLiter:
        substance.weight > 0 ? substance.weight / volumeInLiters : 0,
    }));

    // Initialize element concentrations with zeros
    const elementConcentrations: Record<string, number> = {};
    Object.keys(elements).forEach((element) => {
      elementConcentrations[element] = 0;
    });

    // Calculate actual element concentrations based on substance compositions
    selectedSubstances.forEach((substance) => {
      if (substance.weight <= 0) return;

      // For each element in the substance, add its contribution to the total
      Object.entries(substance.elements).forEach(
        ([elementName, percentage]) => {
          // Find the matching element in our elements object
          let matchingElement = null;

          // Handle different forms of nitrogen
          if (
            elementName === "N" &&
            Object.keys(elements).includes("N (NO3-)")
          ) {
            matchingElement = "N (NO3-)";
          } else if (
            elementName === "N" &&
            Object.keys(elements).includes("N (NH4+)")
          ) {
            matchingElement = "N (NH4+)";
          } else if (Object.keys(elements).includes(elementName)) {
            // Direct match
            matchingElement = elementName;
          }

          if (matchingElement) {
            // Calculate ppm contribution: (weight in g) * (percentage/100) * (1000 mg/g) / (volume in L)
            // This matches HydroBuddy's calculation method
            const ppmContribution =
              (substance.weight * (percentage / 100) * 1000) / volumeInLiters;
            elementConcentrations[matchingElement] += ppmContribution;
          }
        },
      );
    });

    // Create element results array
    const elementResults = Object.entries(elements).map(([element, target]) => {
      const actual = elementConcentrations[element] || 0;

      // Apply conversions for oxide forms if needed - only for internal calculations
      let relatedElement = null;
      let relatedValue = 0;

      // Handle conversions between elemental and oxide forms
      if (element === "P" && elements["P"] > 0) {
        relatedValue = convertPtoP2O5(actual);
      } else if (element === "K" && elements["K"] > 0) {
        relatedValue = convertKtoK2O(actual);
      } else if (element === "Si" && elements["Si"] > 0) {
        relatedValue = convertSitoSiO2(actual);
      }

      return {
        element,
        target,
        actual,
        difference: actual - target,
        relatedElement,
        relatedValue,
      };
    });

    // Calculate EC value
    const ecValue = calculateECValue(elementResults);

    const calculatedResults = {
      substances: substanceResults,
      elements: elementResults,
      ecValue: ecValue,
    };

    setResults(calculatedResults);

    // Scroll to results after a short delay to ensure the results are rendered
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto p-4 md:p-6">
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
                        // Auto-recalculate if results already exist
                        if (results && selectedSubstances.length > 0) {
                          setTimeout(() => calculateNutrients(), 100);
                        }
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
                        {filteredSubstances.map((substance) => (
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
                                    <Crown
                                      className="h-4 w-4 ml-1 text-amber-500"
                                      title="Premium Substance"
                                    />
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
                                {Object.entries(substance.elements).map(
                                  ([element, percentage]) => (
                                    <span
                                      key={element}
                                      className={`text-xs px-1.5 py-0.5 rounded-sm ${getElementColor(element)}`}
                                    >
                                      {element}: {percentage}%
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {selectedSubstances.some(
                                (s) => s.id === substance.id,
                              ) && (
                                <div className="w-8 h-8 flex items-center justify-center text-green-500">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  openCustomSubstanceDialog(substance)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
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

                              {/* Delete button for custom substances */}
                              {userCustomSubstances.some(
                                (s) => s.id === substance.id,
                              ) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => {
                                    // Open confirmation dialog
                                    if (
                                      confirm(
                                        `Are you sure you want to delete the custom substance "${substance.name}"?`,
                                      )
                                    ) {
                                      // Delete from database
                                      supabase
                                        .from("custom_substances")
                                        .delete()
                                        .eq("id", substance.id)
                                        .then(({ error }) => {
                                          if (error) {
                                            toast({
                                              title: "Error",
                                              description: `Failed to delete substance: ${error.message}`,
                                              variant: "destructive",
                                            });
                                          } else {
                                            // Remove from selected substances if it's there
                                            if (
                                              selectedSubstances.some(
                                                (s) => s.id === substance.id,
                                              )
                                            ) {
                                              handleRemoveSubstance(
                                                substance.id,
                                              );
                                            }
                                            // Remove from user custom substances
                                            setUserCustomSubstances((prev) => {
                                              return prev.filter(
                                                (s) => s.id !== substance.id,
                                              );
                                            });
                                            toast({
                                              title: "Success",
                                              description: `Substance "${substance.name}" deleted successfully`,
                                            });
                                          }
                                        });
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {filteredSubstances.length === 0 && (
                          <div className="py-8 text-center text-muted-foreground">
                            No substances found. Try a different search term.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
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
                                onChange={(e) => {
                                  // Allow typing decimal values without immediate conversion
                                  const value = e.target.value;
                                  // Update the UI immediately with the string value
                                  const updatedSubstances =
                                    results.substances.map((substance: any) =>
                                      substance.name === result.name
                                        ? { ...substance, weight: value }
                                        : substance,
                                    );
                                  setResults({
                                    ...results,
                                    substances: updatedSubstances,
                                  });
                                }}
                                onBlur={(e) =>
                                  handleUpdateResultWeight(
                                    result.name,
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-right"
                                inputMode="decimal"
                                step="any"
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
                              <React.Fragment key={index}>
                                <tr className="border-b last:border-0 text-sm">
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
                              </React.Fragment>
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
                        if (!results) return;

                        // Create CSV content
                        let csvContent = "data:text/csv;charset=utf-8,";

                        // Add substance weights
                        csvContent +=
                          "Substance Weights for " +
                          solutionVolume +
                          " " +
                          volumeUnit +
                          "\n";
                        csvContent +=
                          "Substance,Weight (" +
                          massUnit +
                          "),Per Unit (" +
                          massUnit +
                          "/" +
                          (volumeUnit === "liters" ? "L" : "gal") +
                          ")\n";

                        results.substances.forEach((substance: any) => {
                          csvContent += `"${substance.name}",${substance.weight.toFixed(2)},${substance.volumePerLiter.toFixed(2)}\n`;
                        });

                        // Add a blank line
                        csvContent += "\n";

                        // Add element concentrations
                        csvContent += "Element Concentrations\n";
                        csvContent +=
                          "Element,Target (ppm),Actual (ppm),Difference\n";

                        results.elements.forEach((element: any) => {
                          csvContent += `${element.element},${element.target.toFixed(2)},${element.actual.toFixed(2)},${element.difference.toFixed(2)}\n`;
                        });

                        // Add EC value
                        csvContent +=
                          "\nPredicted EC Value: " +
                          results.ecValue +
                          " mS/cm\n";

                        // Create download link
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "nutrient_recipe.csv");
                        document.body.appendChild(link);

                        // Trigger download
                        link.click();
                        document.body.removeChild(link);

                        toast({
                          title: "Export Complete",
                          description: "Recipe has been exported as CSV",
                        });
                      }}
                    >
                      Export Recipe (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (!results) return;

                        // Create text content for clipboard
                        let textContent = "";

                        // Add substance weights
                        textContent += `Substance Weights for ${solutionVolume} ${volumeUnit}\n`;
                        textContent +=
                          "---------------------------------------------\n";

                        results.substances.forEach((substance: any) => {
                          textContent += `${substance.name}: ${substance.weight.toFixed(2)} ${massUnit} (${substance.volumePerLiter.toFixed(2)} ${massUnit}/${volumeUnit === "liters" ? "L" : "gal"})\n`;
                        });

                        // Add a blank line
                        textContent += "\n";

                        // Add element concentrations
                        textContent += "Element Concentrations\n";
                        textContent +=
                          "---------------------------------------------\n";

                        results.elements.forEach((element: any) => {
                          const diffPrefix = element.difference > 0 ? "+" : "";
                          textContent += `${element.element}: Target ${element.target.toFixed(2)} ppm, Actual ${element.actual.toFixed(2)} ppm (${diffPrefix}${element.difference.toFixed(2)})\n`;
                        });

                        // Add EC value
                        textContent +=
                          "\nPredicted EC Value: " +
                          results.ecValue +
                          " mS/cm\n";

                        // Copy to clipboard
                        navigator.clipboard.writeText(textContent).then(
                          () => {
                            toast({
                              title: "Copied to Clipboard",
                              description:
                                "Recipe has been copied to clipboard",
                            });
                          },
                          (err) => {
                            console.error("Could not copy text: ", err);
                            toast({
                              title: "Error",
                              description: "Failed to copy to clipboard",
                              variant: "destructive",
                            });
                          },
                        );
                      }}
                    >
                      Copy Results
                    </Button>
                    <Button
                      className="flex-1 flex items-center gap-2"
                      onClick={() => {
                        if (!results) return;
                        setRecipeName("");
                        setRecipeDescription("");
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
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-10">
        <Button
          onClick={() => setSavedRecipesDialogOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground"
        >
          <BookOpen className="h-6 w-6" />
        </Button>
      </div>

      {/* Custom Substance Dialog */}
      <Dialog
        open={customSubstanceDialogOpen}
        onOpenChange={setCustomSubstanceDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSubstance ? "Edit Substance" : "Add Custom Substance"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="substance-name">Substance Name</Label>
                <Input
                  id="substance-name"
                  value={customSubstanceName}
                  onChange={(e) => setCustomSubstanceName(e.target.value)}
                  placeholder="e.g. Calcium Nitrate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="substance-formula">
                  Chemical Formula (optional)
                </Label>
                <Input
                  id="substance-formula"
                  value={customSubstanceFormula}
                  onChange={(e) => setCustomSubstanceFormula(e.target.value)}
                  placeholder="e.g. Ca(NO3)2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Element Percentages</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(elements).map((element) => (
                  <div key={element} className="space-y-1">
                    <Label
                      htmlFor={`element-${element}`}
                      className={`text-xs px-1.5 py-0.5 rounded-sm ${getElementColor(element)}`}
                    >
                      {element}
                    </Label>
                    <Input
                      id={`element-${element}`}
                      type="text"
                      value={
                        customSubstanceElements[element] !== undefined
                          ? customSubstanceElements[element].toString()
                          : ""
                      }
                      onChange={(e) => {
                        // Replace any commas with periods for consistent decimal handling
                        const cleanedValue = e.target.value.replace(/,/g, ".");
                        // Don't parse to float yet, just store the string value
                        setCustomSubstanceElements((prev) => ({
                          ...prev,
                          [element]:
                            cleanedValue === "" ? undefined : cleanedValue,
                        }));
                      }}
                      onBlur={(e) => {
                        // Parse to float when the field loses focus
                        const cleanedValue = e.target.value.replace(/,/g, ".");
                        const value = cleanedValue
                          ? parseFloat(cleanedValue)
                          : undefined;
                        setCustomSubstanceElements((prev) => ({
                          ...prev,
                          [element]: isNaN(value) ? undefined : value,
                        }));
                      }}
                      inputMode="decimal"
                      step="any"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <h4 className="text-sm font-medium mb-2">
                  Nutrient Forms Guide
                </h4>
                <div className="text-xs space-y-2">
                  <p>
                    <strong>Phosphorus:</strong> Use P for elemental phosphorus
                    or P₂O₅ for phosphorus pentoxide (fertilizer form)
                    <br />
                    <span className="text-muted-foreground">
                      P₂O₅ = P × 2.29 (multiply P by 2.29 to convert to P₂O₅)
                    </span>
                  </p>
                  <p>
                    <strong>Potassium:</strong> Use K for elemental potassium or
                    K₂O for potassium oxide (fertilizer form)
                    <br />
                    <span className="text-muted-foreground">
                      K₂O = K × 1.2 (multiply K by 1.2 to convert to K₂O)
                    </span>
                  </p>
                  <p>
                    <strong>Silicon:</strong> Use Si for bioavailable silicon or
                    SiO₂ for silicon dioxide
                    <br />
                    <span className="text-muted-foreground">
                      SiO₂ = Si × 2.14 (multiply Si by 2.14 to convert to SiO₂)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomSubstanceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCustomSubstance}>Save Substance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={async () => {
                if (!recipeName.trim() || !results) {
                  toast({
                    title: "Error",
                    description: "Please provide a name for your recipe",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  // Check if user is logged in
                  if (!user) {
                    toast({
                      title: "Authentication Required",
                      description: "Please sign in to save recipes",
                      variant: "destructive",
                    });
                    return;
                  }

                  const recipeData: NutrientRecipe = {
                    name: recipeName,
                    description: recipeDescription || undefined,
                    substances: results.substances,
                    elements: results.elements,
                    solution_volume: solutionVolume,
                    volume_unit: volumeUnit,
                    ec_value: parseFloat(results.ecValue) || undefined,
                  };

                  await saveNutrientRecipe(recipeData);
                  setSaveRecipeDialogOpen(false);
                  loadUserRecipes();
                  toast({
                    title: "Success",
                    description: "Recipe saved successfully",
                  });
                } catch (error: any) {
                  console.error("Error saving recipe:", error);
                  toast({
                    title: "Error",
                    description: error.message || "Failed to save recipe",
                    variant: "destructive",
                  });
                }
              }}
            >
              Save Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Recipes Dialog */}
      <Dialog
        open={savedRecipesDialogOpen}
        onOpenChange={setSavedRecipesDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Saved Nutrient Recipes
            </DialogTitle>
            <DialogDescription>
              Load or manage your saved nutrient solution recipes.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {loadingRecipes ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : savedRecipes.length > 0 ? (
              <div className="space-y-4">
                {savedRecipes.map((recipe) => (
                  <Card key={recipe.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(
                            recipe.created_at || "",
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground">
                          {recipe.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-sm">
                          <span className="font-medium">Volume:</span>{" "}
                          {recipe.solution_volume} {recipe.volume_unit}
                        </div>
                        {recipe.ec_value && (
                          <div className="text-sm">
                            <span className="font-medium">EC Value:</span>{" "}
                            {recipe.ec_value} mS/cm
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.substances
                          .slice(0, 3)
                          .map((substance, index) => (
                            <span
                              key={index}
                              className="text-xs bg-muted px-1.5 py-0.5 rounded-sm"
                            >
                              {substance.name}
                            </span>
                          ))}
                        {recipe.substances.length > 3 && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-sm">
                            +{recipe.substances.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Load recipe data into calculator
                            setCalculationType("weights");
                            setSolutionVolume(recipe.solution_volume);
                            setVolumeUnit(recipe.volume_unit);

                            // Set elements from recipe
                            const recipeElements: Record<string, number> = {};
                            recipe.elements.forEach((element: any) => {
                              recipeElements[element.element] = element.target;
                            });
                            setElements(recipeElements);

                            // Set substances from recipe
                            const substances = recipe.substances.map(
                              (substance: any) => {
                                // Find the substance in the database
                                const foundSubstance = [
                                  ...userCustomSubstances,
                                  ...memoizedDefaultSubstanceDatabase,
                                ].find((s) => s.name === substance.name);

                                if (foundSubstance) {
                                  return {
                                    ...foundSubstance,
                                    weight: substance.weight,
                                  };
                                }

                                // If not found, create a placeholder
                                return {
                                  id: `temp-${substance.name}`,
                                  name: substance.name,
                                  elements: {},
                                  weight: substance.weight,
                                };
                              },
                            );

                            setSelectedSubstances(substances);
                            setResults({
                              substances: recipe.substances,
                              elements: recipe.elements,
                              ecValue: recipe.ec_value || "0.00",
                            });

                            setSavedRecipesDialogOpen(false);
                            toast({
                              title: "Recipe Loaded",
                              description: `${recipe.name} has been loaded into the calculator`,
                            });

                            // Scroll to results after a short delay
                            setTimeout(() => {
                              if (resultsRef.current) {
                                resultsRef.current.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }
                            }, 100);
                          }}
                        >
                          <Bookmark className="h-4 w-4 mr-1" />
                          Load Recipe
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete the recipe "${recipe.name}"?`)) {
                              try {
                                await deleteNutrientRecipe(recipe.id!);
                                loadUserRecipes();
                                toast({
                                  title: "Success",
                                  description: `Recipe "${recipe.name}" deleted successfully`,
                                });
                              } catch (error: any) {
                                console.error("Error deleting recipe:", error);
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to delete recipe",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete