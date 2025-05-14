import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from '../i18n/i18nContext';
import { usePlants, PlantStat } from '../contexts/PlantContext';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Trash, Edit, ChartLine, Upload } from 'lucide-react';

const PlantDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const { getPlantById, updatePlant, deletePlant, addPlantStat } = usePlants();
  
  const plant = getPlantById(plantId || '');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const [editData, setEditData] = useState({
    name: plant?.name || '',
    species: plant?.species || '',
    location: plant?.location || 'indoor',
    growthPhase: plant?.growthPhase || '',
  });
  
  const [newStat, setNewStat] = useState<Omit<PlantStat, 'date'>>({
    temperature: 24,
    humidity: 60,
    ppm: 500,
    notes: '',
  });
  
  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleStatChange = (field: string, value: string | number) => {
    setNewStat(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSaveEdit = async () => {
    if (plant) {
      await updatePlant(plant.id, editData);
      setIsEditing(false);
    }
  };
  
  const handleAddStat = async () => {
    if (plant) {
      await addPlantStat(plant.id, newStat);
      setIsAddingStat(false);
      setNewStat({
        temperature: 24,
        humidity: 60,
        ppm: 500,
        notes: '',
      });
    }
  };
  
  const handleDelete = async () => {
    if (plant) {
      await deletePlant(plant.id);
      navigate('/plants');
    }
  };
  
  if (!plant) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Plant not found</h2>
          <Button 
            className="mt-4 bg-plantgreen-600 hover:bg-plantgreen-700"
            onClick={() => navigate('/plants')}
          >
            Back to Plants
          </Button>
        </div>
      </Layout>
    );
  }
  
  // Process data for charts
  const chartData = plant.stats
    .slice()
    .reverse()
    .map(stat => ({
      date: format(new Date(stat.date), 'MM/dd'),
      temperature: stat.temperature,
      humidity: stat.humidity,
      ppm: stat.ppm,
    }));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/plants')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">{plant.name}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{isEditing ? t('plant.updateStats') : plant.name}</CardTitle>
                  <CardDescription>
                    {isEditing ? '' : plant.species}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        {t('plant.cancel')}
                      </Button>
                      <Button 
                        className="bg-plantgreen-600 hover:bg-plantgreen-700"
                        onClick={handleSaveEdit}
                      >
                        {t('plant.save')}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">{t('plant.name')}</Label>
                      <Input 
                        id="edit-name" 
                        value={editData.name} 
                        onChange={(e) => handleEditChange('name', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-species">{t('plant.species')}</Label>
                      <Input 
                        id="edit-species" 
                        value={editData.species} 
                        onChange={(e) => handleEditChange('species', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">{t('plant.location')}</Label>
                      <select 
                        id="edit-location"
                        className="w-full h-10 px-3 rounded-md border"
                        value={editData.location}
                        onChange={(e) => handleEditChange('location', e.target.value)}
                      >
                        <option value="indoor">{t('plant.indoor')}</option>
                        <option value="outdoor">{t('plant.outdoor')}</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-growth">{t('plant.growthPhase')}</Label>
                      <Input 
                        id="edit-growth" 
                        value={editData.growthPhase} 
                        onChange={(e) => handleEditChange('growthPhase', e.target.value)} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="aspect-video relative rounded-lg overflow-hidden">
                      <img 
                        src={plant.image_url || '/placeholder.svg'} 
                        alt={plant.name} 
                        className="object-cover w-full h-64 rounded-lg"
                      />
                      <Badge 
                        variant="outline" 
                        className="absolute bottom-2 left-2 bg-background/80"
                      >
                        {plant.location === 'indoor' ? t('plant.indoor') : t('plant.outdoor')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('plant.addedOn')}</div>
                        <div className="font-medium">
                          {format(new Date(plant.addedOn), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('plants.lastUpdate')}</div>
                        <div className="font-medium">
                          {format(new Date(plant.lastUpdated), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('plant.growthPhase')}</div>
                        <div className="font-medium">{plant.growthPhase}</div>
                      </div>
                      
                      <div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setIsAddingStat(true)}
                        >
                          {t('plant.updateStats')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Tabs defaultValue="stats" className="mt-6">
              <TabsList>
                <TabsTrigger value="stats">
                  <ChartLine className="h-4 w-4 mr-2" />
                  Stats
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Growth History</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="temperature" stroke="#4d9152" name="Temperature (°C)" />
                          <Line type="monotone" dataKey="humidity" stroke="#3a7740" name="Humidity (%)" />
                          <Line type="monotone" dataKey="ppm" stroke="#305f35" name="PPM" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="font-medium">Recent Stats</h3>
                      
                      {plant.stats.slice(0, 5).map((stat, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(stat.date), 'MMM dd, yyyy')}
                              </div>
                              
                              <div className="flex space-x-4">
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">{t('plant.temperature')}</div>
                                  <div className="font-medium">{stat.temperature}°C</div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">{t('plant.humidity')}</div>
                                  <div className="font-medium">{stat.humidity}%</div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">{t('plant.ppm')}</div>
                                  <div className="font-medium">{stat.ppm}</div>
                                </div>
                              </div>
                            </div>
                            
                            {stat.notes && (
                              <div className="mt-2 text-sm border-t pt-2">
                                {stat.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Latest measurements</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('plant.temperature')}</Label>
                    <div className="flex items-center">
                      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-plantgreen-500 h-4"
                          style={{ width: `${Math.min(100, (plant.stats[0].temperature / 40) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">{plant.stats[0].temperature}°C</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('plant.humidity')}</Label>
                    <div className="flex items-center">
                      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-plantgreen-500 h-4"
                          style={{ width: `${Math.min(100, plant.stats[0].humidity)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">{plant.stats[0].humidity}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('plant.ppm')}</Label>
                    <div className="flex items-center">
                      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-plantgreen-500 h-4"
                          style={{ width: `${Math.min(100, (plant.stats[0].ppm / 1500) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">{plant.stats[0].ppm}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t pt-4">
                  <Button 
                    className="w-full bg-plantgreen-600 hover:bg-plantgreen-700"
                    onClick={() => setIsAddingStat(true)}
                  >
                    {t('plant.updateStats')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('plant.updatePhoto')}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center">
                    Drag & drop your plant photo here, or click to select
                  </p>
                  <Button variant="ghost" size="sm" className="mt-4">
                    Browse files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Add Stat Dialog */}
        <Dialog open={isAddingStat} onOpenChange={setIsAddingStat}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('plant.updateStats')}</DialogTitle>
              <DialogDescription>
                Add the latest measurements for your plant.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">{t('plant.temperature')} (°C)</Label>
                <Input 
                  id="temperature" 
                  type="number"
                  min="0"
                  max="50"
                  value={newStat.temperature} 
                  onChange={(e) => handleStatChange('temperature', Number(e.target.value))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="humidity">{t('plant.humidity')} (%)</Label>
                <Input 
                  id="humidity" 
                  type="number"
                  min="0"
                  max="100"
                  value={newStat.humidity} 
                  onChange={(e) => handleStatChange('humidity', Number(e.target.value))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ppm">{t('plant.ppm')}</Label>
                <Input 
                  id="ppm" 
                  type="number"
                  min="0"
                  max="2000"
                  value={newStat.ppm} 
                  onChange={(e) => handleStatChange('ppm', Number(e.target.value))} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input 
                  id="notes" 
                  value={newStat.notes} 
                  onChange={(e) => handleStatChange('notes', e.target.value)} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingStat(false)}>
                {t('plant.cancel')}
              </Button>
              <Button 
                className="bg-plantgreen-600 hover:bg-plantgreen-700"
                onClick={handleAddStat}
              >
                {t('plant.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('plant.delete')}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this plant? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                {t('plant.cancel')}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                {t('plant.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PlantDetailPage;
