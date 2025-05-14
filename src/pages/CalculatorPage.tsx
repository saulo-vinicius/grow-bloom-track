
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/ui/use-toast";

const CalculatorPage: React.FC = () => {
  const { toast } = useToast();
  const [isComponentLoaded, setIsComponentLoaded] = useState(false);

  useEffect(() => {
    // Show a toast notification about the component status
    toast({
      title: "Calculadora em manutenção",
      description: "Nossa calculadora de nutrientes está passando por uma atualização. Em breve estará disponível novamente!",
      duration: 5000,
    });
    
    setIsComponentLoaded(true);
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calculadora de Nutrientes</h1>
        <p className="text-muted-foreground">Calcule a fórmula perfeita de nutrientes para suas plantas</p>
        
        {/* Temporary replacement for BGC component */}
        <Card>
          <CardHeader>
            <CardTitle>Calculadora de Nutrientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="inline-block p-3 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M12 9v4"></path>
                    <path d="M12 17h.01"></path>
                    <path d="M3.34 17a10 10 0 1 1 17.32 0"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Calculadora em Manutenção</h3>
                <p className="text-muted-foreground mt-2">
                  Nossa calculadora de nutrientes está passando por uma atualização para melhorar sua experiência.
                  Em breve, estará disponível com novas funcionalidades!
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Agradecemos sua compreensão durante esta atualização.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CalculatorPage;
