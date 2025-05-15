
import React, { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, User, Search } from "lucide-react";
import { PremiumSubstance } from "@/lib/premium-substances";
import { Substance, SelectedSubstance } from "@/types/calculator";

interface SubstancesPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredSubstances: (Substance | PremiumSubstance)[];
  selectedSubstances: SelectedSubstance[];
  handleAddSubstance: (substance: Substance) => void;
  handleRemoveSubstance: (id: string) => void;
  openCustomSubstanceDialog: (substance?: Substance) => void;
  userCustomSubstances: Substance[];
  getElementColor: (element: string) => string;
}

const SubstancesPanel: React.FC<SubstancesPanelProps> = ({
  searchTerm,
  setSearchTerm,
  filteredSubstances,
  selectedSubstances,
  handleAddSubstance,
  handleRemoveSubstance,
  openCustomSubstanceDialog,
  userCustomSubstances,
  getElementColor,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Banco de Dados de Substâncias
          </CardTitle>
          <Button
            size="sm"
            onClick={() => openCustomSubstanceDialog()}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Adicionar Personalizada
          </Button>
        </div>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar substâncias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-4 py-2">
            {filteredSubstances.length > 0 ? (
              filteredSubstances.map((substance) => (
                <div
                  key={substance.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {userCustomSubstances.some(
                          (s) => s.id === substance.id
                        ) && (
                          <span className="mr-1" title="Custom Substance">
                            <User className="h-4 w-4 text-orange-500" />
                          </span>
                        )}
                        <p className="font-medium">{substance.name}</p>
                      </div>
                      {"premium" in substance && substance.premium && (
                        <span className="ml-1 text-amber-500 font-medium text-xs">
                          (Premium)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {substance.formula}
                      {"brand" in substance && (
                        <span className="ml-2 px-1.5 py-0.5 bg-primary/10 rounded-sm">
                          {substance.brand}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(substance.elements)
                        .slice(0, 3)
                        .map(([element, percentage]) => (
                          <span
                            key={element}
                            className={`text-xs px-1.5 py-0.5 rounded-sm ${getElementColor(
                              element
                            )}`}
                          >
                            {element}: {percentage}%
                          </span>
                        ))}
                      {Object.entries(substance.elements).length > 3 && (
                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                          +{Object.entries(substance.elements).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedSubstances.some((s) => s.id === substance.id) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveSubstance(substance.id)}
                      >
                        <div className="h-4 w-4">×</div>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleAddSubstance(substance)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma substância encontrada. Tente um termo de busca
                diferente.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SubstancesPanel;
