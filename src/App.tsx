
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from './i18n/i18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { CalculatorProvider } from './contexts/CalculatorContext';
import { AdvancedCalculatorProvider } from './contexts/AdvancedCalculatorContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PlantsPage from './pages/PlantsPage';
import AddPlantPage from './pages/AddPlantPage';
import PlantDetailPage from './pages/PlantDetailPage';
import CalculatorPage from './pages/CalculatorPage';
import AdvancedCalculatorPage from './pages/AdvancedCalculatorPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PlantProvider>
              <CalculatorProvider>
                <AdvancedCalculatorProvider>
                  <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/plants" element={<PlantsPage />} />
                    <Route path="/plants/new" element={<AddPlantPage />} />
                    <Route path="/plants/:plantId" element={<PlantDetailPage />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/advanced-calculator" element={<AdvancedCalculatorPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AdvancedCalculatorProvider>
              </CalculatorProvider>
            </PlantProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
