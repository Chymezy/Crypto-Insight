import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      // Don't set the user or isAuthenticated here, as the user needs to verify their email first
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Signup error:', error.response?.data || error.message);
        throw error.response?.data || error;
      } else {
        console.error('Signup error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isAuthenticated }}>
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
