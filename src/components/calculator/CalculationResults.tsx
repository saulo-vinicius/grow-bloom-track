
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SimpleUser, CalculationResult } from "@/types/calculator";

interface CalculationResultsProps {
  results: CalculationResult;
  openSaveDialog: () => void;
  massUnit: string;
  volumeUnit: string;
  getElementColor: (element: string) => string;
  solutionVolume: number;
  user: SimpleUser | null;
  handleSelectPlantDialog: () => void;
}

const CalculationResults: React.FC<CalculationResultsProps> = ({
  results,
  openSaveDialog,
  massUnit,
  volumeUnit,
  getElementColor,
  solutionVolume,
  user,
  handleSelectPlantDialog,
}) => {

  const handleCopyResults = () => {
    try {
      const header = `RECEITA DE NUTRIENTES\n`;
      const dateInfo = `Data: ${new Date().toLocaleDateString()}\n`;
      const volumeInfo = `Volume: ${solutionVolume} ${volumeUnit}\n\n`;
      
      // Substances info
      const substancesHeader = "SUBSTÂNCIAS:\n";
      const substancesData = results.substances.map((s: any) => 
        `${s.name}: ${s.weight} ${massUnit} (${s.volumePerLiter.toFixed(2)} ${massUnit}/L)`
      ).join('\n');
      
      // Elements info
      const elementsHeader = "\n\nELEMENTOS:\n";
      const elementsData = results.elements.map((e: any) => 
        `${e.element}: Alvo=${e.target.toFixed(2)} ppm, Atual=${e.actual.toFixed(2)} ppm, Diferença=${e.difference > 0 ? '+' : ''}${e.difference.toFixed(2)} ppm`
      ).join('\n');
      
      // EC value
      const ecValue = `\n\nEC Estimado: ${results.ecValue} mS/cm`;
      
      const fullText = header + dateInfo + volumeInfo + substancesHeader + substancesData + elementsHeader + elementsData + ecValue;
      
      navigator.clipboard.writeText(fullText);
      
      toast({
        title: "Copiado!",
        description: "Os resultados foram copiados para a área de transferência",
      });
    } catch (error) {
      console.error("Erro ao copiar resultados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar os resultados",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resultados do Cálculo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Substance Weights */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Pesos das Substâncias para {solutionVolume} {volumeUnit}
            </h3>
            <div className="space-y-2">
              {results.substances.map((result: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
                >
                  <span className="font-medium">{result.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24">
                      <Input
                        type="text"
                        value={result.weight.toString()}
                        className="h-8 text-right"
                        readOnly
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{massUnit}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.volumePerLiter.toFixed(2)} {massUnit}/
                        {volumeUnit === "liters" ? "L" : "gal"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Element Concentrations */}
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Concentrações de Elementos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left p-2">Elemento</th>
                    <th className="text-right p-2">Alvo (ppm)</th>
                    <th className="text-right p-2">Atual (ppm)</th>
                    <th className="text-right p-2">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {results.elements.map((result: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b last:border-0 text-sm"
                    >
                      <td className="p-2 font-medium">
                        <span
                          className={`px-2 py-1 rounded-sm ${getElementColor(
                            result.element
                          )}`}
                        >
                          {result.element}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        {result.target.toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        {result.actual.toFixed(2)}
                      </td>
                      <td
                        className={`p-2 text-right ${
                          Math.abs(result.difference) >
                          result.target * 0.1
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {result.difference > 0 ? "+" : ""}
                        {result.difference.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Predicted EC Value */}
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Valor EC Previsto:</span>
                <span className="text-lg font-bold">
                  {results.ecValue} mS/cm
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                A Condutividade Elétrica (EC) é uma estimativa baseada em
                nutrientes dissolvidos totais
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onClick={handleCopyResults}
            >
              <Copy className="h-4 w-4" />
              Copiar Resultados
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onClick={handleSelectPlantDialog}
            >
              Aplicar a uma Planta
            </Button>
            <Button
              className="flex-1 flex items-center gap-2"
              onClick={openSaveDialog}
              disabled={!user}
            >
              <Save className="h-4 w-4" />
              Salvar Receita
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationResults;
