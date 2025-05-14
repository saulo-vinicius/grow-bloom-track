
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { usePlants } from '../contexts/PlantContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';

const AddPlantPage: React.FC = () => {
  const { t } = useTranslation();
  const { addPlant } = usePlants();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    location: 'indoor' as 'indoor' | 'outdoor',
    imageUrl: '/placeholder.svg',
    growthPhase: 'Seedling',
    stats: [
      {
        date: new Date().toISOString(),
        temperature: 24,
        humidity: 60,
        ppm: 500,
        notes: '',
      }
    ]
  });
  
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleStatsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: [
        {
          ...prev.stats[0],
          [field]: value
        }
      ]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // Mapear para o formato correto esperado pelo addPlant
      const plantData = {
        name: formData.name,
        species: formData.species,
        strain: formData.species,
        stage: formData.growthPhase,
        location: formData.location,
        growthPhase: formData.growthPhase,
        user_id: user.id,
        image_url: formData.imageUrl,
        stats: formData.stats,
        addedOn: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await addPlant(plantData);
      navigate('/plants');
    } catch (error) {
      console.error('Error adding plant:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plants')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">{t('plants.addNew' as TranslationKey)}</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('plants.details' as TranslationKey)}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('plant.name' as TranslationKey)}</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="species">{t('plant.species' as TranslationKey)}</Label>
                  <Input 
                    id="species" 
                    value={formData.species} 
                    onChange={(e) => handleChange('species', e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('plant.location' as TranslationKey)}</Label>
                  <RadioGroup 
                    value={formData.location} 
                    onValueChange={(value: 'indoor' | 'outdoor') => handleChange('location', value)}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2 mr-4">
                      <RadioGroupItem value="indoor" id="indoor" />
                      <Label htmlFor="indoor">{t('plant.indoor' as TranslationKey)}</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outdoor" id="outdoor" />
                      <Label htmlFor="outdoor">{t('plant.outdoor' as TranslationKey)}</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="growthPhase">{t('plant.growthPhase' as TranslationKey)}</Label>
                  <Select 
                    value={formData.growthPhase} 
                    onValueChange={(value) => handleChange('growthPhase', value)}
                  >
                    <SelectTrigger id="growthPhase">
                      <SelectValue placeholder="Select growth phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seedling">Seedling</SelectItem>
                      <SelectItem value="Vegetative">Vegetative</SelectItem>
                      <SelectItem value="Flowering">Flowering</SelectItem>
                      <SelectItem value="Fruiting">Fruiting</SelectItem>
                      <SelectItem value="Mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('plant.updateStats' as TranslationKey)}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">{t('plant.temperature' as TranslationKey)} (°C)</Label>
                  <Input 
                    id="temperature" 
                    type="number"
                    min="0"
                    max="50"
                    value={formData.stats[0].temperature} 
                    onChange={(e) => handleStatsChange('temperature', Number(e.target.value))} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="humidity">{t('plant.humidity' as TranslationKey)} (%)</Label>
                  <Input 
                    id="humidity" 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.stats[0].humidity} 
                    onChange={(e) => handleStatsChange('humidity', Number(e.target.value))} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ppm">{t('plant.ppm' as TranslationKey)}</Label>
                  <Input 
                    id="ppm" 
                    type="number"
                    min="0"
                    max="2000"
                    value={formData.stats[0].ppm} 
                    onChange={(e) => handleStatsChange('ppm', Number(e.target.value))} 
                    required 
                  />
                </div>
                
                <div className="mt-6">
                  <Label className="mb-2 block">{t('plant.updatePhoto' as TranslationKey)}</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drag & drop your plant photo here, or click to select
                    </p>
                    <Button variant="ghost" size="sm" className="mt-4">
                      Browse files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/plants')}
            >
              {t('plant.cancel' as TranslationKey)}
            </Button>
            
            <Button 
              type="submit" 
              className="bg-plantgreen-600 hover:bg-plantgreen-700"
            >
              {t('plant.save' as TranslationKey)}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddPlantPage;
