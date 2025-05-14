
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from '../i18n/i18nContext';
import { Plant } from '../contexts/PlantContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface PlantCardProps {
  plant: Plant;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant }) => {
  const { t } = useTranslation();
  const latestStat = plant.stats?.[0] || {
    temperature: 0,
    humidity: 0,
    ppm: 0
  };

  return (
    <Link to={`/plants/${plant.id}`}>
      <Card className="plant-card h-full">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={plant.image_url} 
            alt={plant.name} 
            className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
          />
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/70">
            {plant.location === 'indoor' ? t('plant.indoor') : t('plant.outdoor')}
          </Badge>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-lg">{plant.name}</h3>
          <p className="text-sm text-muted-foreground">{plant.species}</p>
          
          <div className="mt-4 plant-stats">
            <div className="stat-item">
              <span className="text-xs">{t('plant.temperature')}</span>
              <span className="stat-value">{latestStat.temperature}°C</span>
            </div>
            <div className="stat-item">
              <span className="text-xs">{t('plant.humidity')}</span>
              <span className="stat-value">{latestStat.humidity}%</span>
            </div>
            <div className="stat-item">
              <span className="text-xs">{t('plant.ppm')}</span>
              <span className="stat-value">{latestStat.ppm}</span>
            </div>
            <div className="stat-item">
              <span className="text-xs">{t('plant.growthPhase')}</span>
              <span className="stat-value">{plant.growthPhase}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-2 text-xs text-muted-foreground border-t">
          {t('plants.lastUpdate')}: {plant.lastUpdated ? format(new Date(plant.lastUpdated), 'MMM dd, yyyy') : '-'}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PlantCard;
