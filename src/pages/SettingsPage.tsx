
import React from 'react';
import { useTranslation } from '../i18n/i18nContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';
import LanguageSelector from '../components/LanguageSelector';
import PremiumFeatures from '../components/PremiumFeatures';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Moon, HelpCircle, LogOut } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              {t('settings.account')}
            </TabsTrigger>
            
            <TabsTrigger value="appearance">
              <Moon className="h-4 w-4 mr-2" />
              {t('settings.theme')}
            </TabsTrigger>
            
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              {t('settings.notifications')}
            </TabsTrigger>
            
            <TabsTrigger value="help">
              <HelpCircle className="h-4 w-4 mr-2" />
              {t('settings.help')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{user?.email?.split('@')[0]}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Label>{t('settings.language')}</Label>
                    <LanguageSelector />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('settings.logout')}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="max-w-md mx-auto">
              <PremiumFeatures />
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.theme')}</CardTitle>
                <CardDescription>Customize the app's appearance</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <Switch id="high-contrast" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <Switch id="reduce-motion" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>Manage notification settings</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="watering-reminders" className="block">Watering Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified when it's time to water your plants</p>
                  </div>
                  <Switch id="watering-reminders" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="growth-updates" className="block">Growth Updates</Label>
                    <p className="text-sm text-muted-foreground">Get weekly growth summaries</p>
                  </div>
                  <Switch id="growth-updates" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-features" className="block">New Features</Label>
                    <p className="text-sm text-muted-foreground">Learn about new app features</p>
                  </div>
                  <Switch id="new-features" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.help')}</CardTitle>
                <CardDescription>Get help and support</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    View our comprehensive guide to using the app
                  </p>
                  <Button variant="outline" size="sm">View Documentation</Button>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h3 className="font-medium">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Having issues? Our support team is here to help
                  </p>
                  <Button variant="outline" size="sm">Contact Support</Button>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h3 className="font-medium">{t('settings.about')}</h3>
                  <p className="text-sm text-muted-foreground">
                    BoraGrow v1.0.0<br />
                    © 2023 BoraGrow Inc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
