# Résumé de session — Alert Civique

## 1. Composant Audio (MicButton)

- **Supprimé** : `app/views/AudioRecordScreen.tsx` (cassé, import introuvable)
- **Créé** : `components/AudioRecordScreen.tsx`
  - Enregistrement audio via caméra cachée 1×1 (expo-camera `recordAsync`)
  - UI neumorphique avec minuteur et animation pulse
- **Mis à jour** : `components/alertButton/MicButton.tsx`
  - Import corrigé vers le nouveau fichier

---

## 2. Header — Logo & Safe Area

- **Mis à jour** : `app/(tabs)/_layout.tsx`
  - Ajout du `ShieldLogo` SVG (identique à la LoadingPage)
  - Correction : logo caché derrière la encoche caméra → fix via `useSafeAreaInsets`
  - Conteneur neumorphique autour du logo (ombre claire/sombre)
  - Suppression de l'icône loupe

---

## 3. Configuration Backend

- **Mis à jour** : `lib/config.ts`

```ts
JAVA_BASE_URL  → port 9090  (logique métier)
NODE_BASE_URL  → port 9091  (Socket.IO + upload vidéo)
SERVER_BASE_URL → alias NODE_BASE_URL (compatibilité)
```

- Détection automatique de l'IP via `Constants.expoConfig.hostUri`
- Fallback Android emulator `10.0.2.2`, fallback `localhost`

---

## 4. Alignement Modèles ↔ Backend Java

### `models/User.ts`
- `UserResponse` aligné sur `UserResponseDto` Java : `id, firstname, lastname, email, birthdate, active, createdAt, roles[]`
- Ajout interface `Role { roleId, name }`
- Suppression du champ `trustedContacts` (inexistant côté Java)

### `models/LiveStream.ts`
- `status` typé en union : `'LIVE' | 'ENDED' | 'SCHEDULED'`
- Ajout champ `userId`

### `models/enums.ts`
- `ReportsStatus` complété :
  - Ajout `IN_REVIEW`, `ARCHIVED`, `RESOLVED`

---

## 5. Services — Alignement avec Java

| Fichier | Endpoint | Modification |
|---|---|---|
| `LoginService.ts` | `POST /api/auth/login` | Envoie `{ username, password }`, reçoit JWT plain text |
| `RegisterService.ts` | `POST /api/auth/register` | Typé `UserRegisterRequest → UserResponse` |
| `LiveStreamService.ts` | `POST/PUT /api/livestream` | Status `'LIVE'`/`'ENDED'`, XHR helper, `JAVA_BASE_URL` |
| `ReportService.ts` | `POST/GET/PUT /api/report` | `JAVA_BASE_URL` + Bearer token, réécrit complet |
| `GeolocalisationService.ts` | `POST/PUT /api/geolocations` | **Nouveau fichier** créé de zéro |

---

## 6. Flux SOS — Diagramme d'activité implémenté

### Hook `hooks/useReportFlow.ts` (nouveau)

Orchestre le flux complet à l'appui du bouton SOS :

```
SOS appuyé
  │
  ├─ 1. GPS (expo-location) → latitude, longitude, adresse
  │
  ├─ 2. Envoi parallèle (Promise.all)
  │     ├─ POST /api/report       → reportId
  │     └─ POST /api/geolocations → geolocalisationId
  │
  ├─ Si erreur réseau
  │     └─ Sauvegarde AsyncStorage (offline queue)
  │         └─ retryOfflineQueue() disponible au retour en ligne
  │
  └─ Retourne { reportId, geolocalisationId, latitude, longitude, offline }
```

### `components/alertButton/SosButton.tsx`
- Appelle `triggerSos()` à l'appui
- Affiche un spinner `ActivityIndicator` pendant la localisation et l'envoi
- Ouvre `LiveStreamScreen` avec le `reportId` une fois le report créé

### Propagation du `reportId`

```
SosButton
  └─ useReportFlow → reportId
       └─ LiveStreamScreen (prop reportId)
            └─ useLiveStreamManager (param reportId)
                 └─ useLiveStreamAPI (param reportId)
                      └─ payload du stream enrichi avec reportId
```

---

## 7. Documentation créée

- `CAMERA-BUTTON-FLOW.md` — Cheminement complet du flux CameraButton
- `RESUME-SESSION.md` — Ce fichier
