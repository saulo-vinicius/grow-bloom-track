
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { vegetativeElements, bloomElements, resetElements } from "@/utils/calculatorConstants";

interface GrowthPhaseSelectorProps {
  activePhase: string;
  setActivePhase: (phase: string) => void;
  setElements: (elements: Record<string, number>) => void;
  setSelectedSubstances: (substances: any[]) => void;
  setResults: (results: any | null) => void;
}

const GrowthPhaseSelector: React.FC<GrowthPhaseSelectorProps> = ({
  activePhase,
  setActivePhase,
  setElements,
  setSelectedSubstances,
  setResults,
}) => {
  const setVegetativeValues = () => {
    setActivePhase("vegetative");
    setElements(vegetativeElements);
    toast({
      title: "Valores atualizados",
      description: "Valores para fase vegetativa aplicados",
    });
  };

  const setBloomValues = () => {
    setActivePhase("bloom");
    setElements(bloomElements);
    toast({
      title: "Valores atualizados",
      description: "Valores para fase de floração aplicados",
    });
  };

  const resetValues = () => {
    setActivePhase("none");
    setElements(resetElements);
    setSelectedSubstances([]);
    setResults(null);
    toast({
      title: "Valores resetados",
      description: "Todos os valores foram zerados",
    });
  };

  return (
    <div className="flex flex-wrap justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={setVegetativeValues} 
          variant={activePhase === "vegetative" ? "default" : "outline"}
          className={`flex items-center gap-1 ${activePhase === "vegetative" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          Vegetativo
        </Button>
        <Button 
          onClick={setBloomValues} 
          variant={activePhase === "bloom" ? "default" : "outline"}
          className={`flex items-center gap-1 ${activePhase === "bloom" ? "bg-purple-600 hover:bg-purple-700" : ""}`}
        >
          Floração
        </Button>
      </div>
    </div>
  );
};

export default GrowthPhaseSelector;
