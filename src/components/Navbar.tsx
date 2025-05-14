
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import { 
  User, 
  Settings, 
  Calculator, 
  Home, 
  LogOut 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-full w-full bg-sidebar border-r">
      <div className="p-4 flex flex-col items-center">
        <div className="text-xl font-bold text-plantgreen-600">{t('app.title')}</div>
        <div className="text-sm text-muted-foreground">{t('app.tagline')}</div>
      </div>
      
      <div className="flex-1 flex flex-col p-2 space-y-2">
        <NavItem 
          to="/dashboard" 
          icon={<Home className="h-5 w-5" />} 
          label={t('nav.home')} 
          active={location.pathname === '/dashboard'} 
        />
        <NavItem 
          to="/plants" 
          icon={<User className="h-5 w-5" />} 
          label={t('nav.plants')} 
          active={location.pathname === '/plants'} 
        />
        <NavItem 
          to="/calculator" 
          icon={<Calculator className="h-5 w-5" />} 
          label="Calculadora de Nutrientes" 
          active={location.pathname === '/calculator'} 
        />
        <NavItem 
          to="/settings" 
          icon={<Settings className="h-5 w-5" />} 
          label={t('nav.settings')} 
          active={location.pathname === '/settings'} 
        />
      </div>
      
      <div className="p-4 border-t">
        <div className="mb-4">
          <LanguageSelector />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs text-muted-foreground">
                {user?.isPremium ? 'Premium' : 'Free'}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            title={t('auth.signout')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        active ? 'bg-plantgreen-100 text-plantgreen-700' : 'hover:bg-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
