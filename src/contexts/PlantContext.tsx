
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';

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
  uploadPlantImage: (file: File) => Promise<string>;
  // Maximum number of plants a free user can have
  MAX_FREE_USER_PLANTS: number;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

// Maximum number of plants a free user can add
const MAX_FREE_USER_PLANTS = 2;

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
        // Try to load plants from Supabase first
        if (user && user.id) {
          try {
            // Use raw query to avoid type errors since the plants table doesn't exist in the types yet
            const { data: plantsData, error: plantsError } = await supabase
              .from('plants')
              .select('*')
              .eq('user_id', user.id)
              .order('added_on', { ascending: false });

            if (!plantsError && plantsData) {
              // Convert from database format to our app format
              const formattedPlants = plantsData.map((dbPlant: any) => ({
                id: dbPlant.id,
                name: dbPlant.name,
                species: dbPlant.species || 'Não especificada',
                location: dbPlant.location || 'indoor',
                imageUrl: dbPlant.image_url || '/placeholder.svg',
                addedOn: dbPlant.added_on || new Date().toISOString(),
                lastUpdated: dbPlant.last_updated || new Date().toISOString(),
                growthPhase: dbPlant.growth_phase || 'Vegetativa',
                stats: dbPlant.stats || []
              }));

              setPlants(formattedPlants);
              setLoading(false);
              return;
            }
          } catch (dbError) {
            console.error("Error fetching from Supabase, falling back to localStorage:", dbError);
          }
        }

        // Fallback to localStorage
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
      
      // Also try to sync with Supabase if possible
      if (user.id) {
        plants.forEach(async (plant) => {
          try {
            // Convert to database format and ensure stats is properly converted to Json
            const dbPlant = {
              id: plant.id,
              user_id: user.id,
              name: plant.name,
              species: plant.species,
              location: plant.location,
              image_url: plant.imageUrl,
              added_on: plant.addedOn,
              last_updated: plant.lastUpdated,
              growth_phase: plant.growthPhase,
              stats: plant.stats as unknown as Json // Explicit type conversion
            };
            
            // Use raw Supabase query to avoid type errors
            const { error } = await supabase
              .from('plants')
              .upsert(dbPlant, { 
                onConflict: 'id',
                ignoreDuplicates: false
              });
              
            if (error) {
              console.error('Error syncing plant to Supabase:', error);
            }
          } catch (error) {
            console.error('Error in Supabase sync:', error);
          }
        });
      }
    }
  }, [plants, user]);

  const uploadPlantImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Try to upload to Supabase storage
      if (user.id) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `plant-images/${user.id}/${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('plants')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (error) {
            throw error;
          }
          
          // Get the public URL
          const { data: urlData } = await supabase.storage
            .from('plants')
            .getPublicUrl(filePath);
            
          if (urlData && urlData.publicUrl) {
            return urlData.publicUrl;
          }
        } catch (storageError) {
          console.error("Error uploading to Supabase storage:", storageError);
          // Continue to fallback method
        }
      }
      
      // Fallback: Use FileReader to create a data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  const addPlant = async (plantData: Omit<Plant, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Check if free user has reached their plant limit
      if (!user.isPremium && plants.length >= MAX_FREE_USER_PLANTS) {
        toast({
          title: "Limite de plantas atingido",
          description: "Usuários gratuitos podem adicionar apenas 2 plantas. Atualize para premium para adicionar mais plantas.",
          variant: "destructive",
        });
        throw new Error('Plant limit reached for free user');
      }
      
      // Generate a proper UUID for the plant ID
      const newPlantId = uuidv4();
      
      const newPlant: Plant = {
        ...plantData,
        id: newPlantId,
        addedOn: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      
      // If user is online, try to save directly to Supabase first
      if (user.id) {
        try {
          const dbPlant = {
            id: newPlant.id,
            user_id: user.id,
            name: newPlant.name,
            species: newPlant.species,
            location: newPlant.location,
            image_url: newPlant.imageUrl,
            added_on: newPlant.addedOn,
            last_updated: newPlant.lastUpdated,
            growth_phase: newPlant.growthPhase,
            stats: newPlant.stats as unknown as Json
          };
          
          const { error } = await supabase
            .from('plants')
            .insert(dbPlant);
            
          if (error) {
            console.error('Error saving plant to Supabase:', error);
            // Continue with local storage saving as backup
          }
        } catch (error) {
          console.error('Error in Supabase save:', error);
        }
      }
      
      // Update local state
      setPlants(prevPlants => [...prevPlants, newPlant]);
      
      toast({
        title: "Sucesso!",
        description: "Planta adicionada com sucesso!",
        variant: "default"
      });
      
      return;
    } catch (err: any) {
      console.error('Error adding plant:', err);
      setError('Failed to add plant');
      toast({
        title: "Erro",
        description: err.message || "Falha ao adicionar planta",
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
      
      // Delete from Supabase if possible
      if (user.id) {
        try {
          // Use raw query to avoid type errors
          const { error } = await supabase
            .from('plants')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
            
          if (error) {
            console.error('Error deleting plant from Supabase:', error);
          }
        } catch (dbError) {
          console.error("Error deleting from Supabase:", dbError);
        }
      }
      
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
        uploadPlantImage,
        MAX_FREE_USER_PLANTS
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
