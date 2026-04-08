# Documentation Complète — Méthodes & Fonctions AlertCivique

> Projet : Application de signalement d'urgence citoyenne  
> Stack : React Native (Expo) + Spring Boot + Node.js (Socket.io)

---

## Table des matières

1. [Contextes React (Contexts)](#1-contextes-react)
2. [Hooks personnalisés](#2-hooks-personnalisés)
3. [Services Frontend](#3-services-frontend)
4. [Composants clés](#4-composants-clés)
5. [Backend — Services Java](#5-backend--services-java)
6. [Backend — Contrôleurs Java](#6-backend--contrôleurs-java)
7. [Backend — Service Email](#7-backend--service-email)
8. [Modèles & Interfaces](#8-modèles--interfaces)
9. [Flux principaux](#9-flux-principaux)

---

## 1. Contextes React

### `AuthContext.tsx`

Gère la session utilisateur (token JWT + données utilisateur) avec persistance via `AsyncStorage`.

```
Provider : AuthProvider({ children })
```
- Charge la session sauvegardée au montage (AsyncStorage)
- Fournit `user`, `token`, `login`, `logout`, `isAuthenticated` à toute l'arborescence

---

#### `login(newToken, newUser)` → `Promise<void>`
| Paramètre | Type | Description |
|-----------|------|-------------|
| `newToken` | `string` | JWT retourné par le backend |
| `newUser` | `User` | Objet `{ userId, name, email }` |

Sauvegarde le token et l'utilisateur dans AsyncStorage, puis met à jour le state React.  
**Important** : doit être appelé APRÈS la sauvegarde des contacts de confiance pour éviter les conditions de course.

---

#### `logout()` → `Promise<void>`
Supprime `auth_token` et `user_data` d'AsyncStorage et remet le state à `null`.

---

#### `useAuth()` → `AuthContextType`
Hook d'accès au contexte. Retourne `{ user, token, login, logout, isAuthenticated }`.  
Lève une erreur si utilisé en dehors d'`AuthProvider`.

---

### `AlertContext.tsx`

Gère le type d'alerte actif (agression / accident / incendie) et sa configuration visuelle.

```typescript
export type AlertType = 'agression' | 'accident' | 'incendie';

export const ALERT_CONFIGS: Record<AlertType, AlertConfig> = {
  agression: { label: 'Agression', emoji: '🚨', color: '#e53935', markerBg: '#e53935', chatLabel: '🚨 AGRESSION signalée' },
  accident:  { label: 'Accident',  emoji: '🚗', color: '#FF6F00', markerBg: '#FF6F00', chatLabel: '🚗 ACCIDENT signalé'  },
  incendie:  { label: 'Incendie',  emoji: '🔥', color: '#FF3D00', markerBg: '#FF3D00', chatLabel: '🔥 INCENDIE signalé'  },
};
```

---

#### `setAlertType(type: AlertType)` → `void`
Met à jour le type d'alerte actif. Déclenche en cascade :
- Changement du marqueur sur la carte (via `postMessage`)
- Clignotement du bouton chat
- Envoi de la carte de rapport dans le chat

---

#### `clearAlert()` → `void`
Remet `alertType` à `null`. Remet le marqueur de carte à l'état par défaut.

---

#### `useAlert()` → `AlertContextType`
Hook d'accès. Retourne `{ alertType, setAlertType, clearAlert }`.

---

### `MessagesContext.tsx`

Crée **une seule instance Socket.io** partagée dans toute l'application. Résout le problème des doubles connexions socket.

```
Provider : MessagesProvider({ children })
```
- Se connecte au serveur Node.js (`NODE_BASE_URL`)
- Gère : historique des messages, connexion/déconnexion, messages temps réel, alertes système

---

#### `sendMessage()` → `void`
Émet l'événement `sendMessage` sur le socket avec le message texte de l'input.  
Pré-conditions : `inputText` non vide, socket connecté, utilisateur initialisé.  
Déclenche un scroll vers le bas de la liste.

---

#### `sendAlertReport(type: AlertType)` → `void`
Crée une carte de signalement d'incident dans le chat :
- `type: 'report'` + `alertType` pour l'affichage coloré dans `Messages.tsx`
- Émis sur le socket si connecté (sinon ajouté localement uniquement)
- Ajout immédiat dans le state local → visible instantanément

---

#### `setInputText(text: string)` → `void`
Contrôle la valeur du champ de saisie du chat.

---

#### `useMessagesContext()` → `MessagesContextType`
Hook d'accès. Retourne l'intégralité du contexte chat. Lève une erreur si utilisé hors `MessagesProvider`.

---

## 2. Hooks personnalisés

### `useRegister.ts`

Orchestre tout le flux d'inscription : validation → enregistrement → login automatique → sauvegarde contacts.

---

#### `validateForm()` → `FormErrors`
Valide les champs avec des expressions régulières :
- **Prénom/Nom** : lettres et accents uniquement
- **Email** : format standard RFC
- **Téléphone** : format international ou français
- **Date de naissance** : format `JJ/MM/AAAA`
- **Mot de passe** : min 8 caractères, majuscule, chiffre, caractère spécial
- **Contact person1** : nom + téléphone obligatoires

Retourne un objet `FormErrors` avec les messages d'erreur par champ.

---

#### `handleChange(field, value)` → `void`
Met à jour un champ du formulaire principal et efface l'erreur associée.

---

#### `handleTrustedContactChange(person, field, value)` → `void`
| Paramètre | Type | Description |
|-----------|------|-------------|
| `person` | `'person1' \| 'person2' \| 'person3'` | Quel contact modifier |
| `field` | `'name' \| 'email' \| 'phone'` | Champ à modifier |
| `value` | `string` | Nouvelle valeur |

---

#### `register()` → `Promise<boolean>`
Flux complet en 5 étapes :
1. `validateForm()` — arrêt si erreurs
2. `RegisterService.registerUser()` — création du compte backend
3. `loginUser()` — auto-connexion immédiate
4. `Promise.allSettled(...)` — sauvegarde des contacts (non bloquant)
5. `login(token, user)` — persistance de session

Retourne `true` si succès, `false` sinon.

---

#### `resetForm()` → `void`
Remet tous les champs et erreurs à zéro.

---

### `useReportFlow.ts`

Flux complet du bouton SOS : GPS → signalement → notifications → contacts.

---

#### `triggerSos()` → `Promise<ReportFlowResult>`
6 étapes séquentielles :

| Étape | Action |
|-------|--------|
| 1 | GPS haute précision + géocodage inverse (adresse lisible) |
| 2 | Création du Report + Géolocalisation en parallèle (`Promise.all`) |
| 3a | Push notification à l'utilisateur |
| 3b | Alerte aux autorités (`autorites@alertcivique.fr`) |
| 3c | Notification individuelle à chaque contact de confiance |
| 4 | Mode offline si réseau indisponible (sauvegarde AsyncStorage) |

Retourne `ReportFlowResult` avec tous les statuts.

---

#### `retryOfflineQueue()` → `Promise<void>`
Récupère la file `@report_offline_queue` dans AsyncStorage.  
Remballe et renvoie chaque rapport qui a un `userId` valide.  
Conserve les échecs dans la queue pour la prochaine tentative.

---

#### `saveOffline(payload)` → `Promise<void>`
Empile un signalement dans `@report_offline_queue` (AsyncStorage).  
Ajoute `savedAt: ISO string` pour traçabilité.

---

#### `reset()` → `void`
Remet `state` à `'idle'` et `result` à `null`.

---

### `useLiveStreamManager.ts`

Orchestre les 4 sous-hooks : caméra, enregistrement, API livestream, upload vidéo.

```typescript
useLiveStreamManager(autoStart?, onComplete?, reportId?, alertType?)
```

---

#### `toggleCamera()` → `Promise<void>`
**Si caméra inactive :**
- Réinitialise l'URI vidéo
- Active la caméra

**Si caméra active :**
1. Stop enregistrement → récupère l'URI vidéo
2. `sendStopStream()` — notifie le backend
3. Upload vidéo → `updateStreamWithVideo()` associe l'URL
4. Notification contacts de confiance (email + SMS)
5. `onComplete?.()` — callback de fin
6. Désactive la caméra

---

#### Effets `useEffect` internes

| Effet | Déclencheur | Action |
|-------|-------------|--------|
| Init caméra | `isCameraActive` change | `initializeCamera()` |
| Start stream | Caméra active + initialisée | `sendStartStream()` + `startRecording()` |
| Auto-start | `autoStart=true` + permission OK | `toggleCameraRef.current()` |
| Montage | — | `checkCameraPermission()` + `loadStreams()` |

---

### `useLiveStreamApi.ts`

Couche de communication avec l'API livestream backend.

---

#### `sendStartStream(facing)` → `Promise<number | null>`
Envoie au backend :
```json
{
  "userId": "123",
  "facing": "back",
  "startedAt": "2024-01-01T10:00:00.000Z",
  "reportId": 5,
  "alertType": "incendie"
}
```
Fallback : si le serveur est indisponible, génère un ID local `Date.now()` pour ne pas bloquer l'enregistrement.

---

#### `sendStopStream()` → `Promise<void>`
Calcule la durée : `(Date.now() - startTimeRef) / 1000`.  
Envoie `{ userId, endedAt, duration, livestreamId }` au backend.

---

#### `updateStreamWithVideo(videoUrl, videoId?)` → `Promise<void>`
Associe l'URL de la vidéo uploadée au livestream en base de données.

---

#### `loadStreams()` → `Promise<void>`
Récupère la liste des livestreams depuis le backend et met à jour `streams`.

---

### `useVideoUpload.ts`

Upload de vidéo + notification des contacts de confiance.

```typescript
useVideoUpload(token?, userId?, alertType?, senderName?)
```

---

#### `uploadVideo(videoUri, livestreamId)` → `Promise<{ url, videoId } | null>`
1. `FileSystem.getInfoAsync(videoUri)` — vérifie que le fichier existe
2. `MediaService.uploadVideo()` — envoi multipart au backend
3. Si succès → `ContactAlertService.notifyContacts()` (email + SMS à chaque contact)
4. Affiche une alerte avec les statuts : `✅ Email`, `✅ SMS`, `💚 Message de bienveillance`

---

### `useVideoRecording.ts`

Gestion du cycle de vie de l'enregistrement vidéo.

---

#### `startRecording(cameraRef)` → `Promise<boolean>`
Démarre l'enregistrement avec `recordAsync({ maxDuration: 60 })`.  
Vérifie les permissions audio avant. Retourne `true` si démarré avec succès.

---

#### `stopRecording(cameraRef)` → `Promise<string | null>`
Appelle `stopRecording()` sur la caméra.  
Retourne l'URI du fichier vidéo ou `null` en cas d'erreur.

---

#### `resetVideoUri()` → `void`
Efface l'URI de la dernière vidéo enregistrée (préparation pour un nouveau stream).

---

### `useCameraManager.ts`

Permissions, activation et orientation caméra.

---

#### `checkCameraPermission()` → `Promise<void>`
Demande les permissions caméra ET microphone simultanément.  
Met `hasPermission` à `true` uniquement si les deux sont accordées.

---

#### `toggleCameraFacing()` → `void`
Bascule entre `'front'` et `'back'`.

---

#### `activateCamera()` / `deactivateCamera()` → `void`
Active ou désactive l'état `isCameraActive`.  
`deactivateCamera` efface aussi le timer d'initialisation.

---

#### `onCameraReady()` → `void`
Callback passé au composant `<CameraView>`. Met `cameraInitialized` à `true` quand la caméra est physiquement prête.

---

### `useTrustedContacts.ts`

CRUD complet des contacts de confiance avec `useFocusEffect` pour rechargement à la navigation.

---

#### `load()` → `Promise<void>`
`TrustedContactService.getByUserId(userId, token)` → met à jour `contacts`.  
Appelé automatiquement quand l'onglet Contact redevient actif (`useFocusEffect`).

---

#### `add()` → `Promise<void>`
Valide les champs `name` et `phone` (obligatoires), puis `TrustedContactService.create()`.  
Recharge la liste et ferme le formulaire si succès.

---

#### `remove(id)` → `Promise<void>`
`TrustedContactService.delete(id, token)` puis rechargement de la liste.

---

#### `openForm()` / `closeForm()` → `void`
Affiche/masque le formulaire d'ajout et vide les champs.

---

## 3. Services Frontend

### `LoginService.ts`

#### `loginUser(email, password, fallbackUserId?)` → `Promise<LoginResponse>`
`POST /api/auth/login`

Stratégie de parsing résiliente :
```typescript
const text = await response.text();
try {
  const json = JSON.parse(text);         // Cas normal : backend envoie JSON
  if (json?.token) return json;
} catch {}
return { token: text, userId: fallbackUserId, ... }; // Cas fallback : texte brut
```

---

### `RegisterService.ts`

#### `registerUser(payload)` → `Promise<UserResponse>`
`POST /api/auth/register`  
Retourne `{ id, firstname, lastname, email, ... }` sans mot de passe.

---

### `TrustedContactService.ts`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `getByUserId(userId, token)` | `GET /api/trusted-contacts/user/{userId}` | Tous les contacts d'un utilisateur |
| `create(data, token)` | `POST /api/trusted-contacts` | Crée un contact |
| `delete(id, token)` | `DELETE /api/trusted-contacts/{id}` | Supprime un contact |

---

### `EmergenciesAlertService.ts`

#### `create(email, message, token)` → `Promise<EmergenciesAlert | null>`
`POST /api/emergencies`

Body envoyé :
```json
{
  "email": "autorites@alertcivique.fr",
  "sentAt": "2024-01-01T10:00:00.000Z",
  "messages": [{ "message": "🚨 Alerte SOS...", "createdAt": "..." }]
}
```

---

#### `notifyTrustedContacts(contacts, message, token)` → `Promise<{ email, sent }[]>`
Envoie `create()` pour chaque contact via `Promise.allSettled` (non bloquant si un échoue).

---

### `ContactAlertService.ts`

#### `notifyContacts(userId, alertType, senderName, token)` → `Promise<ContactNotificationResult[]>`
`POST /api/trusted-contacts/notify-alert`

Body :
```json
{ "userId": 42, "alertType": "incendie", "senderName": "Jean Dupont" }
```

Réponse :
```json
[{ "contactName": "Marie", "email": "marie@...", "phone": "06...", "emailSent": true, "smsSent": true }]
```

---

### `PushNotificationService.ts`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `send(payload, token)` | `POST /api/push-notifications/send` | Envoie une push notification |
| `getByUserId(userId, token)` | `GET /api/push-notifications/user/{userId}` | Notifications d'un utilisateur |
| `getByReportId(reportId, token)` | `GET /api/push-notifications/report/{reportId}` | Notifications d'un signalement |

---

### `LiveStreamService.ts`

| Méthode | Description |
|---------|-------------|
| `sendLiveStreamData(payload, token)` | Start ou stop stream selon le payload |
| `updateLiveStream(id, data, token)` | Associe une vidéo au stream |
| `getLiveStreams(token)` | Liste tous les streams |
| `getLiveStreamById(id, token)` | Détails d'un stream |
| `xhrRequest(method, url, token, body?)` | Helper XHR interne |

---

### `MediaService.ts`

#### `uploadVideo(videoUri, token, userId?)` → `Promise<{ url, videoId }>`
`POST /api/upload/video`  
Envoie en `multipart/form-data` avec les champs `file`, `userId`.  
Retourne l'URL publique de la vidéo et son identifiant.

---

## 4. Composants clés

### `MapScreen.tsx`

Affiche la carte Leaflet dans une `WebView` et réagit aux changements d'alerte.

---

#### `buildMapHtml(latitude, longitude)` → `string`
Génère le HTML complet injecté dans la WebView :
- Initialise Leaflet avec vue centrée sur la position utilisateur
- Géocodage inverse (Nominatim) pour afficher l'adresse
- Écouteurs `message`/`window.message` pour recevoir les commandes RN

---

#### `updateMarker(alertType, emoji, color, label)` — JavaScript Leaflet interne
Remplace le marqueur par un `L.divIcon` personnalisé :
```html
<div class="alert-marker">
  <div class="alert-marker-circle" style="background: #e53935">🚨</div>
  <div class="alert-marker-label" style="background: #e53935">AGRESSION</div>
</div>
```
Le **nom de l'incident** apparaît en badge coloré sous le cercle emoji, visible directement sur la carte sans ouvrir le popup.

---

#### `resetMarker()` — JavaScript Leaflet interne
Remet l'icône Leaflet par défaut et affiche "📍 Ma position" dans le popup.

---

#### Effet React `useEffect([alertType])`
Quand `alertType` change :
- `alertType !== null` → `webViewRef.current.postMessage(JSON.stringify({ type: 'SET_ALERT', ... }))`
- `alertType === null` → `postMessage({ type: 'RESET_MARKER' })`

---

### `MessageButton.tsx`

Bouton chat avec animations d'alerte.

---

#### Animations déclenchées par `alertType`

| Animation | Comportement | Valeurs |
|-----------|-------------|---------|
| `blinkAnim` | Clignotement de l'icône | Opacité 1→0→1 (400ms) |
| `pulseAnim` | Pulsation du bouton | Scale 1→1.15→1 (500ms) |

Quand `alertType` est `null` : les deux animations sont stoppées et les valeurs remises à 1.

---

#### Badge coloré
Un point `●` apparaît en haut à droite du bouton avec la couleur de l'incident actif.

---

### `SosButton.tsx`

Bouton d'urgence principal. Déclenche `useReportFlow.triggerSos()`.

---

#### `handleSosPress()` → `Promise<void>`
1. Vérifie `isAuthenticated` (alerte si non connecté)
2. `triggerSos()` → passe en état `loading`
3. Affiche l'écran de confirmation avec les résultats

---

#### `ConfirmationScreen` (sous-composant)
Affiche le détail du résultat SOS :
- `✅ / ⚠️` Signalement créé
- `✅ / ⚠️` Position enregistrée
- `✅ / ⚠️` Notification push envoyée
- `✅ / ⚠️` Autorités alertées
- Liste nominative des contacts notifiés

---

### `CameraButton.tsx`

Bouton caméra avec sélection d'alerte avant lancement du stream.

---

#### `handlePress()` → `void`
Ouvre d'abord `AlertTypeModal` (choix Agression / Accident / Incendie).

---

#### `handleAlertSelect(type)` → `void`
1. Appelle `onAlertSelected(type)` → met à jour `AlertContext` + envoie la carte rapport dans le chat
2. Ouvre `LiveStreamScreen` avec `alertType` dans le payload

---

## 5. Backend — Services Java

### `ContactAlertServiceImpl.java`

Service d'envoi des notifications email + SMS de bienveillance aux contacts de confiance.

---

#### `notifyContacts(request)` → `List<AlertContactNotificationResult>`
Pour chaque contact de confiance de `request.userId()` :
1. `sendBienveillanceEmail(...)` — email HTML
2. `sendSmsBienveillance(...)` — SMS (simulé, prêt Twilio)

---

#### `sendBienveillanceEmail(contact, senderName, alertLabel, alertEmoji)` → `boolean`
Construit et envoie un `MimeMessage` HTML via `JavaMailSender`.  
Sujet : `"🚨 Alerte AlertCivique — Agression"`  
Retourne `false` et log l'erreur si `MessagingException`.

---

#### `buildEmailHtml(contactName, senderName, alertLabel, alertEmoji)` → `String`
Génère l'email HTML avec :
- Bandeau coloré avec l'emoji et le type d'alerte
- Texte informatif sur l'alerte et le déclencheur
- Encadré orange : "🏛️ Les autorités ont été notifiées"
- Encadré vert : "💚 Merci d'être là pour vos proches"

---

#### `sendSmsBienveillance(contact, senderName, alertLabel)` → `boolean`
**Actuellement simulé** (log INFO).  
SMS type :
```
🚨 AlertCivique : Jean Dupont a déclenché une alerte Incendie.
Les autorités ont été notifiées. Veuillez contacter Jean Dupont
pour vous assurer de son bien-être.
```
> **Pour activer** : remplacer le `log.info` par un appel Twilio (`TwilioSmsClient.send(phone, body)`).

---

#### `resolveAlertLabel(alertType)` / `resolveAlertEmoji(alertType)`
Tables de mapping :

| alertType | label | emoji |
|-----------|-------|-------|
| `agression` | Agression | 🚨 |
| `accident` | Accident | 🚗 |
| `incendie` | Incendie | 🔥 |
| autre | valeur brute | 🚨 |

---

### `TrustedContactServiceImpl.java`

CRUD complet des contacts de confiance.

| Méthode | Description |
|---------|-------------|
| `createTrustedContact(dto)` | Mappe DTO → Entity → sauvegarde → retourne DTO |
| `getAllTrustedContacts()` | Récupère tous les contacts, mappe en DTOs |
| `getTrustedContactById(id)` | Cherche par ID, lève `RuntimeException` si absent |
| `updateTrustedContact(id, dto)` | Met à jour name, email, phone et sauvegarde |
| `deleteTrustedContact(id)` | Cherche puis supprime, lève exception si absent |
| `getByUserId(userId)` | Filtre par `userId` via `findByUserId()` du repository |

---

### `RegisterService.java`

Inscription complète avec sécurité.

---

#### `register(request)` → `UserResponseDto`
Pipeline complet :
1. Validation null/blank de chaque champ
2. Sanitisation XSS via OWASP Encoder
3. Unicité de l'email (`UserRepository.findByEmail`)
4. Validation politique de mot de passe (regex)
5. Hachage Argon2 du mot de passe
6. Attribution du rôle `ROLE_CLIENT`
7. Persistance en base
8. Génération token d'activation JWT (24h)
9. TODO : envoi email d'activation

---

## 6. Backend — Contrôleurs Java

### `TrustedContactController.java`

Base URL : `/api/trusted-contacts`

| Méthode HTTP | Endpoint | Méthode Java | Description |
|-------------|----------|--------------|-------------|
| `POST` | `/` | `createTrustedContact` | Crée un contact (201) |
| `GET` | `/{id}` | `getTrustedContact` | Contact par ID (200 / 404) |
| `GET` | `/` | `getAllTrustedContacts` | Tous les contacts |
| `GET` | `/user/{userId}` | `getContactsByUserId` | Contacts d'un utilisateur |
| `PUT` | `/{id}` | `updateTrustedContact` | Mise à jour (200 / 404) |
| `DELETE` | `/{id}` | `deleteTrustedContact` | Suppression (204 / 404) |
| `POST` | `/notify-alert` | `notifyAlert` | Notifie les contacts (email+SMS) |

---

#### `notifyAlert(request)` → `ResponseEntity<List<AlertContactNotificationResult>>`
Body attendu :
```json
{ "userId": 42, "alertType": "incendie", "senderName": "Jean Dupont" }
```
Délègue à `ContactAlertService.notifyContacts()`.  
Retourne `500` si erreur non gérée.

---

### `AuthController.java`

Base URL : `/api/auth`

---

#### `login(loginRequest)` → `ResponseEntity<?>`
`POST /api/auth/login`

Retourne `LoginResponseDto` :
```json
{
  "token": "eyJhbGci...",
  "userId": 42,
  "email": "jean@example.com",
  "firstname": "Jean",
  "lastname": "Dupont"
}
```

---

#### `register(request)` → `ResponseEntity<UserResponseDto>`
`POST /api/auth/register`  
Délègue à `RegisterService.register()`.  
Retourne `201 Created` avec les données utilisateur (sans mot de passe).

---

## 7. Backend — Service Email

### `EmailService.java`

#### `sendEmail(user, strategy)` → `void`
Envoie un email HTML/texte à un utilisateur via `JavaMailSender`.  
- `strategy.getSubject()` → sujet du mail
- `strategy.getContext()` → paires clé/valeur du contenu
- Gère `MailException` et `MessagingException` (log + pas de propagation)

---

**Stratégies existantes :**
| Classe | Usage |
|--------|-------|
| `AccountCreatedEmailStrategy` | Email de bienvenue à l'inscription |
| `AccountActivatedEmailStrategy` | Confirmation d'activation du compte |

> `ContactAlertServiceImpl` n'utilise pas `EmailService` mais `JavaMailSender` directement pour envoyer des emails aux contacts externes (non utilisateurs enregistrés).

---

## 8. Modèles & Interfaces

### Frontend

```typescript
// AuthContext
interface User {
  userId: number;
  name?: string;
  email?: string;
}

// MessagesContext
interface ChatUser { id: string; name: string; }
interface Message {
  id: string; text: string; sender: string; senderId: string;
  timestamp: string;
  type?: 'text' | 'alert' | 'system' | 'report';
  alertType?: AlertType;
}

// AlertContext
interface AlertConfig {
  label: string; emoji: string; color: string;
  markerBg: string; chatLabel: string;
}

// useReportFlow
interface ReportFlowResult {
  reportId: number | null;
  geolocalisationId: number | null;
  latitude: number | null;
  longitude: number | null;
  offline: boolean;
  pushNotificationSent: boolean;
  authorityAlertSent: boolean;
  trustedContactsNotified: TrustedContactNotification[];
  error?: 'not_authenticated' | 'server_error';
}

// TrustedContact
interface TrustedContact {
  id?: number; name: string; email: string; phone: string; userId?: number;
}

// LiveStream
interface LiveStream {
  livestreamId?: number; userId?: string; startedAt?: string;
  status?: string; endedAt?: string; duration?: number;
  videoUrl?: string; videoId?: string;
}
```

### Backend (DTOs)

```java
// Inscription / Login
record UserRegisterRequestDto(String firstname, String lastname, String email,
    String password, String phone, String birthdate) {}
record LoginResponseDto(String token, Long userId, String email,
    String firstname, String lastname) {}

// Contacts
record TrustedContactDTO(Long id, String name, String email, String phone, Long userId) {}
record AlertContactNotificationRequest(Long userId, String alertType, String senderName) {}
record AlertContactNotificationResult(String contactName, String email, String phone,
    boolean emailSent, boolean smsSent) {}
```

---

## 9. Flux principaux

### Flux Inscription → Session automatique

```
useRegister.register()
  ├── validateForm()              ← regex sur tous les champs
  ├── RegisterService.registerUser()   ← POST /api/auth/register
  ├── loginUser(email, password)  ← POST /api/auth/login  → JWT
  ├── Promise.allSettled([contacts.map(TrustedContactService.create)])
  └── AuthContext.login(token, user)  ← sauvegarde AsyncStorage
```

### Flux SOS

```
SosButton.handleSosPress()
  └── useReportFlow.triggerSos()
        ├── GPS (Location.getCurrentPositionAsync)
        ├── reverseGeocode (Nominatim)
        ├── Promise.all([ReportService.createReport, GeolocalisationService.create])
        ├── PushNotificationService.send(userId, message)
        ├── EmergenciesAlertService.create(autorityEmail, message)
        └── EmergenciesAlertService.notifyTrustedContacts(contacts, message)
```

### Flux Alerte + Vidéo

```
CameraButton.handlePress()
  └── AlertTypeModal → sélection type
        ├── AlertContext.setAlertType(type)     ← marker carte + badge bouton chat
        ├── MessagesContext.sendAlertReport(type) ← carte dans le chat
        └── LiveStreamScreen (autoStart=true, alertType)
              └── useLiveStreamManager
                    ├── useCameraManager → permissions + activation
                    ├── useLiveStreamAPI.sendStartStream(facing) → POST /api/livestream
                    ├── useVideoRecording.startRecording() → recordAsync(60s)
                    ├── useVideoRecording.stopRecording() → videoUri
                    ├── useLiveStreamAPI.sendStopStream() → durée
                    ├── useVideoUpload.uploadVideo(videoUri)
                    │     ├── MediaService.uploadVideo() → POST /api/upload/video
                    │     └── ContactAlertService.notifyContacts(userId, alertType, name)
                    │           └── POST /api/trusted-contacts/notify-alert
                    │                 ├── sendBienveillanceEmail() → JavaMailSender
                    │                 └── sendSmsBienveillance()   → [simulé/Twilio]
                    └── useLiveStreamAPI.updateStreamWithVideo(url)
```

### Flux Socket.io (Chat temps réel)

```
MessagesProvider (montage app)
  └── io(NODE_BASE_URL)
        ├── on('connect')       → emit('userConnect') + emit('getMessageHistory')
        ├── on('userInfo')      → setUser(userData)
        ├── on('messageHistory')→ setMessages(history)
        ├── on('newMessage')    → setMessages(prev => [...prev, msg])
        ├── on('userConnected') → message système "X a rejoint"
        ├── on('userDisconnected')→ message système "X a quitté"
        ├── on('alertMessage')  → carte alerte rouge dans le chat
        └── on('disconnect')    → setIsConnected(false)
```

---

*Document généré le 05/04/2026 — AlertCivique v1.0*
