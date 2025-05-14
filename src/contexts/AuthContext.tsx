
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../i18n/i18nContext';

// This is a placeholder for Supabase authentication
// You'll need to connect to Supabase to implement real authentication
interface User {
  id: string;
  email: string;
  isPremium: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Simulate checking for an existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        // This is where you would check if the user is already logged in with Supabase
        const savedUser = localStorage.getItem('boragrow_user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a placeholder. Replace with actual Supabase auth when connected
      if (email && password) {
        // Simulate successful login
        const mockUser = {
          id: 'mock-user-id-123',
          email,
          isPremium: false,
        };
        
        setUser(mockUser);
        localStorage.setItem('boragrow_user', JSON.stringify(mockUser));
        toast.success(t('auth.signin') + ' ' + t('auth.continue'));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // This is a placeholder. Replace with actual Supabase Google auth when connected
      // Simulate successful Google login
      const mockUser = {
        id: 'google-user-id-456',
        email: 'user@example.com',
        isPremium: false,
      };
      
      setUser(mockUser);
      localStorage.setItem('boragrow_user', JSON.stringify(mockUser));
      toast.success(t('auth.signin') + ' ' + t('auth.continue'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // This is a placeholder. Replace with actual Supabase signup when connected
      if (email && password) {
        // Simulate successful signup
        const mockUser = {
          id: 'new-user-id-789',
          email,
          isPremium: false,
        };
        
        setUser(mockUser);
        localStorage.setItem('boragrow_user', JSON.stringify(mockUser));
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Invalid signup details');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // This is a placeholder. Replace with actual Supabase logout when connected
      setUser(null);
      localStorage.removeItem('boragrow_user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
