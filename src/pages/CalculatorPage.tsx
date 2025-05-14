
import React from 'react';
import Layout from '../components/Layout';
import BoraGrowCalculator from '../components/BoraGrowCalculator';

const CalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calculadora de Nutrientes</h1>
        <p className="text-muted-foreground">Calcule a fórmula perfeita de nutrientes para suas plantas</p>
        <BoraGrowCalculator />
      </div>
    </Layout>
  );
};

export default CalculatorPage;
