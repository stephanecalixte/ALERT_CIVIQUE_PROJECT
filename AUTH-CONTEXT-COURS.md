# Cours Complet : AuthContext React Native Expo

## Objectif
Gestion centralisée auth (login/logout/token/user) avec React Context + useAuth hook.

## 1. Structure AuthContext

**Interfaces (TypeScript)**
```tsx
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
```

## 2. Provider (AuthProvider)

**Wrap app dans _layout.tsx**
```tsx
// app/_layout.tsx
<AuthProvider>
  <AppNavigator />
</AuthProvider>
```

**Implémentation AuthProvider**
```tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthState(); // Load on app start
  }, []);

  const loadAuthState = async () => {
    // TODO: expo-secure-store.getItemAsync('token')
    setToken('mock-jwt-token');
    setUser({ userId: 123 });
    setIsLoading(false);
  };

  const login = async (newToken: string, newUser: User) => {
    // TODO: expo-secure-store.setItemAsync('token', newToken)
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    // TODO: expo-secure-store.deleteItemAsync('token')
    setToken(null);
    setUser(null);
  };

  const value = {
    user, token, userId: user?.userId?.toString() || null,
    login, logout, isAuthenticated: !!token && !!user
  };

  if (isLoading) return <LoadingScreen />; // Block render

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 3. Hook d'Utilisation (useAuth)

**Dans n'importe quel composant/hook**
```tsx
const { userId, token, isAuthenticated, login } = useAuth();

// Exemple LiveStream
export function useLiveStream() {
  const { userId, token } = useAuth(); // Récup global
  // Pass token to services...
}
```

**Safety check**
```tsx
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

## 4. Flux Complet Login

**LoginScreen → LoginService → AuthController**
```
1. User email/password → LoginService.login(credentials)
2. Service → fetch POST /api/auth/login → Backend JWT
3. Backend: AuthController.validate → JwtTokenService.generate → Response {token, user}
4. LoginService success → useAuth().login(token, user)
5. App redirige → Protected screens access token via useAuth()
```

**Exemple LoginService.ts**
```tsx
export async function login(credentials) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  const { token, user } = await response.json();
  useAuth().login(token, user); // Update context
  return user;
}
```

## 5. Persistance Secure (Production)

**Install**: `npx expo install expo-secure-store`

**loadAuthState réel**
```tsx
const loadAuthState = async () => {
  try {
    const savedToken = await SecureStore.getItemAsync('authToken');
    if (savedToken) {
      const user = await SecureStore.getItemAsync('user');
      setToken(savedToken);
      setUser(JSON.parse(user!));
    }
  } catch (e) {
    console.error('SecureStore load error');
  } finally {
    setIsLoading(false);
  }
};
```

**login réel**
```tsx
const login = async (newToken, newUser) => {
  await SecureStore.setItemAsync('authToken', newToken);
  await SecureStore.setItemAsync('user', JSON.stringify(newUser));
  setToken(newToken);
  setUser(newUser);
};
```

## 6. Protected Routes (Navigation)

**_layout.tsx**
```tsx
function RootLayout() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <LoginScreen />;
  return <Tabs />; // Protected tabs (LiveStream...)
}
```

## 7. Interceptors API (Optionnel)

**Central token injection**
```tsx
// utils/api.ts
const apiFetch = (url, options = {}) => fetch(url, {
  ...options,
  headers: {
    'Authorization': `Bearer ${useAuth().token}`,
    ...options.headers
  }
});
```

## 8. Refresh Token (Avancé)

```
Backend JWT expire → POST /api/auth/refresh → newToken
Auto-refresh dans interceptor si 401
```

## Erreurs Communes

- **Hook top-level**: `useAuth()` seulement dans components/hooks
- **Provider missing**: Wrap app avec `<AuthProvider>`
- **Token null**: Mock → real SecureStore
- **Network 401**: Backend valide JWT, check /api/auth/login

## Test

```
1. LoginScreen → mock login → token/user set
2. LiveStream → useAuth().token dans headers → Backend OK
3. Logout → clear state/SecureStore → LoginScreen
```

Fin cours AuthContext 🚀

**Prochain**: Intégrez Login/Register réels + SecureStore !
