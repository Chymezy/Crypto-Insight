import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, logout, signup, getCurrentUser, forgotPassword, resetPassword } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginHandler = async (email: string, password: string) => {
    const user = await login(email, password);
    setUser(user);
  };

  const logoutHandler = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const signupHandler = async (name: string, email: string, password: string) => {
    await signup(name, email, password);
    // Note: We don't set the user here as they might need to verify their email first
  };

  const forgotPasswordHandler = async (email: string) => {
    await forgotPassword(email);
  };

  const resetPasswordHandler = async (email: string, token: string, newPassword: string) => {
    await resetPassword(email, token, newPassword);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: loginHandler,
        logout: logoutHandler,
        signup: signupHandler,
        forgotPassword: forgotPasswordHandler,
        resetPassword: resetPasswordHandler,
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
