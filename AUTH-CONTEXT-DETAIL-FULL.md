# Cours ULTRA-DÉTAILLÉ : AuthContext - TOUTES les Lignes Expliquées

## Structure Fichier `contexts/AuthContext.tsx`

### 1. Imports (Lignes 1-5)
```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
```
**Explication** :
- `createContext` : Crée le Context object
- `useContext` : Hook pour consommer dans components
- `useState` : user/token state
- `useEffect` : Load auth au démarrage
- `ReactNode` : Type children prop

### 2. Interfaces Types (Lignes 7-20)
```tsx
interface User {
  userId: number;
  name?: string;  // Optional
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userId: string | null;  // String for API
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;  // !!user && !!token
}
```
**Rôle** : Type safety TS + IntelliSense

### 3. Context Creation (Ligne 22)
```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```
**Crée le tunnel** pour partager state globalement.

### 4. AuthProvider - State & Load (Lignes 25-40)
```tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);     // User data
  const [token, setToken] = useState<string | null>(null); // JWT
  const [isLoading, setIsLoading] = useState(true);        // Block render
  
  useEffect(() => {
    loadAuthState(); // 🔥 Au mount
  }, []);
```
**State local → Global via Provider**

### 5. loadAuthState() - Persistance (Lignes 42-52)
```tsx
const loadAuthState = async () => {
  // MOCK pour dev - REMPLACER production
  setToken('mock-jwt-token');
  setUser({ userId: 123 });
  setIsLoading(false);
  
  // PRODUCTION:
  // const savedToken = await SecureStore.getItemAsync('authToken');
  // if (savedToken) {
  //   const userStr = await SecureStore.getItemAsync('user');
  //   setToken(savedToken);
  //   setUser(JSON.parse(userStr!));
  // }
};
```
**Charge token persistant** au démarrage app.

### 6. login() - Set State (Lignes 54-62)
```tsx
const login = async (newToken: string, newUser: User) => {
  // MOCK - PRODUCTION: SecureStore.setItemAsync('authToken', newToken)
  setToken(newToken);     // Update state
  setUser(newUser);
};
```
**Appelé depuis LoginScreen après API success**.

### 7. logout() - Clear State (Lignes 64-67)
```tsx
const logout = async () => {
  // PRODUCTION: SecureStore.deleteItemAsync('authToken')
  setToken(null);
  setUser(null);  // Navigation → LoginScreen
};
```
**Clear tout** + redirect.

### 8. Value Object (Lignes 69-77)
```tsx
const value = {
  user,                    // {userId: 123}
  token,                   // "eyJhbGciOiJIUzI1NiIs..."
  userId: user?.userId?.toString() || null,  // String pour API
  login, logout,
  isAuthenticated: !!token && !!user  // Boolean guard
};
```
**Objet partagé** via Context.

### 9. Loading Guard + Provider Render (Lignes 79-84)
```tsx
if (isLoading) return null; // OU <LoadingSpinner />
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```
**Block UI** pendant load initial.

### 10. useAuth Hook - Consumer Safe (Lignes 86-94)
```tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {  // Safety
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;  // {token, login, ...}
};
```
**Utilisation** : `const { token } = useAuth();`

## Utilisation Réelle dans App

### Dans LiveStream Hook
```tsx
export function useLiveStream() {
  const { userId, token } = useAuth();  // ✅ Global access
  LiveStreamService.sendLiveStreamData(payload, token!);
}
```

### LoginScreen Flow
```tsx
const handleLogin = async () => {
  const { token: backendToken, user } = await LoginService.login(credentials);
  useAuth().login(backendToken, user);  // → State update
  navigation.navigate('Tabs');  // Auto par _layout si isAuthenticated
}
```

### _layout.tsx Protection
```tsx
function RootLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginScreen />;
  return <Tabs />;  // LiveStream accessible
}
```

## Cycle de Vie Auth

```
App Start
  ↓
loadAuthState() → SecureStore → token/user OR null
  ↓
_layout renders:
  isAuthenticated ? Tabs : Login
  ↓ Login success
login(token, user) → State update → Re-render Tabs
  ↓ Logout
logout() → null → Re-render Login
```

## Erreurs & Debug

**"useAuth outside Provider"** :
```
❌ <Tabs /> sans <AuthProvider>
✅ <AuthProvider><App /></AuthProvider>
```

**Token null** :
```
❌ Backend 401
✅ LoginService → AuthContext.login() avant API calls
```

## Production Checklist

```
✅ [ ] npx expo install expo-secure-store
✅ [ ] Login/Register Services implémentés
✅ [ ] Backend JWT validation
✅ [ ] Token refresh interceptor
✅ [ ] Protected routes
```

**Test** :
```
1. App start → mock user auto
2. LiveStream → useAuth().token dans headers ✅
3. Logout → LoginScreen
```

Fin cours AuthContext **ultra-détaillé** ! 🔥
