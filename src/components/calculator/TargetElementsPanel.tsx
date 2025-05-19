
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface TargetElementsPanelProps {
  elements: Record<string, number>;
  handleUpdateElementTarget: (element: string, value: number) => void;
  getElementColor: (element: string) => string;
}

const TargetElementsPanel: React.FC<TargetElementsPanelProps> = ({
  elements,
  handleUpdateElementTarget,
  getElementColor,
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Concentrações Alvo (ppm)
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
                {} as Record<string, number>
              );

              Object.keys(clearedElements).forEach(element => {
                handleUpdateElementTarget(element, 0);
              });

              toast({
                title: "Limpeza Completa",
                description: "Todas as concentrações alvo foram limpas",
              });
            }}
          >
            Limpar Valores
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
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="ppm"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetElementsPanel;
