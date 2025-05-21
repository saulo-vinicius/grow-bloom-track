
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showMicronutrients, setShowMicronutrients] = useState(false);
  
  // Define which elements are macronutrients (always shown)
  const macronutrients = ["N (NO3-)", "N (NH4+)", "P", "K", "Mg", "Ca", "S"];
  
  // Function to handle input change with proper decimal handling
  const handleInputChange = (element: string, value: string) => {
    // Handle empty values
    if (!value || value === '.') {
      handleUpdateElementTarget(element, 0);
      return;
    }
    
    // Replace comma with period if present
    const normalizedValue = value.replace(/,/g, '.');
    
    // Make sure we have a valid number
    const numValue = parseFloat(normalizedValue);
    
    if (!isNaN(numValue)) {
      handleUpdateElementTarget(element, numValue);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Concentrações Alvo (ppm)
          </CardTitle>
          <div className="text-xs text-muted-foreground">Use . (ponto) para números decimais</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Always show macronutrients */}
          {Object.entries(elements)
            .filter(([element]) => macronutrients.includes(element))
            .map(([element, target]) => (
              <div key={element} className="space-y-1">
                <Label
                  htmlFor={`element-${element}`}
                  className={`text-sm font-medium px-2 py-1 rounded-sm ${getElementColor(element)}`}
                >
                  {element}
                </Label>
                <Input
                  id={`element-${element}`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={target === 0 ? "" : target.toString()}
                  onChange={(e) => handleInputChange(element, e.target.value)}
                  placeholder="ppm"
                />
              </div>
            ))}
        </div>
        
        {/* Toggle button for micronutrients */}
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => setShowMicronutrients(!showMicronutrients)}
        >
          {showMicronutrients ? (
            <span className="flex items-center">
              Ocultar Micronutrientes <ChevronUp className="ml-2 h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center">
              Exibir Micronutrientes <ChevronDown className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
        
        {/* Micronutrients section (collapsible) */}
        {showMicronutrients && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            {Object.entries(elements)
              .filter(([element]) => !macronutrients.includes(element))
              .map(([element, target]) => (
                <div key={element} className="space-y-1">
                  <Label
                    htmlFor={`element-${element}`}
                    className={`text-sm font-medium px-2 py-1 rounded-sm ${getElementColor(element)}`}
                  >
                    {element}
                  </Label>
                  <Input
                    id={`element-${element}`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*"
                    value={target === 0 ? "" : target.toString()}
                    onChange={(e) => handleInputChange(element, e.target.value)}
                    placeholder="ppm"
                  />
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TargetElementsPanel;
