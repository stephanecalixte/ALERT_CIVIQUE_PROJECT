# Cours complet — Inscription & Session automatique
## Projet Alert Civique — React Native + Spring Boot

---

## Table des matières

1. [Vue d'ensemble du flux](#1-vue-densemble-du-flux)
2. [Le backend Java — Inscription](#2-le-backend-java--inscription)
3. [Le backend Java — Login](#3-le-backend-java--login)
4. [Le frontend — Modèles de données](#4-le-frontend--modèles-de-données)
5. [Le service d'inscription](#5-le-service-dinscription)
6. [Le service de login](#6-le-service-de-login)
7. [Le hook useRegister](#7-le-hook-useregister)
8. [Le contexte d'authentification AuthContext](#8-le-contexte-dauthentification-authcontext)
9. [La persistance de session avec AsyncStorage](#9-la-persistance-de-session-avec-asyncstorage)
10. [Le layout racine — navigation automatique](#10-le-layout-racine--navigation-automatique)
11. [Le service des contacts de confiance](#11-le-service-des-contacts-de-confiance)
12. [Schéma complet du flux](#12-schéma-complet-du-flux)
13. [Erreurs fréquentes et solutions](#13-erreurs-fréquentes-et-solutions)

---

## 1. Vue d'ensemble du flux

Quand un utilisateur s'inscrit, voici les étapes dans l'ordre :

```
[Formulaire] → [Validation] → [POST /api/auth/register] → [POST /api/auth/login]
     → [Sauvegarde contacts] → [AsyncStorage] → [App principale]
```

À chaque redémarrage de l'app :

```
[Démarrage] → [Lecture AsyncStorage] → token trouvé ? → [App principale]
                                     → token absent ? → [RegisterScreen]
```

---

## 2. Le backend Java — Inscription

### Fichier : `UserRegisterRequestDto.java`

C'est l'objet que le frontend envoie en JSON au backend.

```java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserRegisterRequestDto {

    @NotBlank
    @Pattern(regexp = "^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\\s'\\-]{1,47}$")
    private String firstname;   // Prénom — lettres uniquement

    @NotBlank
    private String lastname;    // Nom de famille

    @NotBlank @Email
    private String email;       // Email valide

    @NotBlank @ValidPassword
    private String password;    // Mot de passe fort (règles custom)

    @Pattern(regexp = "^[0-9+ ]{8,20}$")
    private String phone;       // Téléphone : 8-20 chiffres/espaces/+

    @Past
    private LocalDate birthdate; // Date passée obligatoire
}
```

**Explication des annotations :**

| Annotation | Rôle |
|---|---|
| `@NotBlank` | Le champ ne peut pas être null ni vide |
| `@Pattern(regexp)` | Valide avec une expression régulière |
| `@Email` | Vérifie le format email |
| `@Past` | La date doit être dans le passé |
| `@ValidPassword` | Annotation custom (12 chars, maj, chiffre, symbole) |
| `@Getter @Setter` | Lombok génère automatiquement les getters/setters |

---

### Fichier : `RegisterService.java`

```java
public UserResponseDto register(UserRegisterRequestDto request) throws Exception {

    // 1. Vérification que l'email n'est pas déjà utilisé
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new IllegalArgumentException("Email déjà utilisé");
    }

    // 2. Validation du mot de passe (règles business)
    passwordValidator.validate(request.getPassword());

    // 3. Hachage du mot de passe — jamais stocker en clair !
    String hashedPassword = passwordService.hash(request.getPassword());

    // 4. Récupération du rôle par défaut en base de données
    Roles defaultRole = roleRepository.findFirstByName("ROLE_CLIENT")
            .orElseThrow(() -> new EntityNotFoundException("Rôle introuvable"));

    // 5. Construction de l'entité User
    Users user = Users.builder()
            .firstname(request.getFirstname())
            .email(request.getEmail().toLowerCase()) // toujours en minuscule
            .password(hashedPassword)
            .active(true)
            .createdAt(LocalDateTime.now())
            .roles(Set.of(defaultRole))
            .build();

    // 6. Sauvegarde en base
    userRepository.save(user);

    // 7. Retourne les infos sans le mot de passe
    return DtoConverter.toUserResponseDto(user);
}
```

**Pourquoi hacher le mot de passe ?**
On n'enregistre JAMAIS un mot de passe en clair en base. Si la base est piratée,
les mots de passe restent illisibles. Ici on utilise Argon2 (plus sécurisé que BCrypt).

```
Mot de passe saisi :  "MonMotDePasse123!"
Après hachage :       "$argon2id$v=19$m=65536,t=3,p=4$..."
```

---

### Fichier : `UserResponseDto.java`

Ce que le backend renvoie après inscription :

```java
public class UserResponseDto {
    private Long id;           // ID généré automatiquement ← IMPORTANT pour les contacts
    private String firstname;
    private String lastname;
    private String email;
    private LocalDate birthdate;
    private Boolean active;
    private LocalDateTime createdAt;
    private Set<Roles> roles;
    // ⚠️ PAS de mot de passe dans la réponse — sécurité
}
```

---

## 3. Le backend Java — Login

### Fichier : `AuthController.java` — endpoint login

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
    try {
        // 1. Spring Security vérifie email + mot de passe
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),   // email
                loginRequest.getPassword()
            )
        );

        // 2. Génération du token JWT
        String token = jwtService.generateToken(loginRequest.getUsername());

        // 3. Récupération de l'utilisateur pour avoir son ID
        Users user = userRepository.findByEmail(loginRequest.getUsername())
                .orElseThrow();

        // 4. Réponse avec token + infos utilisateur
        return ResponseEntity.ok(LoginResponseDto.builder()
                .token(token)
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .build());

    } catch (BadCredentialsException e) {
        return ResponseEntity.status(401).body("Identifiants incorrects");
    }
}
```

### Fichier : `JwtService.java` — génération du token

```java
public String generateToken(String username) {
    return Jwts.builder()
            .setSubject(username)          // qui est l'utilisateur (email)
            .setIssuedAt(new Date())       // quand le token a été créé
            .setExpiration(new Date(      
                System.currentTimeMillis() + 1000 * 60 * 60  // expire dans 1h
            ))
            .signWith(getSignKey(), SignatureAlgorithm.HS256) // signature
            .compact();
}
```

**Qu'est-ce qu'un JWT ?**

Un JWT (JSON Web Token) est une chaîne en 3 parties séparées par des `.` :

```
eyJhbGciOiJIUzI1NiJ9         ← Header  (algorithme)
.eyJzdWIiOiJ1c2VyQGV4YW1...  ← Payload (données : email, expiration)
.SflKxwRJSMeKKF2QT4fwpMe...  ← Signature (vérification d'intégrité)
```

Le frontend envoie ce token dans chaque requête :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 4. Le frontend — Modèles de données

### Fichier : `models/User.ts`

```typescript
// Ce que le frontend envoie pour s'inscrire
export interface UserRegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  birthdate: string;          // format : "1990-06-15"
  trustedContacts: {
    person1: TrustedContactInput;  // obligatoire
    person2: TrustedContactInput;  // optionnel
    person3: TrustedContactInput;  // optionnel
  };
}

// Un contact de confiance
export interface TrustedContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smsEnabled: boolean;
}

// Ce que le backend renvoie après inscription
export interface UserResponse {
  id: number;        // ← L'ID du nouvel utilisateur
  firstname: string;
  lastname: string;
  email: string;
  birthdate?: string;
  active?: boolean;
  createdAt?: string;
  roles?: Role[];
  // PAS de mot de passe
}
```

---

## 5. Le service d'inscription

### Fichier : `app/lib/services/RegisterService.ts`

```typescript
export async function registerUser(payload: UserRegisterRequest): Promise<UserResponse> {

  // 1. Appel HTTP POST vers Spring Boot
  const response = await fetch(`${JAVA_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),   // objet JS → chaîne JSON
  });

  // 2. Lecture de la réponse en texte brut
  const text = await response.text();

  // 3. Si le serveur renvoie une erreur (400, 500...)
  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
    // Cette erreur sera attrapée par le catch dans useRegister
  }

  // 4. Conversion texte → objet JavaScript
  return JSON.parse(text) as UserResponse;
}
```

**Pourquoi `response.text()` puis `JSON.parse()` et non `response.json()` ?**

`response.json()` plante si le serveur renvoie un message d'erreur en texte brut
(ex: "Email déjà utilisé"). Avec `response.text()`, on peut lire le message
d'erreur ET parser le JSON si c'est un succès.

---

## 6. Le service de login

### Fichier : `app/lib/services/LoginService.ts`

```typescript
export interface LoginResponse {
  token: string;      // JWT à envoyer dans les prochaines requêtes
  userId: number;     // ID de l'utilisateur connecté
  email: string;
  firstname: string;
  lastname: string;
}

export async function loginUser(
  email: string,
  password: string,
  fallbackUserId = 0,   // ID de secours si le backend renvoie l'ancien format
): Promise<LoginResponse> {

  const response = await fetch(`${JAVA_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  // Essai 1 : nouveau format JSON { token, userId, email, ... }
  try {
    const json = JSON.parse(text);
    if (json?.token) return json as LoginResponse;
  } catch {}

  // Essai 2 : ancien format — token plain text
  // (compatibilité si le backend n'est pas redémarré)
  return {
    token: text,
    userId: fallbackUserId,  // on utilise l'ID venant du register
    email,
    firstname: '',
    lastname: '',
  };
}
```

**Pourquoi ce double essai ?**

Pendant le développement, le backend et le frontend évoluent en parallèle.
Si le backend n'a pas encore été redémarré avec les nouvelles modifications,
il envoie encore l'ancien format. Ce code gère les deux cas sans planter.

---

## 7. Le hook useRegister

### Fichier : `hooks/useRegister.ts`

Un **hook** en React est une fonction qui commence par `use` et qui encapsule
de la logique réutilisable avec du state et des effets.

#### Structure du hook

```typescript
export function useRegister() {
  const { login } = useAuth();    // accès au contexte d'auth

  // État du formulaire — objet avec tous les champs
  const [form, setForm] = useState<UserRegisterRequest>({ ... });

  // État des erreurs de validation — un message par champ
  const [errors, setErrors] = useState<FormErrors>({});

  // Est-ce qu'une requête est en cours ?
  const [isLoading, setIsLoading] = useState(false);

  // L'inscription a-t-elle réussi ?
  const [isSuccess, setIsSuccess] = useState(false);

  // ... fonctions ...

  return { form, errors, isLoading, isSuccess, handleChange, register };
}
```

#### La validation — `validateForm()`

```typescript
const validateForm = useCallback((): FormErrors => {
  const newErrors: FormErrors = {};

  // Chaque règle : si invalide → ajoute un message d'erreur
  if (!form.firstname.trim()) {
    newErrors.firstname = 'Prénom requis';
  } else if (!REGEX.name.test(form.firstname.trim())) {
    newErrors.firstname = 'Prénom invalide';
  }

  // Validation du contact obligatoire
  const p1 = form.trustedContacts.person1;
  if (!p1.firstName.trim() && !p1.lastName.trim()) {
    newErrors.contact1Name = 'Le nom du contact est obligatoire';
  }
  if (!p1.phone.trim()) {
    newErrors.contact1Phone = 'Le téléphone du contact est obligatoire';
  }

  return newErrors;  // objet vide = formulaire valide
}, [form]);
```

**Pourquoi `useCallback` ?**

`useCallback` mémorise la fonction. Sans lui, `validateForm` serait
recréée à chaque rendu du composant, causant des re-rendus inutiles.
La fonction n'est recréée que quand `form` change.

---

#### Les expressions régulières (REGEX)

```typescript
const REGEX = {
  // Nom : 2-50 caractères, lettres françaises, tirets, apostrophes
  name: /^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/,

  // Email : format standard
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,

  // Téléphone : 8-20 caractères, chiffres/espaces/+
  phone: /^[0-9+ ]{8,20}$/,

  // Date : AAAA-MM-JJ avec mois 01-12 et jours 01-31
  birthdate: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

  // Mot de passe : 12+ chars, 1 maj, 1 min, 1 chiffre, 1 symbole
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{12,}$/,
};
```

**Lecture du regex mot de passe :**
```
^                   début de chaîne
(?=.*[a-z])         lookahead : contient au moins une minuscule
(?=.*[A-Z])         lookahead : contient au moins une majuscule
(?=.*\d)            lookahead : contient au moins un chiffre
(?=.*[!@#$%^&*()])  lookahead : contient au moins un symbole
.{12,}              12 caractères minimum (n'importe lesquels)
$                   fin de chaîne
```

---

#### La fonction principale — `register()`

```typescript
const register = useCallback(async () => {

  // ÉTAPE 0 : Validation côté client avant tout appel réseau
  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    Alert.alert('Erreur', 'Veuillez corriger les champs indiqués');
    return false;  // ← arrêt immédiat, pas d'appel réseau
  }

  setIsLoading(true);  // affiche le spinner

  try {
    // ÉTAPE 1 : Création du compte
    const userResponse = await RegisterService.registerUser(form);
    // userResponse.id contient l'ID en base → source fiable

    // ÉTAPE 2 : Auto-login pour obtenir le JWT
    const userId = userResponse.id;
    const loginResponse = await loginUser(form.email, form.password, userId);
    const token = loginResponse.token;

    // ÉTAPE 3 : Sauvegarde des contacts de confiance
    // ⚠️ AVANT login() pour éviter la race condition
    const persons = [
      form.trustedContacts.person1,
      form.trustedContacts.person2,
      form.trustedContacts.person3,
    ];

    await Promise.allSettled(
      persons
        .filter(p => p.firstName.trim() || p.lastName.trim() || p.phone.trim())
        .map(p => TrustedContactService.create({
          name: `${p.firstName.trim()} ${p.lastName.trim()}`.trim(),
          email: p.email.trim(),
          phone: p.phone.trim(),
          userId,
        }, token))
    );
    // Promise.allSettled ≠ Promise.all
    // allSettled : continue même si certains contacts échouent
    // all        : arrête tout si un seul échoue

    // ÉTAPE 4 : Ouverture de l'app (déclenche la navigation)
    await login(token, {
      userId,
      name: `${userResponse.firstname} ${userResponse.lastname}`,
      email: userResponse.email,
    });
    // Après cette ligne → AuthContext.isAuthenticated = true
    // → _layout.tsx re-render → affiche les tabs au lieu de RegisterScreen

    setIsSuccess(true);
    return true;

  } catch (error) {
    // Toute erreur réseau ou serveur atterrit ici
    Alert.alert('Erreur', error instanceof Error ? error.message : 'Échec');
    return false;
  } finally {
    setIsLoading(false);  // masque le spinner dans tous les cas
  }

}, [form, validateForm, login]);
```

**Pourquoi `Promise.allSettled` et non `Promise.all` ?**

```typescript
// Promise.all → arrête tout si UN échoue
await Promise.all([
  sauvegarderContact1(),  // OK
  sauvegarderContact2(),  // ERREUR → les 3 sont annulés
  sauvegarderContact3(),  // jamais exécuté
]);

// Promise.allSettled → continue même si certains échouent
await Promise.allSettled([
  sauvegarderContact1(),  // OK
  sauvegarderContact2(),  // ERREUR → ignorée
  sauvegarderContact3(),  // OK quand même
]);
// → contact1 et contact3 sont sauvegardés, contact2 a échoué silencieusement
```

---

#### La race condition corrigée

**Avant (bug) :**
```
login()           ← AuthContext updated → app affichée → Contact tab mount
  ↓
sauvegarder contacts  ← trop tard ! Contact tab fetch déjà fait → liste vide
```

**Après (corrigé) :**
```
sauvegarder contacts  ← contacts en base AVANT ouverture de l'app
  ↓
login()           ← app affichée → Contact tab mount → fetch → liste pleine ✅
```

---

## 8. Le contexte d'authentification AuthContext

### Fichier : `contexts/AuthContext.tsx`

Un **Context** React permet de partager des données dans tout l'arbre de composants
sans passer les props manuellement à chaque niveau.

```
AuthProvider
├── _layout.tsx          (lit isAuthenticated)
├── (tabs)/Contact.tsx   (lit token, user)
├── hooks/useTrustedContacts.ts  (lit token, user.userId)
└── ... tous les composants enfants
```

#### Création du contexte

```typescript
// 1. Définition du type — ce que le contexte expose
interface AuthContextType {
  user: User | null;           // infos utilisateur ou null
  token: string | null;        // JWT ou null
  login: (token, user) => Promise<void>;  // fonction de connexion
  logout: () => Promise<void>;            // fonction de déconnexion
  isAuthenticated: boolean;    // true si token ET user présents
}

// 2. Création avec valeur undefined par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

#### Le Provider — AuthProvider

```typescript
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);  // en cours de lecture

  // Au démarrage : lecture AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUserJson] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('user_data'),
        ]);

        if (savedToken && savedUserJson) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserJson));
          // → isAuthenticated deviendra true → app affichée
        }
        // Si rien trouvé → token/user restent null → RegisterScreen
      } finally {
        setIsLoading(false);  // lecture terminée
      }
    })();
  }, []);  // [] = exécuté UNE SEULE FOIS au montage

  // Pendant la lecture → rien affiché
  if (isLoading) return null;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user,  // !! convertit en boolean
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Que fait `!!token && !!user` ?**
```typescript
token = null          → !!null = false
token = "eyJhbGci..." → !!"eyJ..." = true

// Si les deux sont truthy → isAuthenticated = true
isAuthenticated = !!token && !!user
```

#### Le hook d'accès — useAuth

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Protection : useAuth ne peut être utilisé QUE dans un enfant d'AuthProvider
  if (!context) throw new Error('useAuth must be used within AuthProvider');

  return context;
};

// Utilisation dans un composant :
const { user, token, isAuthenticated, login, logout } = useAuth();
```

---

## 9. La persistance de session avec AsyncStorage

### Pourquoi AsyncStorage et pas SecureStore ?

| | AsyncStorage | expo-secure-store |
|---|---|---|
| Fonctionne sur Android | ✅ | ⚠️ Problèmes dans Expo Go |
| Fonctionne sur iOS | ✅ | ✅ |
| Fonctionne sur Web | ✅ | ❌ |
| Survit aux redémarrages | ✅ | ✅ en prod / ❌ Expo Go |
| Données chiffrées | ❌ | ✅ |
| Usage recommandé | Sessions, préférences | Mots de passe, clés privées |

Pour un token JWT de session, `AsyncStorage` est suffisant et beaucoup plus fiable.

### Les 4 opérations AsyncStorage

```typescript
// 1. ÉCRIRE — stocke une chaîne de caractères
await AsyncStorage.setItem('ma_clé', 'ma_valeur');

// Pour un objet, il faut le sérialiser en JSON :
await AsyncStorage.setItem('user_data', JSON.stringify({ userId: 42, email: '...' }));

// 2. LIRE — retourne null si la clé n'existe pas
const valeur = await AsyncStorage.getItem('ma_clé');
// valeur = "ma_valeur" ou null

// Pour un objet :
const json = await AsyncStorage.getItem('user_data');
const user = json ? JSON.parse(json) : null;

// 3. SUPPRIMER
await AsyncStorage.removeItem('ma_clé');

// 4. LIRE PLUSIEURS CLÉS EN PARALLÈLE (plus rapide)
const [token, userData] = await Promise.all([
  AsyncStorage.getItem('auth_token'),
  AsyncStorage.getItem('user_data'),
]);
```

### Ce qui est stocké dans ce projet

```typescript
// Clé : 'auth_token'
// Valeur : "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW..."

// Clé : 'user_data'
// Valeur : '{"userId":5,"name":"Jean Dupont","email":"jean@mail.fr"}'
```

### Cycle de vie de la session

```
INSCRIPTION
   └─ login() appelé
       ├─ AsyncStorage.setItem('auth_token', token)
       └─ AsyncStorage.setItem('user_data', JSON.stringify(user))

REDÉMARRAGE APP
   └─ AuthProvider monte
       ├─ AsyncStorage.getItem('auth_token') → token trouvé
       ├─ AsyncStorage.getItem('user_data')  → user trouvé
       └─ setToken + setUser → isAuthenticated = true → App affichée ✅

DÉCONNEXION
   └─ logout() appelé
       ├─ AsyncStorage.removeItem('auth_token')
       ├─ AsyncStorage.removeItem('user_data')
       └─ setToken(null) + setUser(null) → RegisterScreen affiché
```

---

## 10. Le layout racine — navigation automatique

### Fichier : `app/_layout.tsx`

```typescript
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Écran de chargement 4 secondes
  useEffect(() => {
    setTimeout(() => setLoading(false), 4000);
  }, []);

  // 1. Pendant les 4 secondes → LoadingPage (logo animé)
  if (loading) return <LoadingPage />;

  // 2. Pas de session → formulaire d'inscription
  if (!isAuthenticated) return <RegisterScreen />;

  // 3. Session trouvée → application complète avec tabs
  return (
    <ThemeProvider ...>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
```

**Comment la navigation est-elle automatique ?**

React re-rend le composant quand son état change.
Quand `login()` est appelé → `setToken` et `setUser` changent dans AuthContext
→ `isAuthenticated` passe de `false` à `true`
→ `AppContent` se re-rend automatiquement
→ `if (!isAuthenticated)` est maintenant false
→ l'app affiche les tabs sans aucune navigation manuelle

```
login() appelé
  → setToken("eyJ...")      ← state change
  → setUser({userId: 5})    ← state change
  → AuthContext re-render
  → AppContent re-render
  → isAuthenticated = true
  → RegisterScreen disparaît
  → Tabs apparaissent  ✅
```

---

## 11. Le service des contacts de confiance

### Fichier : `app/lib/services/TrustedContactService.ts`

```typescript
export default class TrustedContactService {

  // GET /api/trusted-contacts/user/{userId}
  static async getByUserId(userId: number, token: string): Promise<TrustedContact[]> {
    const response = await fetch(
      `${JAVA_BASE_URL}/api/trusted-contacts/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        //                         ↑ Le token JWT envoyé dans chaque requête
      }
    );
    if (!response.ok) return [];
    return await response.json();
  }

  // POST /api/trusted-contacts
  static async create(data: Omit<TrustedContact, 'id'>, token: string) {
    const response = await fetch(`${JAVA_BASE_URL}/api/trusted-contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    // ...
  }

  // DELETE /api/trusted-contacts/{id}
  static async delete(id: number, token: string): Promise<boolean> {
    const response = await fetch(
      `${JAVA_BASE_URL}/api/trusted-contacts/${id}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    return response.ok;  // true si 204 No Content
  }
}
```

**`Omit<TrustedContact, 'id'>` — qu'est-ce que ça signifie ?**

```typescript
interface TrustedContact {
  id?: number;   // généré par la base de données
  name: string;
  email: string;
  phone: string;
  userId?: number;
}

// Omit<TrustedContact, 'id'> = TrustedContact SANS le champ 'id'
// Utile pour la création : l'id est généré côté serveur, pas besoin de l'envoyer
type TrustedContactCreate = Omit<TrustedContact, 'id'>;
// = { name: string; email: string; phone: string; userId?: number; }
```

### Le hook useTrustedContacts

```typescript
export function useTrustedContacts() {
  const { token, user } = useAuth();
  const userId = user?.userId ? Number(user.userId) : null;

  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  // Chargement des contacts depuis le backend
  const load = useCallback(async () => {
    if (!userId || !token) return;  // ← garde : pas de fetch si pas connecté
    const data = await TrustedContactService.getByUserId(userId, token);
    setContacts(data);
  }, [userId, token]);

  // Chargement initial
  useEffect(() => { load(); }, [load]);

  // Rechargement chaque fois que l'écran Contact devient visible
  useFocusEffect(useCallback(() => { load(); }, [load]));
  // useFocusEffect = version de useEffect pour les écrans de navigation
  // Se déclenche quand on revient sur cet écran (pas seulement au montage)

  // Ajout d'un contact
  const add = useCallback(async () => {
    const created = await TrustedContactService.create(
      { name: form.name, email: form.email, phone: form.phone, userId },
      token
    );
    if (created) {
      setContacts(prev => [...prev, created]);  // ajout local immédiat
    }
  }, [form, userId, token]);

  // Suppression d'un contact
  const remove = useCallback(async (id: number) => {
    const ok = await TrustedContactService.delete(id, token);
    if (ok) {
      setContacts(prev => prev.filter(c => c.id !== id));  // suppression locale
    }
  }, [token]);
}
```

**Mise à jour optimiste vs re-fetch**

Il y a deux approches pour mettre à jour la liste après une action :

```typescript
// Approche 1 : Mise à jour locale immédiate (optimiste)
// → Interface réactive, pas d'attente
setContacts(prev => [...prev, newContact]);

// Approche 2 : Re-fetch depuis le backend
// → Données toujours synchronisées avec la vraie base
await load();

// Ce projet utilise l'approche 1 pour la rapidité
// useFocusEffect garantit la synchronisation quand on revient sur l'écran
```

---

## 12. Schéma complet du flux

```
┌─────────────────────────────────────────────────────┐
│                  PREMIÈRE INSCRIPTION                │
└─────────────────────────────────────────────────────┘

RegisterScreen
    │ handleChange() met à jour form state
    │ register() appelé au clic sur "Inscrire"
    ▼
useRegister.register()
    │
    ├─ validateForm() ──► erreurs ? → afficher erreurs, arrêter
    │
    ├─ POST /api/auth/register  ──► UserResponseDto { id: 5, ... }
    │
    ├─ POST /api/auth/login     ──► LoginResponseDto { token, userId: 5, ... }
    │
    ├─ POST /api/trusted-contacts (x3) ──► contacts sauvegardés en base
    │
    └─ AuthContext.login(token, { userId: 5, ... })
           │
           ├─ AsyncStorage.setItem('auth_token', token)
           ├─ AsyncStorage.setItem('user_data', '{"userId":5,...}')
           ├─ setToken(token)
           └─ setUser({ userId: 5, ... })
                  │
                  └─ isAuthenticated = true
                         │
                         └─ _layout.tsx re-render → TABS affichés ✅


┌─────────────────────────────────────────────────────┐
│              REDÉMARRAGE DE L'APPLICATION            │
└─────────────────────────────────────────────────────┘

App démarre
    │
    ▼
AuthProvider.useEffect()
    │
    ├─ AsyncStorage.getItem('auth_token')  → "eyJhbGci..."
    ├─ AsyncStorage.getItem('user_data')   → '{"userId":5,...}'
    │
    ├─ setToken("eyJhbGci...")
    ├─ setUser({ userId: 5, ... })
    └─ isLoading = false
           │
           └─ isAuthenticated = true → TABS affichés ✅ (sans réinscription)


┌─────────────────────────────────────────────────────┐
│             ONGLET CONTACT — CHARGEMENT              │
└─────────────────────────────────────────────────────┘

Contact tab mount ou focus
    │
    ▼
useTrustedContacts.load()
    │
    ├─ userId = user.userId = 5
    ├─ token = "eyJhbGci..."
    │
    └─ GET /api/trusted-contacts/user/5
           │
           └─ [{ id:1, name:"Marie Dupont", phone:"..." }, ...]
                  │
                  └─ setContacts([...]) → FlatList affiche les cartes ✅
```

---

## 13. Erreurs fréquentes et solutions

### ❌ "Unexpected token < in JSON at position 0"
Le serveur a renvoyé du HTML (page d'erreur 404/500) au lieu de JSON.
```typescript
// Cause : mauvaise URL ou serveur arrêté
// Solution : vérifier JAVA_BASE_URL dans lib/config.ts
console.log('JAVA_BASE_URL:', JAVA_BASE_URL);
```

### ❌ "Email déjà utilisé"
L'email est déjà en base. Chaque utilisateur doit avoir un email unique.
```java
// Dans RegisterService.java
if (userRepository.existsByEmail(request.getEmail())) {
    throw new IllegalArgumentException("Email déjà utilisé");
}
```

### ❌ L'app redemande l'inscription à chaque redémarrage
AsyncStorage n'a pas sauvegardé la session car `login()` n'a pas été appelé.
Vérifier dans les logs :
```
💾 Sauvegarde session userId: 5   ← doit apparaître
✅ Session sauvegardée            ← doit apparaître
```
Si absent → l'inscription a planté avant l'étape 4.

### ❌ Les contacts ne s'affichent pas
`userId` est null ou le fetch échoue.
```typescript
// Vérifier dans useTrustedContacts :
console.log('userId:', userId, 'token:', token ? '✅' : '❌');
```

### ❌ "Rôle ROLE_CLIENT introuvable en base de données"
La table `roles` est vide. Vérifier `data.sql` :
```sql
INSERT INTO roles (name) VALUES ('ROLE_CLIENT') ON CONFLICT DO NOTHING;
```

### ❌ Race condition contacts vides
Si les contacts sont sauvegardés APRÈS `login()`, l'écran Contact charge
avant que les contacts existent. Solution : toujours sauvegarder les contacts
AVANT d'appeler `login()`.
```typescript
// ✅ Ordre correct
await sauvegarderContacts();   // 1. contacts en base
await login(token, user);      // 2. ouvrir l'app
```
