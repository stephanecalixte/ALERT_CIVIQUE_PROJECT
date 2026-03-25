import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
interface User {
  userId: number;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userId: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const savedUserJson = await SecureStore.getItemAsync('user_data');
      
      if (savedToken && savedUserJson) {
        const savedUser = JSON.parse(savedUserJson) as User;
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: User) => {
    try {
      await SecureStore.setItemAsync('auth_token', newToken);
      await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
  userId: user?.userId?.toString() || '123',
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  if (isLoading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

