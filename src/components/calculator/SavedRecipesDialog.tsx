
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Beaker, Trash2 } from "lucide-react";
import { NutrientRecipe } from "@/lib/recipes";

interface SavedRecipesDialogProps {
  open: boolean;
  onClose: () => void;
  savedRecipes: NutrientRecipe[];
  handleLoadRecipe: (recipe: NutrientRecipe) => void;
  handleDeleteRecipe: (id: string) => void;
  loadingRecipes: boolean;
}

const SavedRecipesDialog: React.FC<SavedRecipesDialogProps> = ({
  open,
  onClose,
  savedRecipes,
  handleLoadRecipe,
  handleDeleteRecipe,
  loadingRecipes,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
                        <CardTitle className="text-base">
                          {recipe.name}
                        </CardTitle>
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
                          Volume: {recipe.solution_volume}{" "}
                          {recipe.volume_unit}
                        </div>
                        <div className="text-xs bg-primary/10 rounded px-2 py-1">
                          EC: {recipe.ec_value || "N/A"} mS/cm
                        </div>
                        <div className="text-xs bg-primary/10 rounded px-2 py-1">
                          Data:{" "}
                          {new Date(recipe.created_at!).toLocaleDateString()}
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
                Calcule uma receita e clique em "Salvar Receita" para
                começar.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavedRecipesDialog;
