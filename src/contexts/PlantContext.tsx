import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface PlantStat {
  date: string;
  temperature: number;
  humidity: number;
  ppm: number;
  notes?: string;
  recipeApplied?: {
    type: string;
    name: string;
    description?: string;
    data?: any;
  };
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  location: 'indoor' | 'outdoor';
  imageUrl: string;
  addedOn: string;
  lastUpdated: string;
  stats: PlantStat[];
  growthPhase: string;
}

interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  addPlant: (plant: Omit<Plant, 'id'>) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  addPlantStat: (plantId: string, stat: Omit<PlantStat, 'date'>) => Promise<void>;
  getPlantById: (id: string) => Plant | undefined;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PlantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load plants when the user changes
  useEffect(() => {
    const loadPlants = async () => {
      if (!user) {
        setPlants([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // This is where you would fetch plants from Supabase
        // For now, we'll load from localStorage as a placeholder
        const savedPlants = localStorage.getItem(`boragrow_plants_${user.id}`);
        
        if (savedPlants) {
          setPlants(JSON.parse(savedPlants));
        } else {
          // Start with an empty array instead of sample plants
          setPlants([]);
          localStorage.setItem(`boragrow_plants_${user.id}`, JSON.stringify([]));
        }
      } catch (err) {
        console.error('Error loading plants:', err);
        setError('Failed to load plants');
      } finally {
        setLoading(false);
      }
    };

    loadPlants();
  }, [user]);

  // Save plants to localStorage when they change
  useEffect(() => {
    if (user && plants) {
      localStorage.setItem(`boragrow_plants_${user.id}`, JSON.stringify(plants));
    }
  }, [plants, user]);

  const addPlant = async (plantData: Omit<Plant, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newPlant: Plant = {
        ...plantData,
        id: Date.now().toString(),
        addedOn: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      
      setPlants(prevPlants => [...prevPlants, newPlant]);
      toast({
        title: "Sucesso!",
        description: "Planta adicionada com sucesso!",
        variant: "default"
      });
    } catch (err) {
      console.error('Error adding plant:', err);
      setError('Failed to add plant');
      toast({
        title: "Erro",
        description: "Falha ao adicionar planta",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updatePlant = async (id: string, updates: Partial<Plant>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setPlants(prevPlants => 
        prevPlants.map(plant => 
          plant.id === id 
            ? { 
                ...plant, 
                ...updates, 
                lastUpdated: new Date().toISOString() 
              } 
            : plant
        )
      );
      
      toast({
        title: "Sucesso!",
        description: "Planta atualizada com sucesso!",
        variant: "default"
      });
    } catch (err) {
      console.error('Error updating plant:', err);
      setError('Failed to update plant');
      toast({
        title: "Erro",
        description: "Falha ao atualizar planta",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deletePlant = async (id: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setPlants(prevPlants => prevPlants.filter(plant => plant.id !== id));
      toast({
        title: "Sucesso!",
        description: "Planta excluída com sucesso!",
        variant: "default"
      });
    } catch (err) {
      console.error('Error deleting plant:', err);
      setError('Failed to delete plant');
      toast({
        title: "Erro",
        description: "Falha ao excluir planta",
        variant: "destructive",
      });
      throw err;
    }
  };

  const addPlantStat = async (plantId: string, stat: Omit<PlantStat, 'date'>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const newStat: PlantStat = {
        ...stat,
        date: new Date().toISOString(),
      };
      
      setPlants(prevPlants => 
        prevPlants.map(plant => 
          plant.id === plantId 
            ? {
                ...plant,
                stats: [newStat, ...plant.stats],
                lastUpdated: new Date().toISOString(),
              }
            : plant
        )
      );
      
      toast({
        title: "Sucesso!",
        description: "Estatísticas da planta atualizadas!",
        variant: "default"
      });
    } catch (err) {
      console.error('Error adding plant stat:', err);
      setError('Failed to update plant statistics');
      toast({
        title: "Erro",
        description: "Falha ao atualizar estatísticas da planta",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getPlantById = (id: string) => {
    return plants.find(plant => plant.id === id);
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        loading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        addPlantStat,
        getPlantById,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};
