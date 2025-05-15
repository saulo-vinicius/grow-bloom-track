
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlants, Plant } from "@/contexts/PlantContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface SelectPlantDialogProps {
  open: boolean;
  onClose: () => void;
  currentRecipeData: any | null;
}

const SelectPlantDialog: React.FC<SelectPlantDialogProps> = ({
  open,
  onClose,
  currentRecipeData,
}) => {
  const { plants, loading, error, addPlantStat } = usePlants();
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  
  const handleApplyToPlant = async () => {
    if (!selectedPlantId || !currentRecipeData) {
      toast({
        title: "Erro",
        description: "Selecione uma planta primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      const recipeDetails = {
        type: "nutrient_recipe",
        name: currentRecipeData.name || "Receita sem nome",
        description: `EC: ${currentRecipeData.ecValue} mS/cm, Volume: ${currentRecipeData.solutionVolume} ${currentRecipeData.volumeUnit}`,
        data: currentRecipeData
      };

      await addPlantStat(selectedPlantId, {
        temperature: 0,  // Valores padrão
        humidity: 0,
        ppm: parseFloat(currentRecipeData.ecValue) * 700 || 0,  // Conversão aproximada de EC para PPM
        notes: `Receita aplicada: ${recipeDetails.name}`,
        recipeApplied: recipeDetails
      });

      toast({
        title: "Sucesso!",
        description: "Receita aplicada à planta com sucesso"
      });

      onClose();
    } catch (error) {
      console.error("Erro ao aplicar receita à planta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aplicar a receita à planta",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Aplicar Receita a uma Planta</DialogTitle>
          <DialogDescription>
            Selecione a planta que receberá esta solução de nutrientes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="text-center py-8">Carregando plantas...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">Erro ao carregar plantas: {error}</div>
          ) : plants.length > 0 ? (
            <ScrollArea className="h-[350px]">
              <div className="grid gap-3">
                {plants.map((plant) => (
                  <Card 
                    key={plant.id} 
                    className={`cursor-pointer transition-colors hover:bg-accent ${selectedPlantId === plant.id ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedPlantId(plant.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {plant.imageUrl ? (
                            <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">{plant.name.charAt(0)}</span>
                          )}
                        </div>
                        {plant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-sm text-muted-foreground">
                        <p>Espécie: {plant.species}</p>
                        <p>Fase: {plant.growthPhase}</p>
                        <p>Localização: {plant.location === 'indoor' ? 'Ambiente Interno' : 'Ambiente Externo'}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8">
              <p>Você não tem plantas registradas.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione plantas primeiro na seção "Minhas Plantas".
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApplyToPlant} disabled={!selectedPlantId}>
            Aplicar Receita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlantDialog;
