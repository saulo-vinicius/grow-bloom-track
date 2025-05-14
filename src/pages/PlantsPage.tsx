
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { usePlants } from '../contexts/PlantContext';
import Layout from '../components/Layout';
import PlantCard from '../components/PlantCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter } from 'lucide-react';

const PlantsPage: React.FC = () => {
  const { t } = useTranslation();
  const { plants, loading } = usePlants();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredPlants = plants.filter(plant => {
    // First filter by search query
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          plant.species.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter by tab
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && plant.location === activeTab;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">{t('plants.myPlants')}</h1>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('plants.search')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button asChild className="bg-plantgreen-600 hover:bg-plantgreen-700">
              <Link to="/plants/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('plants.addNew')}
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">{t('plants.all')}</TabsTrigger>
            <TabsTrigger value="indoor">{t('plants.indoor')}</TabsTrigger>
            <TabsTrigger value="outdoor">{t('plants.outdoor')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-2">
            {renderPlantsList(filteredPlants, loading, t)}
          </TabsContent>
          
          <TabsContent value="indoor" className="pt-2">
            {renderPlantsList(filteredPlants, loading, t)}
          </TabsContent>
          
          <TabsContent value="outdoor" className="pt-2">
            {renderPlantsList(filteredPlants, loading, t)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

const renderPlantsList = (plants: any[], loading: boolean, t: any) => {
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }
  
  if (plants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg font-medium">{t('plants.noPlants')}</div>
        <Button asChild className="mt-4 bg-plantgreen-600 hover:bg-plantgreen-700">
          <Link to="/plants/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('plants.addNew')}
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {plants.map(plant => (
        <PlantCard key={plant.id} plant={plant} />
      ))}
    </div>
  );
};

export default PlantsPage;
