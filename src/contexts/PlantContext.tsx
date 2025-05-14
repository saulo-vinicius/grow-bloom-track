
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define the Plant type
export interface Plant {
  id: string;
  name: string;
  strain: string;
  stage: string;
  image_url?: string;
  user_id: string;
  created_at?: string;
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
      
      setPlants(data || []);
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
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .insert([plant])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setPlants(prev => [...prev, data[0]]);
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
    
    try {
      const { data, error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        setPlants(prev => prev.map(p => p.id === id ? data[0] : p));
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
