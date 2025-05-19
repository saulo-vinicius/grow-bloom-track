
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { SelectedSubstance } from "@/types/calculator";

interface SelectedSubstancesPanelProps {
  selectedSubstances: SelectedSubstance[];
  handleUpdateWeight: (id: string, weight: number) => void;
  handleRemoveSubstance: (id: string) => void;
  massUnit: string;
}

const SelectedSubstancesPanel: React.FC<SelectedSubstancesPanelProps> = ({
  selectedSubstances,
  handleUpdateWeight,
  handleRemoveSubstance,
  massUnit,
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Substâncias Selecionadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedSubstances.length > 0 ? (
            selectedSubstances.map((substance) => (
              <div
                key={substance.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium">{substance.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {substance.formula}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={substance.weight}
                    onChange={(e) =>
                      handleUpdateWeight(
                        substance.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
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
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma substância selecionada. Adicione substâncias do banco de dados.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedSubstancesPanel;
