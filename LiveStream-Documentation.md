# Cheminement du Live Stream dans Alert-Civique

## Vue d'ensemble
Le système de live stream permet aux utilisateurs d'effectuer des diffusions vidéo en direct via l'application mobile React Native (Expo). Le flux capture la vidéo via la caméra du téléphone, notifie le backend Spring Boot de début/fin de stream, et persiste les métadonnées dans une base de données. **Note importante : Le flux vidéo lui-même n'est pas streamé vers le backend ; seule l'URL et les métadonnées sont enregistrées.**

## Architecture
```
Mobile App (React Native/Expo)
          ↓ (HTTP POST /api/livestream)
Backend Spring Boot (Java/JPA)
          ↓ (Persistance)
Base de données PostgreSQL (table: lives_stream)
```

## Détails Techniques - Frontend (alert_civique_front)

### 1. Point d'entrée : `app/(tabs)/LiveStream.tsx`
- Composant principal qui initialise le hook `useLiveStream(userId)`.
- Affiche l'interface caméra si permissions OK.
- UserId hardcodé (`"123"`) - **TODO : utiliser auth context**.

### 2. Hook Custom : `hooks/useLiveStream.ts`
Gère toute la logique métier :
```
États :
- facing: 'back' | 'front'
- isCameraActive: booléen (stream en cours)
- hasPermission: permissions caméra
- cameraRef: référence CameraView

Fonctions :
- toggleCameraFacing(): switch avant/arrière
- toggleCamera(): 
  ├─ Si démarrage : envoi payload {userId, facing, startedAt}
  ├─ Si arrêt : calcul duration, envoi {userId, endedAt, duration}
- sendStartStream() / sendStopStream() : appelle LiveStreamService
```

**Permissions** : Utilise `expo-camera/useCameraPermissions()`.

### 3. Composant UI : `components/LiveStreamCamera.tsx`
Interface utilisateur :
```
Header: Bouton Fermer (optionnel)
Corps: <CameraView ref={cameraRef} facing={facing} />
Footer: 
├─ Switch caméra (camera-reverse)
├─ Bouton principal (videocam ↔ videocam-off)
└─ Flash (placeholder)
Indicateur: "EN DIRECT" + point rouge si active
```

### 4. Service : `app/services/LiveStreamService.ts`
```
export class LiveStreamService {
  async sendLiveStreamData(payload: LiveStreamPayload)
    → SendData("/api/livestream", payload)
}
```
**LiveStreamPayload** : `{userId, startedAt?, endedAt?, duration?, facing?}`

### 5. Utilitaire HTTP : `app/services/SendData.tsx`
```
BASE_URL = "http://localhost:8082"
POST {Content-Type: application/json} vers `${BASE_URL}/api/livestream`
```

### 6. Modèle : `models/LiveStream.ts`
```typescript
interface LiveStream {
  livestreamId?: number;
  startedAt?: string;  // ISO
  endedAt?: string;
  streamUrl?: string;  // Non utilisé en frontend actuellement
  status?: string;
}
```

## Détails Techniques - Backend (alert_civique_back)

### 1. Contrôleur : `LiveStreamController.java`
```
@RestController
@RequestMapping("/api/livestream")
Endpoints :
├─ POST /create    → createLiveStream()
├─ PUT  /update    → updateLiveStream()
├─ DELETE /{id}    → deleteLiveStream()
├─ GET (all)       → getALLLiveStream()
└─ GET /{id}       → getLiveStreamById()
```
**Note** : Frontend utilise `/api/livestream` (POST), mappé à `/create`.

### 2. Service : `LiveStreamServiceImpl.java`
Implémente CRUD complet :
- **create** : Validation (streamUrl, startedAt, status obligatoires), map DTO→Entity, save().
- **update** : FindById, update champs, save().
- **delete** : FindById, delete().
- **getAll/getById** : Repository.

**@PrePersist** dans Entity : `status = "LIVE"`, `startedAt = now()`.

### 3. Entity JPA : `entity/LiveStream.java`
```
@Table("lives_stream")
Fields:
├─ livestreamId (PK, auto-inc)
├─ startedAt (LocalDateTime)
├─ endedAt (LocalDateTime)
├─ streamUrl (String)  ← À remplir manuellement (ex: URL RTMP/SRT)
└─ status (String: "LIVE", "ENDED", "SCHEDULED")
```

### 4. DTO & Mapper : `LiveStreamDTO.java` & `LiveStreamMapperService.java`
Record DTO pour transferts JSON ↔ Entity.

## Flux Complet (Séquence)

```
1. Utilisateur ouvre LiveStream.tsx
2. useLiveStream() → request permissions → OK
3. Affichage LiveStreamCamera
4. Clic ▶️ toggleCamera()
   ↓
5. sendStartStream() → LiveStreamService.sendLiveStreamData()
   ↓ POST http://localhost:8082/api/livestream/create
6. Backend: Controller → Service.create() → Repository.save()
   ↓ Entity: status="LIVE", startedAt=now()
7. UI: Indicateur "EN DIRECT"
8. Clic ⏹️ toggleCamera()
   ↓ Calcul duration
9. sendStopStream() → POST update payload
10. Backend: update endedAt, status?, save()
```

## Limitations Actuelles
- ✅ Capture vidéo locale (Expo Camera)
- ✅ Métadonnées persistées (début/fin/durée)
- ❌ **Pas de vrai streaming serveur** (streamUrl vide)
- ❌ Pas d'authentification sur API
- ❌ UserId hardcodé
- ❌ Gestion erreurs basique
- ❌ Pas de visualisation des streams existants

## Améliorations Proposées
1. **Streaming réel** : Intégrer RTMP/WebRTC (ex: expo-streaming, AWS IVS)
2. **Auth** : JWT sur API calls
3. **UI** : Liste des live streams actifs, viewer mode
4. **Notifications** : Push pour nouveaux streams
5. **Geoloc** : Associer position GPS au stream

## Diagramme Flux
```
[User] → LiveStream.tsx → useLiveStream → [Camera Permission]
                    ↓
[CameraView] ← UI Controls → toggleCamera()
                    ↓ HTTP POST
[Backend API] → Service → JPA → DB (lives_stream)
```

