
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Substance } from "@/types/calculator";

interface CustomSubstanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  customSubstanceName: string;
  setCustomSubstanceName: (name: string) => void;
  customSubstanceFormula: string;
  setCustomSubstanceFormula: (formula: string) => void;
  customSubstanceElements: Record<string, number>;
  setCustomSubstanceElements: (elements: Record<string, number>) => void;
  editingSubstance: Substance | null;
}

const COMMON_ELEMENTS = [
  { value: "N (NO3-)", label: "N (NO3-)" },
  { value: "N (NH4+)", label: "N (NH4+)" },
  { value: "P", label: "P" },
  { value: "K", label: "K" },
  { value: "Mg", label: "Mg" },
  { value: "Ca", label: "Ca" },
  { value: "S", label: "S" },
  { value: "Fe", label: "Fe" },
  { value: "Mn", label: "Mn" },
  { value: "Zn", label: "Zn" },
  { value: "B", label: "B" },
  { value: "Cu", label: "Cu" },
  { value: "Si", label: "Si" },
  { value: "Mo", label: "Mo" },
  { value: "Na", label: "Na" },
  { value: "Cl", label: "Cl" },
];

const CustomSubstanceDialog: React.FC<CustomSubstanceDialogProps> = ({
  open,
  onClose,
  onSave,
  customSubstanceName,
  setCustomSubstanceName,
  customSubstanceFormula,
  setCustomSubstanceFormula,
  customSubstanceElements,
  setCustomSubstanceElements,
  editingSubstance,
}) => {
  const [newElement, setNewElement] = useState<string>("");

  const handleAddElement = () => {
    if (!newElement) {
      const randomElement = "Elemento-" + Object.keys(customSubstanceElements).length + 1;
      setCustomSubstanceElements({
        ...customSubstanceElements,
        [randomElement]: 0,
      });
    } else {
      setCustomSubstanceElements({
        ...customSubstanceElements,
        [newElement]: 0,
      });
      setNewElement("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingSubstance ? "Editar Substância" : "Adicionar Nova Substância"}
          </DialogTitle>
          <DialogDescription>
            Crie uma substância personalizada com seus próprios elementos e percentuais.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="substance-name">Nome da Substância</Label>
              <Input
                id="substance-name"
                value={customSubstanceName}
                onChange={(e) => setCustomSubstanceName(e.target.value)}
                placeholder="ex. Nitrato de Cálcio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="substance-formula">Fórmula Química (opcional)</Label>
              <Input
                id="substance-formula"
                value={customSubstanceFormula}
                onChange={(e) => setCustomSubstanceFormula(e.target.value)}
                placeholder="ex. Ca(NO3)2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Elementos e Percentuais</Label>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {Object.entries(customSubstanceElements).map(([element, percentage]) => (
                    <div key={element} className="flex items-center gap-2">
                      <Input
                        value={element}
                        onChange={(e) => {
                          const newElements = { ...customSubstanceElements };
                          delete newElements[element];
                          newElements[e.target.value] = percentage;
                          setCustomSubstanceElements(newElements);
                        }}
                        className="flex-1"
                        placeholder="Elemento (ex. N, P, K)"
                      />
                      <Input
                        type="number"
                        value={percentage}
                        onChange={(e) => {
                          setCustomSubstanceElements({
                            ...customSubstanceElements,
                            [element]: parseFloat(e.target.value) || 0,
                          });
                        }}
                        className="w-24"
                        placeholder="%"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-8 w-8 text-destructive"
                        onClick={() => {
                          const newElements = { ...customSubstanceElements };
                          delete newElements[element];
                          setCustomSubstanceElements(newElements);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 mt-3">
                    <Select value={newElement} onValueChange={setNewElement}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um elemento" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_ELEMENTS.map((element) => (
                          <SelectItem key={element.value} value={element.value}>
                            {element.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddElement}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            Salvar Substância
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomSubstanceDialog;
