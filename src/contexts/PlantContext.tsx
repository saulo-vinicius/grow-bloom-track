
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define o tipo PlantStat
export interface PlantStat {
  date: string;
  temperature: number;
  humidity: number;
  ppm: number;
  notes: string;
}

// Define the Plant type
export interface Plant {
  id: string;
  name: string;
  strain: string;
  stage: string;
  image_url?: string;
  user_id: string;
  created_at?: string;
  // Campos adicionais necessários para o PlantCard
  species?: string;
  location?: string;
  growthPhase?: string;
  lastUpdated?: string;
  addedOn?: string;
  stats?: PlantStat[];
}

// Define the context type
interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  fetchPlants: () => Promise<void>;
  addPlant: (plant: Omit<Plant, 'id' | 'created_at'>) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Omit<Plant, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  getPlant: (id: string) => Plant | undefined;
  getPlantById: (id: string) => Plant | undefined;
  addPlantStat: (plantId: string, stat: Omit<PlantStat, 'date'>) => Promise<void>;
}

// Create the context with default values
export const PlantContext = createContext<PlantContextType>({
  plants: [],
  loading: false,
  error: null,
  fetchPlants: async () => {},
  addPlant: async () => {},
  updatePlant: async () => {},
  deletePlant: async () => {},
  getPlant: () => undefined,
  getPlantById: () => undefined,
  addPlantStat: async () => {},
});

// Context provider component
interface PlantProviderProps {
  children: ReactNode;
}

export const PlantProvider: React.FC<PlantProviderProps> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch plants when user changes
  useEffect(() => {
    if (user) {
      fetchPlants();
    } else {
      setPlants([]);
    }
  }, [user]);

  // Fetch plants from Supabase
  const fetchPlants = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Enriquece os dados das plantas com estatísticas e informações adicionais
      const enrichedPlants = data?.map(plant => ({
        ...plant,
        species: plant.strain, // Mapeia strain para species para compatibilidade
        location: 'indoor', // Valor padrão para location
        growthPhase: plant.stage, // Mapeia stage para growthPhase para compatibilidade
        lastUpdated: plant.created_at, // Usa created_at como lastUpdated
        addedOn: plant.created_at, // Usa created_at como addedOn
        stats: [{ // Estatísticas de exemplo
          date: new Date().toISOString(),
          temperature: 24,
          humidity: 60,
          ppm: 800,
          notes: ''
        }]
      })) || [];
      
      setPlants(enrichedPlants);
    } catch (err: any) {
      console.error('Error fetching plants:', err);
      setError(err.message);
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  // Add a new plant
  const addPlant = async (plant: Omit<Plant, 'id' | 'created_at'>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    // Garantir que temos todos os campos necessários
    const plantData = {
      name: plant.name,
      strain: plant.species || '',
      stage: plant.growthPhase || '',
      user_id: user.id,
      // Outros campos conforme necessário
    };
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .insert([plantData])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Enriquecer os dados com os campos adicionais
        const enrichedPlant = {
          ...data[0],
          species: data[0].strain,
          location: plant.location || 'indoor',
          growthPhase: data[0].stage,
          lastUpdated: data[0].created_at,
          addedOn: data[0].created_at,
          stats: plant.stats || [{
            date: new Date().toISOString(),
            temperature: 24,
            humidity: 60,
            ppm: 800,
            notes: ''
          }]
        };
        
        setPlants(prev => [...prev, enrichedPlant]);
        toast.success('Plant added successfully');
      }
    } catch (err: any) {
      console.error('Error adding plant:', err);
      setError(err.message);
      toast.error('Failed to add plant');
    } finally {
      setLoading(false);
    }
  };

  // Update an existing plant
  const updatePlant = async (id: string, updates: Partial<Omit<Plant, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    // Mapear os campos atualizados para o formato correto da tabela
    const plantUpdates: any = {};
    if (updates.name) plantUpdates.name = updates.name;
    if (updates.species) plantUpdates.strain = updates.species;
    if (updates.growthPhase) plantUpdates.stage = updates.growthPhase;
    // Adicionar outros campos conforme necessário
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .update(plantUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        // Atualizar a planta no estado local com os campos enriquecidos
        setPlants(prev => prev.map(p => {
          if (p.id === id) {
            return {
              ...p,
              ...data[0],
              species: data[0].strain,
              growthPhase: data[0].stage,
              ...updates // Inclui outros campos atualizados que não estão na tabela
            };
          }
          return p;
        }));
        toast.success('Plant updated successfully');
      }
    } catch (err: any) {
      console.error('Error updating plant:', err);
      setError(err.message);
      toast.error('Failed to update plant');
    } finally {
      setLoading(false);
    }
  };

  // Delete a plant
  const deletePlant = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setPlants(prev => prev.filter(p => p.id !== id));
      toast.success('Plant deleted successfully');
    } catch (err: any) {
      console.error('Error deleting plant:', err);
      setError(err.message);
      toast.error('Failed to delete plant');
    } finally {
      setLoading(false);
    }
  };

  // Get a specific plant by ID
  const getPlant = (id: string) => {
    return plants.find(p => p.id === id);
  };
  
  // Alias para getPlant para compatibilidade
  const getPlantById = (id: string) => {
    return getPlant(id);
  };
  
  // Adicionar uma nova estatística a uma planta
  const addPlantStat = async (plantId: string, stat: Omit<PlantStat, 'date'>) => {
    const plant = getPlantById(plantId);
    if (!plant) return;
    
    const newStat: PlantStat = {
      ...stat,
      date: new Date().toISOString()
    };
    
    // Por enquanto, apenas atualizar o estado local
    // Em uma implementação completa, isso salvaria também no Supabase
    setPlants(prev => prev.map(p => {
      if (p.id === plantId) {
        return {
          ...p,
          stats: [newStat, ...(p.stats || [])],
          lastUpdated: newStat.date
        };
      }
      return p;
    }));
    
    toast.success('Plant stats updated successfully');
    
    // Aqui iria a lógica para salvar no Supabase se tivéssemos uma tabela para estatísticas
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        loading,
        error,
        fetchPlants,
        addPlant,
        updatePlant,
        deletePlant,
        getPlant,
        getPlantById,
        addPlantStat,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};

// Custom hook to use the plant context
export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};
