
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
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Set vegetative stage values
              const vegElements = {
                "N (NO3-)": 199,
                "N (NH4+)": 0,
                P: 62,
                K: 207,
                Ca: 242,
                Mg: 60,
                S: 132,
                Fe: 2.5,
                Mn: 0.55,
                Zn: 0.33,
                B: 0.44,
                Cu: 0.05,
                Mo: 0.06,
                Si: 0,
                Na: 0,
                Cl: 0,
              };

              Object.entries(vegElements).forEach(([element, value]) => {
                if (element in elements) {
                  handleUpdateElementTarget(element, value);
                }
              });

              toast({
                title: "Perfil Vegetativo Aplicado",
                description:
                  "Concentrações alvo definidas para fase vegetativa",
              });
            }}
          >
            Vegetativo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // Set flowering stage values
              const floweringElements = {
                "N (NO3-)": 149,
                "N (NH4+)": 0,
                P: 68,
                K: 331,
                Ca: 204,
                Mg: 93,
                S: 224,
                Fe: 2.8,
                Mn: 0.55,
                Zn: 0.33,
                B: 0.44,
                Cu: 0.05,
                Mo: 0.06,
                Si: 0,
                Na: 0,
                Cl: 0,
              };

              Object.entries(floweringElements).forEach(([element, value]) => {
                if (element in elements) {
                  handleUpdateElementTarget(element, value);
                }
              });

              toast({
                title: "Perfil de Floração Aplicado",
                description:
                  "Concentrações alvo definidas para fase de floração",
              });
            }}
          >
            Floração
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
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetElementsPanel;
