
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SelectedSubstance } from "@/types/calculator";
import { toast } from "@/hooks/use-toast";
import { calculateNutrients } from "@/utils/calculatorUtils";

interface ActionButtonsProps {
  selectedSubstances: SelectedSubstance[];
  elements: Record<string, number>;
  solutionVolume: number;
  volumeUnit: string;
  setResults: (results: any) => void;
  resetValues: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedSubstances,
  elements,
  solutionVolume,
  volumeUnit,
  setResults,
  resetValues,
}) => {
  const isMobile = useIsMobile();

  const handleCalculateNutrients = () => {
    if (selectedSubstances.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma substância",
        variant: "destructive",
      });
      return;
    }

    const calculationResults = calculateNutrients(
      selectedSubstances,
      elements,
      solutionVolume,
      volumeUnit
    );
    
    setResults(calculationResults);
    
    toast({
      title: "Cálculo completo!",
      description: "Sua fórmula de nutrientes foi calculada.",
    });
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-center'} gap-4`}>
      <Button
        size="lg"
        className={`${isMobile ? 'w-full' : 'px-8'}`}
        onClick={handleCalculateNutrients}
        disabled={selectedSubstances.length === 0}
      >
        <Calculator className="mr-2 h-5 w-5" />
        Calcular Solução
      </Button>

      <Button
        size="lg"
        variant="outline"
        className={`${isMobile ? 'w-full' : 'px-8'}`}
        onClick={resetValues}
      >
        <X className="mr-2 h-5 w-5" />
        Limpar Tudo
      </Button>
    </div>
  );
};

export default ActionButtons;
