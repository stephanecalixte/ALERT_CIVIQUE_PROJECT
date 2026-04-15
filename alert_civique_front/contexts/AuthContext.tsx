import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '@/app/lib/services/LoginService';

interface User {
  userId: number;
  name?: string;
  email?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User, credentials?: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRegistered: boolean;
  isAdmin: boolean;
}

const AUTH_TOKEN_KEY    = 'auth_token';
const USER_DATA_KEY     = 'user_data';
const CREDENTIALS_KEY   = 'user_credentials'; // email + password pour re-auth silencieuse
const HAS_REGISTERED_KEY = 'has_registered';  // jamais supprimé

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]                   = useState<User | null>(null);
  const [token, setToken]                 = useState<string | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUserJson, savedFlag, savedCreds] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(USER_DATA_KEY),
          AsyncStorage.getItem(HAS_REGISTERED_KEY),
          AsyncStorage.getItem(CREDENTIALS_KEY),
        ]);

        if (savedFlag === 'true') setHasRegistered(true);

        if (savedToken && savedUserJson) {
          // Session valide en mémoire → démarrage direct
          setToken(savedToken);
          setUser(JSON.parse(savedUserJson) as User);
        } else if (savedCreds) {
          // Token absent/expiré mais credentials sauvegardés → re-login silencieux
          try {
            const { email, password } = JSON.parse(savedCreds);
            const res = await loginUser(email, password);
            const reAuthedUser: User = {
              userId:  res.userId,
              name:    `${res.firstname} ${res.lastname}`.trim() || email,
              email:   res.email,
              isAdmin: res.isAdmin,
            };
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.token);
            await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(reAuthedUser));
            setToken(res.token);
            setUser(reAuthedUser);
          } catch {
            // Re-login silencieux échoué (backend hors ligne) → on reste connecté avec les données locales
            // On ne force PAS la déconnexion pour une app d'urgence
            if (savedUserJson) {
              setUser(JSON.parse(savedUserJson) as User);
              // token reste null → les appels API échoueront mais l'app reste accessible
            }
          }
        }
      } catch (e) {
        console.error('AuthContext load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Sauvegarde session + credentials pour re-auth silencieuse future
  const login = async (newToken: string, newUser: User, credentials?: { email: string; password: string }) => {
    const ops: Promise<void>[] = [
      AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser)),
      AsyncStorage.setItem(HAS_REGISTERED_KEY, 'true'),
    ];
    if (credentials) {
      ops.push(AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials)));
    }
    await Promise.all(ops);
    setToken(newToken);
    setUser(newUser);
    setHasRegistered(true);
  };

  // Logout explicite (option dans les paramètres) — efface tout sauf has_registered
  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_DATA_KEY),
      AsyncStorage.removeItem(CREDENTIALS_KEY),
      // HAS_REGISTERED_KEY conservé → montrera LoginScreen si réinstallation
    ]);
    setToken(null);
    setUser(null);
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{
      user, token, login, logout,
      isAuthenticated: !!user,
      hasRegistered,
      isAdmin: !!user?.isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
