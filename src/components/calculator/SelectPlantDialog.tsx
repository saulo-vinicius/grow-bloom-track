
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlants } from "@/contexts/PlantContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleUser } from "@/types/calculator";
import { useAuth } from "@/contexts/AuthContext";

interface SelectPlantDialogProps {
  open: boolean;
  onClose: () => void;
  currentRecipeData: any; // Replace 'any' with a more specific type if possible
}

const SelectPlantDialog: React.FC<SelectPlantDialogProps> = ({
  open,
  onClose,
  currentRecipeData,
}) => {
  const { plants, addPlant, addPlantStat, MAX_FREE_USER_PLANTS } = usePlants();
  const { user } = useAuth();
  const [plantName, setPlantName] = useState<string>("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [isNewPlant, setIsNewPlant] = useState<boolean>(plants.length === 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPlantName("");
      setSelectedPlantId(plants.length > 0 ? plants[0].id : "");
      setIsNewPlant(plants.length === 0);
    }
  }, [open, plants]);

  const handleApplyRecipe = async () => {
    try {
      setLoading(true);

      // Check if user is trying to create a new plant but didn't enter a name
      if (isNewPlant && !plantName.trim()) {
        toast({
          title: "Erro",
          description: "Por favor, insira o nome da planta.",
          variant: "destructive",
        });
        return;
      }

      // Check if currentRecipeData is null
      if (!currentRecipeData) {
        toast({
          title: "Erro",
          description: "Não há receita para aplicar.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      // Check if the user is a free user and trying to add more than the allowed plants
      if (!user.isPremium && isNewPlant && plants.length >= MAX_FREE_USER_PLANTS) {
        toast({
          title: "Limite de plantas atingido",
          description: `Usuários gratuitos podem adicionar apenas ${MAX_FREE_USER_PLANTS} plantas. Atualize para premium para adicionar mais plantas.`,
          variant: "destructive",
        });
        return;
      }

      if (isNewPlant) {
        // Create a new plant
        const newPlant = {
          name: plantName,
          species: "Não especificada",
          location: "indoor" as const,
          imageUrl: "/placeholder.svg",
          addedOn: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          stats: [],
          growthPhase: "Vegetativa",
        };
        
        await addPlant(newPlant);
        
        // Wait a moment for the plant to be added
        setTimeout(async () => {
          // Get the newly created plant (should be the first one with this name)
          const newlyAddedPlant = plants.find(p => p.name === plantName);
          
          if (newlyAddedPlant) {
            // Add the recipe as a stat to this plant
            await addPlantStat(newlyAddedPlant.id, {
              temperature: 24,
              humidity: 65,
              ppm: 800,
              notes: `Receita aplicada: ${currentRecipeData.name || "Sem nome"}`,
              recipeApplied: {
                type: "nutrient",
                name: currentRecipeData.name || "Receita sem nome",
                description: currentRecipeData.description || "",
                data: currentRecipeData
              }
            });
            
            toast({
              title: "Sucesso",
              description: "Receita aplicada à nova planta com sucesso!",
            });
          } else {
            throw new Error("Falha ao encontrar a planta recém-criada");
          }
        }, 500);
      } else {
        // Add recipe to existing plant
        await addPlantStat(selectedPlantId, {
          temperature: 24,
          humidity: 65,
          ppm: 800,
          notes: `Receita aplicada: ${currentRecipeData.name || "Sem nome"}`,
          recipeApplied: {
            type: "nutrient",
            name: currentRecipeData.name || "Receita sem nome",
            description: currentRecipeData.description || "",
            data: currentRecipeData
          }
        });
        
        toast({
          title: "Sucesso",
          description: "Receita aplicada à planta existente com sucesso!",
        });
      }

      // Try to save the recipe data to Supabase nutrient_recipes table
      try {
        const { error } = await supabase.from("nutrient_recipes").insert([
          {
            user_id: user.id,
            name: `Planta: ${isNewPlant ? plantName : plants.find(p => p.id === selectedPlantId)?.name}`,
            description: `Receita aplicada à planta: ${isNewPlant ? plantName : plants.find(p => p.id === selectedPlantId)?.name}`,
            substances: currentRecipeData.substances || [],
            elements: currentRecipeData.elements || [],
            solution_volume: currentRecipeData.solutionVolume || 1,
            volume_unit: currentRecipeData.volumeUnit || "liters",
            ec_value: parseFloat(currentRecipeData.ecValue || "0"),
          },
        ]);

        if (error) {
          console.warn("Error saving plant recipe data to Supabase:", error);
          // Don't throw here, we don't want to stop the flow if this fails
        }
      } catch (dbError) {
        console.warn("Database error when saving recipe:", dbError);
        // Don't throw here, we don't want to stop the flow if this fails
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error applying recipe to plant:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao aplicar receita à planta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aplicar Receita à Planta</DialogTitle>
          <DialogDescription>
            {plants.length > 0 
              ? "Selecione uma planta existente ou crie uma nova" 
              : "Insira o nome da planta para aplicar a receita atual"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {plants.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plantOption" className="text-right">
                Opção
              </Label>
              <div className="col-span-3">
                <Select 
                  value={isNewPlant ? "new" : "existing"} 
                  onValueChange={(value) => setIsNewPlant(value === "new")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">Usar planta existente</SelectItem>
                    <SelectItem value="new">Criar nova planta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isNewPlant ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome da Nova Planta
              </Label>
              <Input
                id="name"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className="col-span-3"
              />
            </div>
          ) : plants.length > 0 ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="existingPlant" className="text-right">
                Planta Existente
              </Label>
              <div className="col-span-3">
                <Select 
                  value={selectedPlantId} 
                  onValueChange={setSelectedPlantId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma planta" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
        <Button onClick={handleApplyRecipe} disabled={loading}>
          {loading ? "Aplicando..." : "Aplicar Receita"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlantDialog;
