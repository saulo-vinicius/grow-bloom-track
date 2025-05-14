
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlants } from '../contexts/PlantContext';
import Layout from '../components/Layout';
import PlantCard from '../components/PlantCard';
import PremiumFeatures from '../components/PremiumFeatures';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Plus } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { plants, loading } = usePlants();
  
  // Show just the first 3 plants on the dashboard
  const recentPlants = plants.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('home.welcome')}, {user?.email?.split('@')[0]}</h1>
            <p className="text-muted-foreground">{t('home.myDashboard')}</p>
          </div>
          
          <Button asChild className="mt-4 md:mt-0 bg-plantgreen-600 hover:bg-plantgreen-700">
            <Link to="/plants/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('home.addPlant')}
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('home.yourPlants')}</CardTitle>
                  <CardDescription>{t('home.recentUpdates')}</CardDescription>
                </div>
                
                <Button asChild variant="ghost" size="sm">
                  <Link to="/plants">{t('home.viewAll')}</Link>
                </Button>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-pulse text-lg">Loading...</div>
                  </div>
                ) : recentPlants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentPlants.map(plant => (
                      <PlantCard key={plant.id} plant={plant} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-lg font-medium">{t('plants.noPlants')}</div>
                    <Button asChild className="mt-4 bg-plantgreen-600 hover:bg-plantgreen-700">
                      <Link to="/plants/new">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('plants.addNew')}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('calc.title')}</CardTitle>
                <CardDescription>{t('calc.description')}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-8">
                  <Button asChild className="bg-plantgreen-600 hover:bg-plantgreen-700">
                    <Link to="/calculator">
                      <Calculator className="mr-2 h-4 w-4" />
                      {t('calc.optimizeNow')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <PremiumFeatures />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Add import for Calculator component
import { Calculator } from 'lucide-react';

export default DashboardPage;
