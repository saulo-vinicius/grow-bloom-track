
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/card';

const BGC: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Redirecionando...</CardTitle>
          <CardDescription>
            Este componente foi substituído pelo componente BoraGrowCalculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Por favor, use o componente BoraGrowCalculator em vez deste.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BGC;
