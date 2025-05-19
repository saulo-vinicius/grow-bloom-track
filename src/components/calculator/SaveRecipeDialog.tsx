
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isSaving, setIsSaving] = React.useState(false);
  const isMobile = useIsMobile();
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={isMobile ? "w-[95%] max-w-lg" : ""}>
        <DialogHeader>
          <DialogTitle>Salvar Receita</DialogTitle>
          <DialogDescription>
            Salve sua receita para uso futuro.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipe-name" className="text-right">
              Nome
            </Label>
            <Input
              id="recipe-name"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="col-span-3"
              placeholder="Nome da receita"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipe-description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="recipe-description"
              value={recipeDescription}
              onChange={(e) => setRecipeDescription(e.target.value)}
              className="col-span-3"
              placeholder="Descrição opcional da receita"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!recipeName || isSaving}>
            {isSaving ? "Salvando..." : "Salvar Receita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRecipeDialog;
