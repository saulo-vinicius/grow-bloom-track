
import React, { useState } from "react";
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
  const { plants, addPlant, addPlantStat } = usePlants();
  const [plantName, setPlantName] = useState<string>("");
  const [selectedPlantId, setSelectedPlantId] = useState<string>("");
  const [isNewPlant, setIsNewPlant] = useState<boolean>(plants.length === 0);
  const [loading, setLoading] = useState<boolean>(false);

  // Reset state when dialog opens
  React.useEffect(() => {
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

      // Get the user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      if (isNewPlant) {
        // Create a new plant
        await addPlant({
          name: plantName,
          species: "Não especificada",
          location: "indoor",
          imageUrl: "/placeholder.svg",
          addedOn: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          stats: [],
          growthPhase: "Vegetativa",
        });

        // Get the newly created plant's ID (it would be the first one after sorting by addedOn)
        const newPlants = [...plants].sort((a, b) => 
          new Date(b.addedOn).getTime() - new Date(a.addedOn).getTime()
        );
        
        if (newPlants.length > 0) {
          // Add the recipe as a stat to this plant
          await addPlantStat(newPlants[0].id, {
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
        }
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
      }
      
      // Save the recipe data to Supabase nutrient_recipes table as well
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
        console.error("Error saving plant recipe data:", error);
        toast({
          title: "Erro",
          description: "Falha ao salvar os dados da receita.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Receita aplicada à planta com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error("Error applying recipe to plant:", error);
      toast({
        title: "Erro",
        description: "Falha ao aplicar receita à planta.",
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
