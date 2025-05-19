
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface VolumeUnitSelectorProps {
  solutionVolume: number;
  setSolutionVolume: (volume: number) => void;
  volumeUnit: string;
  setVolumeUnit: (unit: string) => void;
  massUnit: string;
  setMassUnit: (unit: string) => void;
}

const VolumeUnitSelector: React.FC<VolumeUnitSelectorProps> = ({
  solutionVolume,
  setSolutionVolume,
  volumeUnit,
  setVolumeUnit,
  massUnit,
  setMassUnit,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="solution-volume">Volume da Solução</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="solution-volume"
                type="number"
                inputMode="decimal"
                value={solutionVolume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value) || 1;
                  setSolutionVolume(newVolume);
                }}
                min="0.1"
                step="0.1"
              />
              <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                <SelectTrigger className={isMobile ? "w-[80px]" : "w-[100px]"}>
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liters">Litros</SelectItem>
                  <SelectItem value="gallons">Galões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mass-unit">Unidades de Massa</Label>
            <Select value={massUnit} onValueChange={setMassUnit}>
              <SelectTrigger id="mass-unit" className="mt-2">
                <SelectValue placeholder="Selecione a unidade de massa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gramas (g)</SelectItem>
                <SelectItem value="mg">Miligramas (mg)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeUnitSelector;
