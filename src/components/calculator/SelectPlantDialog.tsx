
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [plantName, setPlantName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleApplyRecipe = async () => {
    try {
      setLoading(true);

      // Check if plant name is empty
      if (!plantName.trim()) {
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

      // Save the plant and recipe data to Supabase
      // Instead of using a "plants" table that doesn't exist,
      // we'll save it to the nutrient_recipes table with a special indicator
      const { error } = await supabase.from("nutrient_recipes").insert([
        {
          user_id: user.id,
          name: `Planta: ${plantName}`,
          description: `Receita aplicada à planta: ${plantName}`,
          substances: currentRecipeData.substances,
          elements: currentRecipeData.elements,
          solution_volume: currentRecipeData.solutionVolume,
          volume_unit: currentRecipeData.volumeUnit,
          ec_value: parseFloat(currentRecipeData.ecValue || "0"),
        },
      ]);

      if (error) {
        console.error("Error saving plant data:", error);
        toast({
          title: "Erro",
          description: "Falha ao salvar os dados da planta.",
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
            Insira o nome da planta para aplicar a receita atual.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome da Planta
            </Label>
            <Input
              id="name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleApplyRecipe} disabled={loading}>
          {loading ? "Aplicando..." : "Aplicar Receita"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectPlantDialog;
