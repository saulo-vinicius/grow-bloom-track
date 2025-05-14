
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTranslation } from '../i18n/i18nContext';
import { useAdvancedCalculator } from '../contexts/AdvancedCalculatorContext';
import { useAuth } from '../contexts/AuthContext';
import AdvancedCalculator from '../components/AdvancedCalculator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Save, Check, ChevronRight } from 'lucide-react';

const AdvancedCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { savedRecipes, deleteRecipe } = useAdvancedCalculator();
  
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('calc.titleAdvanced')}</h1>
          <p className="text-muted-foreground">{t('calc.descriptionAdvanced')}</p>
        </div>
        
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="calculator">
              <Calculator className="h-4 w-4 mr-2" />
              {t('calc.calculator')}
            </TabsTrigger>
            
            <TabsTrigger value="saved">
              <Save className="h-4 w-4 mr-2" />
              {t('calc.savedRecipes')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="space-y-6">
            <AdvancedCalculator />
          </TabsContent>
          
          <TabsContent value="saved">
            {savedRecipes.length > 0 ? (
              <div className="space-y-4">
                {savedRecipes.map(recipe => (
                  <Card key={recipe.id}>
                    <CardHeader>
                      <CardTitle>{recipe.name}</CardTitle>
                      <CardDescription>
                        {recipe.inputs.plantType}, {recipe.inputs.growthPhase}, {recipe.inputs.environment}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {recipe.results.substances.map((substance, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-xs text-muted-foreground">{substance.name}</div>
                            <div className="font-semibold">{substance.amount} ml/L</div>
                          </div>
                        ))}
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">pH</div>
                          <div className="font-semibold">{recipe.results.ph}</div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteRecipe(recipe.id)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
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
    </Layout>
  );
};

export default AdvancedCalculatorPage;
