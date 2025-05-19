
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { SelectedSubstance } from "@/types/calculator";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Function to handle weight input changes with proper decimal handling
  const handleWeightChange = (id: string, inputValue: string) => {
    // First replace commas with dots for decimal values
    const value = inputValue.replace(/,/g, '.');
    
    // Handle special cases
    if (value === '' || value === '.') {
      handleUpdateWeight(id, 0);
      return;
    }
    
    // Parse the numeric value
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleUpdateWeight(id, numValue);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Substâncias Selecionadas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-4 py-2">
            {selectedSubstances.length > 0 ? (
              selectedSubstances.map((substance) => (
                <div
                  key={substance.id}
                  className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex-grow mb-2 md:mb-0 md:mr-4">
                    <p className="font-medium">{substance.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {substance.formula}
                    </p>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'w-full' : ''}`}>
                    <div className={`flex items-center ${isMobile ? 'flex-1' : 'w-32'}`}>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={substance.weight || ""}
                        onChange={(e) => handleWeightChange(substance.id, e.target.value)}
                        className="w-full"
                      />
                      <span className="ml-2 text-sm whitespace-nowrap">{massUnit}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2 p-0 w-10 h-10"
                      onClick={() => handleRemoveSubstance(substance.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma substância selecionada.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SelectedSubstancesPanel;
