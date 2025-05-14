
import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { useCalculator } from '../contexts/CalculatorContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlants } from '../contexts/PlantContext';
import { toast } from "@/hooks/use-toast";  // Updated import path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calculator, Lock, Save, ChevronRight, Trash, Check } from 'lucide-react';
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
    isPremiumCalculation,
    setInputs,
    calculateResults,
    saveRecipe,
    deleteRecipe,
    applyRecipeToPlant
  } = useCalculator();
  
  const [recipeName, setRecipeName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  
  const handleCalculate = () => {
    calculateResults();
    if (isPremiumCalculation && !user?.isPremium) {
      setShowPremiumDialog(true);
    } else {
      toast({
        title: "Calculation complete",
        description: "Your nutrient formula is ready!",
      });
    }
  };
  
  const handleSaveRecipe = () => {
    if (!user?.isPremium && isPremiumCalculation) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (recipeName.trim()) {
      saveRecipe(recipeName);
      setRecipeName('');
      toast({
        title: "Recipe saved",
        description: `"${recipeName}" has been added to your saved recipes.`,
      });
    } else {
      toast({
        title: "Recipe name required",
        description: "Please enter a name for your recipe.",
        variant: "destructive",
      });
    }
  };
  
  const handleApplyToPlant = () => {
    if (!user?.isPremium && isPremiumCalculation) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (selectedPlant) {
      applyRecipeToPlant('current', selectedPlant);
      toast({
        title: "Recipe applied",
        description: "Nutrient recipe has been applied to your plant.",
      });
    } else {
      toast({
        title: "No plant selected",
        description: "Please select a plant to apply this recipe.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteRecipe = (id: string) => {
    deleteRecipe(id);
    toast({
      title: "Recipe deleted",
      description: "The recipe has been removed from your saved recipes.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('calc.title')}</h1>
        <p className="text-muted-foreground">{t('calc.description')}</p>
      </div>
      
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
                  <Label htmlFor="herb">Herbs</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetable" id="vegetable" />
                  <Label htmlFor="vegetable">Vegetables</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fruit" id="fruit" />
                  <Label htmlFor="fruit">Fruits</Label>
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
                  <Label htmlFor="seedling">Seedling</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vegetative" id="vegetative" />
                  <Label htmlFor="vegetative">Vegetative</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flowering" id="flowering" />
                  <Label htmlFor="flowering">Flowering</Label>
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
                  <Label>pH Value ({inputs.waterQuality})</Label>
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
                  <Label>Light Intensity (%)</Label>
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
                  <Label>Plant Size (cm)</Label>
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
                  <Label>Container Size (L)</Label>
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
            <Card className={`${isPremiumCalculation && !user?.isPremium ? 'relative overflow-hidden' : ''}`}>
              <CardHeader>
                <CardTitle>{t('calc.results')}</CardTitle>
                <CardDescription>{t('calc.recommended')}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Blur overlay for premium calculations */}
                {isPremiumCalculation && !user?.isPremium && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
                    <Lock className="h-12 w-12 text-plantgreen-600 mb-2" />
                    <h3 className="text-lg font-semibold text-center">{t('premium.title')}</h3>
                    <p className="text-center text-muted-foreground mb-4">{t('premium.subtitle')}</p>
                    <Button 
                      className="bg-plantgreen-600 hover:bg-plantgreen-700"
                      onClick={() => setShowPremiumDialog(true)}
                    >
                      {t('premium.upgrade')}
                    </Button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Nutrient A</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientA} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Nutrient B</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientB} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Nutrient C</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.nutrientC} ml/L</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Target pH</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.ph}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Watering (times per week)</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.wateringFrequency}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Light (hours per day)</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.lightHours}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Expected Yield</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.expectedYield}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Growth Time</Label>
                    <div className="text-plantgreen-600 font-semibold text-lg">{results.growthTime}</div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-3">
                <div className="w-full flex gap-2">
                  <Input 
                    placeholder="Recipe name" 
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
                        <SelectValue placeholder="Select a plant" />
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
                        <div className="text-xs text-muted-foreground">Nutrient A</div>
                        <div className="font-semibold">{recipe.nutrientA} ml/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Nutrient B</div>
                        <div className="font-semibold">{recipe.nutrientB} ml/L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Nutrient C</div>
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
                            <SelectValue placeholder="Apply to plant..." />
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
                                title: "Recipe applied",
                                description: `Recipe applied to selected plant`,
                              });
                            } else {
                              toast({
                                title: "No plant selected",
                                description: "Please select a plant first",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Apply
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
                <h3 className="text-lg font-semibold">No Saved Recipes</h3>
                <p className="text-muted-foreground text-center">
                  Calculate and save recipes to view them here.
                </p>
                <Button
                  className="mt-4 bg-plantgreen-600 hover:bg-plantgreen-700"
                  onClick={() => document.querySelector('[value="calculator"]')?.dispatchEvent(new Event('click'))}
                >
                  Create Recipe
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Premium Upgrade Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('premium.title')}</DialogTitle>
            <DialogDescription>{t('premium.subtitle')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-plantgreen-600" />
              </div>
              <span>{t('premium.feature1')}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-plantgreen-600" />
              </div>
              <span>{t('premium.feature2')}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-plantgreen-600" />
              </div>
              <span>{t('premium.feature3')}</span>
            </div>
            
            <div className="text-center mt-6">
              <div className="text-3xl font-bold text-plantgreen-600">{t('premium.price')}</div>
              <div className="text-sm text-muted-foreground">{t('premium.perMonth')}</div>
            </div>
          </div>
          
          <Button className="w-full bg-plantgreen-600 hover:bg-plantgreen-700">
            {t('premium.upgrade')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BGC;
