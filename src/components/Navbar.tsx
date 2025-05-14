
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../i18n/i18nContext';
import { useMobile } from '../hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, Leaf, Calculator, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const NavItems = () => (
    <>
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => 
          `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-plantgreen-100 text-plantgreen-700' : 'text-gray-700 hover:bg-plantgreen-50'}`
        }
      >
        <Home className="h-5 w-5 mr-2" />
        {t('nav.dashboard')}
      </NavLink>
      
      <NavLink 
        to="/plants" 
        className={({ isActive }) => 
          `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-plantgreen-100 text-plantgreen-700' : 'text-gray-700 hover:bg-plantgreen-50'}`
        }
      >
        <Leaf className="h-5 w-5 mr-2" />
        {t('nav.plants')}
      </NavLink>
      
      <NavLink 
        to="/calculator" 
        className={({ isActive }) => 
          `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-plantgreen-100 text-plantgreen-700' : 'text-gray-700 hover:bg-plantgreen-50'}`
        }
      >
        <Calculator className="h-5 w-5 mr-2" />
        {t('nav.calculator')}
      </NavLink>
      
      <NavLink 
        to="/advanced-calculator" 
        className={({ isActive }) => 
          `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-plantgreen-100 text-plantgreen-700' : 'text-gray-700 hover:bg-plantgreen-50'}`
        }
      >
        <Calculator className="h-5 w-5 mr-2" />
        {t('nav.advancedCalculator')}
      </NavLink>
      
      <NavLink 
        to="/settings" 
        className={({ isActive }) => 
          `flex items-center px-4 py-2 rounded-md ${isActive ? 'bg-plantgreen-100 text-plantgreen-700' : 'text-gray-700 hover:bg-plantgreen-50'}`
        }
      >
        <Settings className="h-5 w-5 mr-2" />
        {t('nav.settings')}
      </NavLink>
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img 
                className="h-8 w-auto" 
                src="/logo.svg" 
                alt="BoraGrow" 
              />
              <span className="ml-2 text-xl font-bold text-plantgreen-700">BoraGrow</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavItems />
          </div>

          {/* Mobile menu button */}
          {isMobile && (
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col mt-6 space-y-2">
                    <NavItems />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
