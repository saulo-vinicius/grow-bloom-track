
import React, { useState } from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { useAdvancedCalculator } from '../contexts/AdvancedCalculatorContext';
import { Substance, SubstanceInput } from '../models/Calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calculator, Plus, Minus, AlertTriangle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdvancedCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    inputs,
    results,
    substances,
    customSubstances,
    isPremiumCalculation,
    loading,
    setInputs,
    calculateResults,
    addSubstance,
    removeSubstance,
    updateSubstance
  } = useAdvancedCalculator();

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomSubstance, setNewCustomSubstance] = useState<Partial<Substance>>({
    name: '',
    category: 'supplement',
    density: 1.0,
  });

  const allSubstances = [...substances, ...customSubstances];
  
  const handleAddSubstance = () => {
    // Find a default substance
    const defaultSubstance = substances[0];
    if (!defaultSubstance) return;
    
    addSubstance({
      substanceId: defaultSubstance.id,
      substanceName: defaultSubstance.name,
      targetPPM: 500,
    });
  };
  
  const handleCalculate = () => {
    calculateResults();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('calc.solution')}</CardTitle>
          <CardDescription>{t('calc.solutionDesc')}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t('calc.volume')} (L)</Label>
                <span className="text-sm text-muted-foreground">{inputs.solutionVolume} L</span>
              </div>
              <Slider 
                value={[inputs.solutionVolume]} 
                min={1} 
                max={100} 
                step={1}
                onValueChange={(value) => setInputs({ solutionVolume: value[0] })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('calc.substances')}</CardTitle>
            <CardDescription>{t('calc.substancesDesc')}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddSubstance}
            disabled={inputs.substances.length >= 3 && !user?.isPremium}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('calc.addSubstance')}
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {inputs.substances.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              {t('calc.noSubstances')}
            </div>
          )}
          
          {inputs.substances.length > 2 && !user?.isPremium && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{t('premium.maxSubstances')}</span>
            </div>
          )}
          
          {inputs.substances.map((substance, index) => (
            <Card key={index}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <Select 
                  value={substance.substanceId} 
                  onValueChange={(value) => {
                    const selectedSubstance = allSubstances.find(s => s.id === value);
                    if (selectedSubstance) {
                      updateSubstance(index, {
                        substanceId: value,
                        substanceName: selectedSubstance.name
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select substance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={substance.substanceId} disabled>
                      {substance.substanceName}
                    </SelectItem>
                    <Separator className="my-1" />
                    
                    {/* Default substances */}
                    <div className="font-semibold px-2 py-1 text-xs text-muted-foreground">
                      Default Substances
                    </div>
                    {substances.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                    
                    {/* Custom substances */}
                    {customSubstances.length > 0 && (
                      <>
                        <Separator className="my-1" />
                        <div className="font-semibold px-2 py-1 text-xs text-muted-foreground">
                          Custom Substances
                        </div>
                        {customSubstances.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeSubstance(substance.substanceId)}
                  disabled={inputs.substances.length <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Target PPM</Label>
                    <span className="text-sm text-muted-foreground">{substance.targetPPM} ppm</span>
                  </div>
                  <Slider 
                    value={[substance.targetPPM]} 
                    min={50} 
                    max={1500} 
                    step={50}
                    onValueChange={(value) => updateSubstance(index, { targetPPM: value[0] })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

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
              <Label htmlFor="herb">{t('plant.herb')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vegetable" id="vegetable" />
              <Label htmlFor="vegetable">{t('plant.vegetable')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fruit" id="fruit" />
              <Label htmlFor="fruit">{t('plant.fruit')}</Label>
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
              <Label htmlFor="seedling">{t('plant.seedling')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vegetative" id="vegetative" />
              <Label htmlFor="vegetative">{t('plant.vegetative')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flowering" id="flowering" />
              <Label htmlFor="flowering">{t('plant.flowering')}</Label>
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
              <Label>pH Value</Label>
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
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full bg-plantgreen-600 hover:bg-plantgreen-700"
            onClick={handleCalculate}
            disabled={loading}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? t('calc.calculating') : t('calc.calculate')}
          </Button>
        </CardFooter>
      </Card>
      
      {results && (
        <ResultsCard 
          results={results} 
          isPremiumCalculation={isPremiumCalculation}
        />
      )}
    </div>
  );
};

interface ResultsCardProps {
  results: any; // Using any type for simplicity
  isPremiumCalculation: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ results, isPremiumCalculation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [recipeName, setRecipeName] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const { saveRecipe, applyRecipeToPlant } = useAdvancedCalculator();
  const { plants } = useContext(PlantContext);

  const handleSaveRecipe = () => {
    if (recipeName.trim()) {
      saveRecipe(recipeName);
      setRecipeName('');
    }
  };
  
  const handleApplyToPlant = () => {
    if (selectedPlant) {
      applyRecipeToPlant('current', selectedPlant);
    }
  };

  return (
    <Card className={`${isPremiumCalculation && !user?.isPremium ? 'relative overflow-hidden' : ''}`}>
      <CardHeader>
        <CardTitle>{t('calc.results')}</CardTitle>
        <CardDescription>{t('calc.recommended')}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Blur overlay for premium calculations */}
        {isPremiumCalculation && !user?.isPremium && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
            <Lock className="h-12 w-12 text-plantgreen-600 mb-2" />
            <h3 className="text-lg font-semibold text-center">{t('premium.title')}</h3>
            <p className="text-center text-muted-foreground mb-4">{t('premium.subtitle')}</p>
            <Button className="bg-plantgreen-600 hover:bg-plantgreen-700">
              {t('premium.upgrade')}
            </Button>
          </div>
        )}
        
        <div>
          <h3 className="font-medium mb-2">{t('calc.nutrientSolution')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.substances.map((substance: any, i: number) => (
              <div key={i} className="space-y-1">
                <Label className="text-xs">{substance.name}</Label>
                <div className="text-plantgreen-600 font-semibold text-lg">
                  {substance.amount} ml/L
                </div>
                <div className="text-xs text-muted-foreground">{substance.ppm} ppm</div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">NPK Values</h3>
          <div className="flex space-x-4">
            <div className="space-y-1">
              <Label className="text-xs">Nitrogen (N)</Label>
              <div className="text-plantgreen-600 font-semibold text-lg">
                {results.totalNPK.n} g
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phosphorus (P)</Label>
              <div className="text-plantgreen-600 font-semibold text-lg">
                {results.totalNPK.p} g
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Potassium (K)</Label>
              <div className="text-plantgreen-600 font-semibold text-lg">
                {results.totalNPK.k} g
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Target pH</Label>
            <div className="text-plantgreen-600 font-semibold text-lg">{results.ph}</div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">EC Value</Label>
            <div className="text-plantgreen-600 font-semibold text-lg">{results.ec} mS/cm</div>
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
        
        {plants?.length > 0 && (
          <div className="w-full flex gap-2">
            <Select value={selectedPlant} onValueChange={setSelectedPlant}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant: any) => (
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
  );
};

// Missing imports
import { useContext } from 'react';
import { PlantContext } from '../contexts/PlantContext';
import { Save, ChevronRight } from 'lucide-react';

export default AdvancedCalculator;
