
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import LanguageSelector from '../components/LanguageSelector';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const { signup, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-plantgreen-50 to-white">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-plantgreen-600">{t('app.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('app.tagline')}</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{t('auth.signup')}</CardTitle>
            <CardDescription>
              {t('auth.hasAccount')} <Link to="/login" className="text-plantgreen-600 hover:underline">{t('auth.signin')}</Link>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="example@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-plantgreen-600 hover:bg-plantgreen-700" 
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : t('auth.signup')}
              </Button>
            </form>
            
            <div className="mt-4 flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{t('auth.or')}</span>
              <Separator className="flex-1" />
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-4" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-2" />
              {t('auth.google')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
