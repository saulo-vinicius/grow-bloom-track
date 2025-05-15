
import React from 'react';
import { useCalculator } from '../contexts/CalculatorContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

const BGC: React.FC = () => {
  // Redirect to the main calculator component
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
