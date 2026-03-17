import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import * as SecureStore from 'expo-secure-store'; // Install first
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
    // Mock for now - replace with SecureStore after install
    setToken('mock-jwt-token');
    setUser({ userId: 123 });
    setIsLoading(false);
  };

  const login = async (newToken: string, newUser: User) => {
    // Mock login
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
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

