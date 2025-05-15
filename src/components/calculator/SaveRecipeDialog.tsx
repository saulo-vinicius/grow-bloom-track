
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SaveRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  recipeName: string;
  setRecipeName: (name: string) => void;
  recipeDescription: string;
  setRecipeDescription: (description: string) => void;
}

const SaveRecipeDialog: React.FC<SaveRecipeDialogProps> = ({
  open,
  onClose,
  onSave,
  recipeName,
  setRecipeName,
  recipeDescription,
  setRecipeDescription,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar Receita</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRecipeDialog;
