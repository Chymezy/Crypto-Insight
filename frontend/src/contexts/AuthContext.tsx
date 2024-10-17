import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, signup as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await apiLogin(email, password);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    await apiRegister(name, email, password);
    // Don't set the user here, as they need to verify their email first
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
