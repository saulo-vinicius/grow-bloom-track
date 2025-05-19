
import React from 'react';
import Layout from '../components/Layout';
import BoraGrowCalculator from '../components/BoraGrowCalculator';

const CalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6 px-2 sm:px-4 max-w-full overflow-hidden">
        <h1 className="text-2xl font-bold">Calculadora de Nutrientes HydroBuddy</h1>
        <p className="text-muted-foreground">Calcule a fórmula perfeita de nutrientes para suas plantas com precisão</p>
        <BoraGrowCalculator />
      </div>
    </Layout>
  );
};

export default CalculatorPage;
