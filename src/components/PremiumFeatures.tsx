
import React from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PremiumFeature {
  key: string;
  icon: React.ReactNode;
}

const PremiumFeatures: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const features: PremiumFeature[] = [
    { key: 'premium.feature1', icon: <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center"><Check className="h-4 w-4 text-plantgreen-600" /></div> },
    { key: 'premium.feature2', icon: <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center"><Check className="h-4 w-4 text-plantgreen-600" /></div> },
    { key: 'premium.feature3', icon: <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center"><Check className="h-4 w-4 text-plantgreen-600" /></div> },
    { key: 'premium.feature4', icon: <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center"><Check className="h-4 w-4 text-plantgreen-600" /></div> },
    { key: 'premium.feature5', icon: <div className="h-8 w-8 rounded-full bg-plantgreen-100 flex items-center justify-center"><Check className="h-4 w-4 text-plantgreen-600" /></div> },
  ];

  return (
    <Card className="border-plantgreen-200 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-plantgreen-500 rounded-full opacity-20" />
      
      <CardHeader>
        <CardTitle className="text-plantgreen-600">{t('premium.title')}</CardTitle>
        <CardDescription>{t('premium.subtitle')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.key} className="flex items-center space-x-4">
              {feature.icon}
              <span>{t(feature.key)}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="text-3xl font-bold text-plantgreen-600">{t('premium.price')}</div>
          <div className="text-sm text-muted-foreground">{t('premium.perMonth')}</div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {user?.isPremium ? (
          <Button disabled className="bg-plantgreen-600 hover:bg-plantgreen-700">
            {t('premium.alreadyPremium')}
          </Button>
        ) : (
          <Button className="bg-plantgreen-600 hover:bg-plantgreen-700">
            {t('premium.upgrade')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PremiumFeatures;
