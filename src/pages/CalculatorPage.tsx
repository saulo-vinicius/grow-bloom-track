
import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CalculatorPage: React.FC = () => {
  useEffect(() => {
    toast({
      title: "Manutenção em Andamento",
      description: "A calculadora está sendo atualizada. Por favor, tente novamente mais tarde.",
      variant: "destructive"
    });
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calculadora de Nutrientes</h1>
        <p className="text-muted-foreground">Calcule a fórmula perfeita de nutrientes para suas plantas</p>
        
        <Card className="border-2 border-dashed border-yellow-500 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="text-yellow-800">🔧 Manutenção em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Estamos trabalhando para resolver um problema técnico com a calculadora de nutrientes.
                O componente apresenta erros de sintaxe que estão sendo corrigidos.
              </p>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono text-gray-700">
                <p>Erro: Elementos JSX sem tags de fechamento correspondentes</p>
                <p className="text-xs mt-2">Arquivo: src/components/BGC.tsx</p>
              </div>
              <p>
                Nossa equipe técnica foi notificada e está trabalhando para resolver este problema o mais rápido possível.
                Agradecemos sua paciência.
              </p>
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
