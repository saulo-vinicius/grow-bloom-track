
import React from 'react';
import Layout from '../components/Layout';
import BoraGrowCalculator from '../components/BoraGrowCalculator';

const CalculatorPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6 px-2 sm:px-4 max-w-full overflow-hidden">
        <h1 className="text-2xl font-bold">Calculadora de Nutrientes</h1>
        <p className="text-muted-foreground">Calcule a fórmula perfeita de nutrientes para suas plantas com precisão</p>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800 text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-300">Dicas de uso da calculadora:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700 dark:text-blue-400">
            <li>Você pode usar <span className="font-bold">ponto (.)</span> ou <span className="font-bold">vírgula (,)</span> como separador decimal</li>
            <li>O cálculo de EC é baseado no modelo empírico do HydroBuddy</li>
            <li>Selecione substâncias e defina os pesos para obter resultados precisos</li>
          </ul>
        </div>
        
        <BoraGrowCalculator />
      </div>
    </Layout>
  );
};

export default CalculatorPage;
