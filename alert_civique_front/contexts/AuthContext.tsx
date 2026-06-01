import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JAVA_BASE_URL } from '@/lib/config';

export interface User {
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (token: string, user: User, credentials?: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = '@token';
const USER_KEY  = '@user';
const CREDS_KEY = '@credentials';

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoaded: false,
  login: async () => {},
  logout: async () => {},
});

async function reLoginWithCredentials(creds: Credentials): Promise<{ token: string; user: User } | null> {
  try {
    const response = await fetch(`${JAVA_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: creds.email, password: creds.password }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const userId = data.userId ?? data.id ?? 0;
    if (!userId) return null;
    return {
      token: data.token ?? data.accessToken ?? '',
      user: {
        userId,
        name: [data.firstname, data.lastname].filter(Boolean).join(' ') || creds.email,
        email: data.email ?? creds.email,
        isAdmin: data.isAdmin ?? data.admin ?? false,
      },
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token,    setToken]    = useState<string | null>(null);
  const [user,     setUser]     = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([TOKEN_KEY, USER_KEY, CREDS_KEY])
      .then(async ([[, t], [, u], [, c]]) => {
        if (u) {
          if (t) setToken(t);
          setUser(JSON.parse(u));
          return;
        }
        // User data missing — try silent re-login if credentials are stored
        if (c) {
          const creds: Credentials = JSON.parse(c);
          const recovered = await reLoginWithCredentials(creds);
          if (recovered) {
            setToken(recovered.token);
            setUser(recovered.user);
            await AsyncStorage.multiSet([
              [TOKEN_KEY, recovered.token],
              [USER_KEY,  JSON.stringify(recovered.user)],
            ]);
            return;
          }
        }
        // Fallback: at least restore token if present
        if (t) setToken(t);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const login = async (newToken: string, newUser: User, credentials?: Credentials) => {
    setToken(newToken);
    setUser(newUser);
    const pairs: [string, string][] = [
      [TOKEN_KEY, newToken],
      [USER_KEY,  JSON.stringify(newUser)],
    ];
    if (credentials) pairs.push([CREDS_KEY, JSON.stringify(credentials)]);
    await AsyncStorage.multiSet(pairs);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, CREDS_KEY]);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!user, isLoaded, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
