
import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { useCalculator } from '../contexts/CalculatorContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlants } from '../contexts/PlantContext';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Save, ChevronRight, Trash, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const BGC: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { plants } = usePlants();
  const { isDarkMode } = useTheme();
  const {
    inputs,
    results,
    savedRecipes,
    setInputs,
    calculateResults,
    saveRecipe,
    deleteRecipe,
    applyRecipeToPlant
  } = useCalculator();
  
  const [recipeName, setRecipeName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  
  const handleCalculate = () => {
    calculateResults();
    toast({
      title: "Cálculo completo",
      description: "Sua fórmula de nutrientes está pronta!",
    });
  };
  
  const handleSaveRecipe = () => {
    if (recipeName.trim()) {
      saveRecipe(recipeName);
      setRecipeName('');
      toast({
        title: "Receita salva",
        description: `"${recipeName}" foi adicionada às suas receitas salvas.`,
      });
    } else {
      toast({
        title: "Nome da receita necessário",
        description: "Por favor, insira um nome para sua receita.",
        variant: "destructive",
      });
    }
  };
  
  const handleApplyToPlant = () => {
    if (selectedPlant) {
      applyRecipeToPlant('current', selectedPlant);
      toast({
        title: "Receita aplicada",
        description: "Receita de nutrientes foi aplicada à sua planta.",
      });
    } else {
      toast({
        title: "Nenhuma planta selecionada",
        description: "Por favor, selecione uma planta para aplicar esta receita.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    toast({
      title: "Receita excluída",
      description: "A receita foi removida das suas receitas salvas.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            {t('calc.title')}
          </TabsTrigger>
          
          <TabsTrigger value="saved">
            <Save className="h-4 w-4 mr-2" />
            {t('calc.saveRecipe')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('calc.plantType')}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <RadioGroup 
                value={inputs.plantType} 
                onValueChange={(value) => setInputs({ plantType: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="herb" id="herb" />
                  <Label htmlFor="herb">Ervas</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetable" id="vegetable" />
                  <Label htmlFor="vegetable">Vegetais</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fruit" id="fruit" />
                  <Label htmlFor="fruit">Frutas</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('calc.growthPhase')}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <RadioGroup 
                value={inputs.growthPhase} 
                onValueChange={(value) => setInputs({ growthPhase: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seedling" id="seedling" />
                  <Label htmlFor="seedling">Mudas</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetative" id="vegetative" />
                  <Label htmlFor="vegetative">Vegetativa</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flowering" id="flowering" />
                  <Label htmlFor="flowering">Floração</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('calc.environment')}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <RadioGroup 
                value={inputs.environment} 
                onValueChange={(value) => setInputs({ environment: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="indoor" id="indoor" />
                  <Label htmlFor="indoor">{t('plant.indoor')}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outdoor" id="outdoor" />
                  <Label htmlFor="outdoor">{t('plant.outdoor')}</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('calc.waterQuality')}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Valor de pH ({inputs.waterQuality})</Label>
                  <span className="text-sm text-muted-foreground">{inputs.waterQuality}</span>
                </div>
                <Slider 
                  value={[inputs.waterQuality]} 
                  min={4} 
                  max={9} 
                  step={0.1}
                  onValueChange={(value) => setInputs({ waterQuality: value[0] })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Intensidade da luz (%)</Label>
                  <span className="text-sm text-muted-foreground">{inputs.lightIntensity}%</span>
                </div>
                <Slider 
                  value={[inputs.lightIntensity]} 
                  min={10} 
                  max={100} 
                  step={5}
                  onValueChange={(value) => setInputs({ lightIntensity: value[0] })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tamanho da planta (cm)</Label>
                  <span className="text-sm text-muted-foreground">{inputs.plantSize} cm</span>
                </div>
                <Slider 
                  value={[inputs.plantSize]} 
                  min={5} 
                  max={150} 
                  step={5}
                  onValueChange={(value) => setInputs({ plantSize: value[0] })}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tamanho do recipiente (L)</Label>
                  <span className="text-sm text-muted-foreground">{inputs.containerSize} L</span>
                </div>
                <Slider 
                  value={[inputs.containerSize]} 
                  min={1} 
                  max={50} 
                  step={1}
                  onValueChange={(value) => setInputs({ containerSize: value[0] })}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-plantgreen-600 hover:bg-plantgreen-700"
                onClick={handleCalculate}
              >
                {t('calc.calculate')}
              </Button>
            </CardFooter>
          </Card>
          
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>{t('calc.results')}</CardTitle>
                <CardDescription>{t('calc.recommended')}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Nutriente A</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientA} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Nutriente B</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientB} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Nutriente C</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientC} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">pH Alvo</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.ph}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Regas (vezes por semana)</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.wateringFrequency}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Luz (horas por dia)</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.lightHours}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Rendimento esperado</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.expectedYield}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Tempo de crescimento</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.growthTime}</div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <div className="w-full flex gap-2">
                  <Input 
                    placeholder="Nome da receita" 
                    value={recipeName} 
                    onChange={(e) => setRecipeName(e.target.value)}
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSaveRecipe} 
                    disabled={!recipeName.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('calc.saveRecipe')}
                  </Button>
                </div>
                
                {plants.length > 0 && (
                  <div className="w-full flex gap-2">
                    <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma planta" />
                      </SelectTrigger>
                      <SelectContent>
                        {plants.map(plant => (
                          <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleApplyToPlant}
                      disabled={!selectedPlant}
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {t('calc.applyToPlant')}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          {savedRecipes.length > 0 ? (
            <div className="space-y-4">
              {savedRecipes.map(recipe => (
                <Card key={recipe.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{recipe.name}</CardTitle>
                        <CardDescription>
                          {recipe.plantType}, {recipe.growthPhase}, {recipe.environment}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Nutriente A</div>
                        <div className="font-semibold">{recipe.nutrientA} ml/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Nutriente B</div>
                        <div className="font-semibold">{recipe.nutrientB} ml/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Nutriente C</div>
                        <div className="font-semibold">{recipe.nutrientC} ml/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">pH</div>
                        <div className="font-semibold">{recipe.ph}</div>
                      </div>
                    </div>
                    {plants.length > 0 && (
                      <div className="mt-4 pt-2 border-t flex gap-2">
                        <Select onValueChange={(plantId) => applyRecipeToPlant(recipe.id, plantId)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Aplicar à planta..." />
                          </SelectTrigger>
                          <SelectContent>
                            {plants.map(plant => (
                              <SelectItem key={plant.id} value={plant.id}>{plant.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const plantSelect = document.querySelector('select[name="plant"]') as HTMLSelectElement;
                            if (plantSelect && plantSelect.value) {
                              applyRecipeToPlant(recipe.id, plantSelect.value);
                              toast({
                                title: "Receita aplicada",
                                description: `Receita aplicada à planta selecionada`,
                              });
                            } else {
                              toast({
                                title: "Nenhuma planta selecionada",
                                description: "Por favor, selecione uma planta primeiro",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Aplicar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4">
                  <Save className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Sem Receitas Salvas</h3>
                <p className="text-muted-foreground text-center">
                  Calcule e salve receitas para visualizá-las aqui.
                </p>
                <Button
                  className="mt-4 bg-plantgreen-600 hover:bg-plantgreen-700"
                  onClick={() => document.querySelector('[value="calculator"]')?.dispatchEvent(new Event('click'))}
                >
                  Criar Receita
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BGC;
