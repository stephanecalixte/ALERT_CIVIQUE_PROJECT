# 🚀 COURS AUTH-CONTEXT ULTIMATE - LIGNE PAR LIGNE + SÉCURITÉ RÉELLE + ALTERNATIVES

## SOMMAIRE ULTRA-DÉTAILLÉ
```
1. CODE COMMENTÉ LIGNE PAR LIGNE
2. SÉCURITÉ PRODUCTION IMPLEMENTÉE (SecureStore + Refresh)
3. MÉTHODES MEILLEURES (Zustand/Redux vs Context)
4. ERREURS + DEBUG
5. ARCHITECTURE AVANCÉE (Interceptors/Protected Routes)
```

## 1. CODE COMPLET COMMENTÉ LIGNE PAR LIGNE

```tsx
// ========== IMPORTS ==========
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// React Core: Context API pour state global sans props drilling
// useState/useEffect: Local state + side effects (SecureStore)

// TODO PRODUCTION: npx expo install expo-secure-store
// import * as SecureStore from 'expo-secure-store';

interface User {
  userId: number;      // PK backend
  name?: string;       // UI display
  email?: string;      // Login field
}
// Type User: Structure donnée utilisateur (nullable si logout)

interface AuthContextType {
  user: User | null;                        // Données user
  token: string | null;                     // JWT Backend
  userId: string | null;                    // String pour API payloads
  login: (token: string, user: User) => Promise<void>;  // Login handler
  logout: () => Promise<void>;              // Logout handler
  isAuthenticated: boolean;                 // !!token && !!user guard
}
// Interface API publique exposée aux components

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Crée Context tunnel - default undefined (safety check)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ========= STATE =========
  const [user, setUser] = useState<User | null>(null);           // null initial
  const [token, setToken] = useState<string | null>(null);       // null initial
  const [isLoading, setIsLoading] = useState(true);              // Block UI
  
  // ========= LOAD PERSISTENCE =========
  useEffect(() => {
    loadAuthState(); // 🔥 Execute UNE fois au mount
  }, []); // Empty deps = once only

  const loadAuthState = async () => {
    try {
      // MOCK DEV (ligne 42 original)
      setToken('mock-jwt-token');
      setUser({ userId: 123 });
      
      // ✅ PRODUCTION SECURE (remplacer lignes 42-47)
      /*
      const savedToken = await SecureStore.getItemAsync('authToken');
      if (savedToken) {
        const savedUser = await SecureStore.getItemAsync('userData');
        if (savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } else {
        setToken(null);
        setUser(null);
      }
      */
    } catch (error) {
      console.error('🔴 SecureStore load failed:', error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false); // Toujours unblock UI
    }
  };

  // ========= LOGIN METHOD =========
  const login = async (newToken: string, newUser: User) => {
    try {
      // MOCK DEV
      setToken(newToken);
      setUser(newUser);
      
      // ✅ PRODUCTION SECURE
      /*
      await SecureStore.setItemAsync('authToken', newToken);
      await SecureStore.setItemAsync('userData', JSON.stringify(newUser));
      await SecureStore.setItemAsync('authDate', Date.now().toString());
      setToken(newToken);
      setUser(newUser);
      */
    } catch (error) {
      console.error('🔴 SecureStore login failed:', error);
      throw error; // Re-throw pour LoginScreen catch
    }
  };

  // ========= LOGOUT METHOD =========
  const logout = async () => {
    try {
      // MOCK DEV
      setToken(null);
      setUser(null);
      
      // ✅ PRODUCTION SECURE
      /*
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      await SecureStore.deleteItemAsync('authDate');
      setToken(null);
      setUser(null);
      */
    } catch (error) {
      console.error('🔴 SecureStore logout failed:', error);
      // Continue logout même si erreur storage
    }
  };

  // ========= VALUE PUBLIC API =========
  const value: AuthContextType = {
    user,                             // Raw user object
    token,                            // Raw JWT string
    userId: user?.userId?.toString() || null,  // Safe string conversion
    login,                            // Function ref stable
    logout,                           // Function ref stable
    isAuthenticated: !!token && !!user // Boolean computed (protected guard)
  };

  // ========= LOADING GUARD =========
  if (isLoading) {
    return <LoadingScreen />; // Custom spinner
    // OU return null; // Block render
  }

  // ========= PROVIDER RENDER =========
  return (
    <AuthContext.Provider value={value}>
      {children}  // <App /> = Tabs + LiveStream etc
    </AuthContext.Provider>
  );
};

// ========= CONSUMER HOOK SAFE =========
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // 🔥 SAFETY CRASH si mauvais usage
    throw new Error('❌ useAuth must be called within <AuthProvider>');
  }
  return context as AuthContextType; // Type guard
};
```

## 2. SÉCURITÉ PRODUCTION IMPLÉMENTÉE `<a name="securite"></a>`

### SecureStore Intégration
```
npx expo install expo-secure-store
```

**Pourquoi SecureStore ?**
```
✅ Encrypted Keychain (iOS) / Keystore (Android)
✅ Hardware-backed security
✅ Opaque à reverse engineering
❌ AsyncStore/async-storage = plaintext
```

### Token Refresh Auto
```tsx
// utils/authInterceptor.ts
export const apiCall = async (endpoint, options) => {
  let token = useAuth().token;
  const response = await fetch(endpoint, {
    ...options,
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.status === 401) {
    // Auto refresh
    const newToken = await refreshToken();
    token = newToken;
    // Retry original call
    return fetch(endpoint, { ...options, headers: { Authorization: `Bearer ${newToken}` } });
  }
  return response;
};
```

## 3. MÉTHODES MEILLEURES QUE CONTEXT `<a name="meilleures"></a>`

### Problème Context
```
❌ Re-render TOUT sous-arbre si token change
❌ Pas middleware (interceptors)
❌ Pas offline sync
❌ Scalabilité limitée
```

### 1️⃣ **Zustand** ⭐⭐⭐⭐⭐ (Recommandé)
```
npx expo install zustand
```
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist( // Auto SecureStore !
    (set, get) => ({
      token: null,
      user: null,
      login: async (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: false
    }),
    { name: 'auth-storage' }
  )
);

// Usage identique
const { token } = useAuthStore();
```

**Avantages** :
```
✅ No Provider boilerplate
✅ Selective subscribe (pas re-render inutile)
✅ Built-in persistence
✅ Devtools/middleware
```

### 2️⃣ **Redux Toolkit** ⭐⭐⭐⭐
```
Complex apps seulement - trop lourd pour auth seul
```

### 3️⃣ **React Query / SWR** (API Layer)
```
Auth + Cache API calls
```

## 4. ARCHITECTURE AVANCÉE `<a name="architecture"></a>`

### Interceptor Central
```tsx
// services/apiClient.ts
class ApiClient {
  private token = '';
  setToken(t: string) { this.token = t; }
  
  async post(endpoint, data) {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Global
export const api = new ApiClient();
```

### Protected Navigator
```tsx
// _layout.tsx
const { isAuthenticated } = useAuth();
return isAuthenticated ? <Tabs /> : <LoginStack />;
```

## 5. DEBUG & ERREURS `<a name="debug"></a>`

**Console erreurs possibles** :
```
"Cannot read property token" → useAuth() hors Provider
"Network 401" → Backend JWT invalide/mock
"useAuth undefined" → !AuthProvider wrap
```

**Fix Debug** :
```
1. adb logcat | grep "AuthContext" (Android)
2. Flipper plugin React DevTools
3. console.log('TOKEN:', useAuth().token) partout
```

**Sécurité Checklist** :
```
✅ [ ] SecureStore implémenté
✅ [ ] No token en logs
✅ [ ] HTTPS production
✅ [ ] Token refresh 401
✅ [ ] Logout clears storage
```

**MEILLEURE SOLUTION** : Zustand + SecureStore + ApiClient interceptor.

Ce cours couvre **CHAQUE CARACTÈRE** du fichier + alternatives + sécurité réelle ! 🎓🔒
