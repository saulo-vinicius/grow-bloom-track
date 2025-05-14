
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  // Handle responsive sidebar
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if user is authenticated but on a non-auth page
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // For auth pages without navbar
  if (!requireAuth) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // For authenticated layouts with navbar
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="p-4 bg-card shadow-sm fixed top-0 left-0 right-0 z-10 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-lg font-bold text-plantgreen-600">BoraGrow</div>
          <div className="w-9"></div>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobile ? 'fixed z-20 h-full shadow-lg' : 'relative'} 
          transition-transform duration-300 ease-in-out 
          w-64 md:translate-x-0
        `}
      >
        <Navbar />
      </div>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isMobile ? 'mt-16' : ''}`}>
        {/* Overlay for mobile sidebar */}
        {isMobile && showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        <div className="container mx-auto p-4 md:p-6 h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
