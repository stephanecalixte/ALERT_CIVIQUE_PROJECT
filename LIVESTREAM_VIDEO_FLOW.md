# Cheminement complet du signal — Enregistrement & Upload MP4

## Contexte

Ce document décrit le flux complet du signal vidéo, de l'appui bouton jusqu'au stockage serveur,
ainsi que les trois bugs identifiés et les corrections appliquées.

---

## Architecture des couches

```
LiveStreamScreen.tsx          ← Vue (UI)
    └── useLiveStreamManager  ← Orchestrateur principal (hook)
            ├── useCameraManager      ← Gestion caméra & permissions
            ├── useVideoRecording     ← Enregistrement local (expo-camera)
            ├── useLiveStreamAPI      ← Appels REST vers le serveur (métadonnées)
            └── useVideoUpload        ← Upload du fichier MP4 vers le serveur
                    └── MediaService  ← HTTP multipart/form-data
```

---

## Cheminement complet du signal

### PHASE 1 — Démarrage (bouton "Démarrer Live Stream")

```
[Utilisateur appuie sur "Démarrer Live Stream"]
        │
        ▼
LiveStreamScreen → toggleCamera()               [useLiveStreamManager.ts:44]
        │
        ├─→ videoRecording.resetVideoUri()       Remet videoUri à null
        └─→ cameraManager.activateCamera()       isCameraActive = true
```

```
[useEffect déclenché par isCameraActive = true]    [useLiveStreamManager.ts:30]
        │
        ├─→ liveStreamAPI.sendStartStream(facing)
        │       │
        │       └─→ LiveStreamService.sendLiveStreamData(payload, token)
        │               │
        │               └─→ XHR POST http://<SERVER>/api/livestream/start
        │                       └─→ server.js → MongoDB: crée LiveStream { status: 'active' }
        │                               └─→ Retourne { livestreamId: N }
        │
        └─→ videoRecording.startRecording(cameraRef)  [useVideoRecording.ts:14]
                │
                ├─→ setTimeout(500ms)           Délai stabilisation caméra
                ├─→ setRecording(true)
                └─→ cameraRef.current.recordAsync({ maxDuration: 60 })
                        │
                        └─→ expo-camera démarre l'enregistrement
                                Fichier temp créé sur l'appareil :
                                  Android : file:///data/.../cache/Camera/VIDxxx.mp4
                                  iOS     : file:///tmp/VIDxxx.mov
```

---

### PHASE 2 — Enregistrement actif

```
[CameraView enregistre en continu]
        │
        └─→ recordAsync() retourne une Promise<{ uri: string }>
                (non résolue tant que l'enregistrement tourne)

[UI affiche]
        └─→ Indicateur rouge "ENREGISTREMENT EN COURS"    [LiveStreamScreen.tsx:69]
```

---

### PHASE 3 — Arrêt (bouton "Arrêter")

```
[Utilisateur appuie sur "Arrêter"]
        │
        ▼
LiveStreamScreen → toggleCamera()               [useLiveStreamManager.ts:48]
        │
        ├─→ videoRecording.stopRecording(cameraRef)       [useVideoRecording.ts:67]
        │       │
        │       ├─→ cameraRef.current.stopRecording()     Signal d'arrêt à expo-camera
        │       ├─→ await recordingPromiseRef.current     Attend la résolution de recordAsync
        │       │       └─→ .then() s'exécute en premier (enregistré avant) :
        │       │               videoUriRef.current = video.uri   ← URI du fichier local
        │       ├─→ setRecording(false)
        │       ├─→ setTimeout(1000ms)                    Attend que l'encodage finisse
        │       └─→ return videoUriRef.current            ← ex: "file:///tmp/VID_123.mov"
        │
        ├─→ liveStreamAPI.sendStopStream()
        │       └─→ XHR POST /api/livestream/end  { livestreamId, endedAt, duration }
        │               └─→ MongoDB: LiveStream { status: 'ended' }
        │
        └─→ [si videoUri && livestreamId valides]
                videoUpload.uploadVideo(videoUri, livestreamId)   [useVideoUpload.ts:7]
```

---

### PHASE 4 — Upload du fichier

```
useVideoUpload.uploadVideo(videoUri, livestreamId)
        │
        ├─→ FileSystem.getInfoAsync(videoUri)    Vérifie que le fichier existe bien
        │
        └─→ MediaService.uploadVideo(videoUri, token, userId)  [MediaService.ts:41]
                │
                ├─→ FileSystem.getInfoAsync(videoUri)          Double vérification taille
                │
                ├─→ FormData.append('video', {
                │       uri: videoUri,
                │       type: mimeType,            ← 'video/mp4' ou 'video/quicktime' (iOS)
                │       name: filename,            ← extrait de l'URI (ex: VID_123.mov)
                │   })
                │
                └─→ fetch POST http://<SERVER>/api/upload/video
                        Headers: Authorization: Bearer <token>
                        Body: multipart/form-data
```

---

### PHASE 5 — Traitement serveur

```
server.js → POST /api/upload/video               [server.js:361]
        │
        ├─→ multer.diskStorage
        │       ├─→ destination : ./uploads/videos/
        │       └─→ filename    : <uuid>.mp4  (extension issue de originalname)
        │
        ├─→ Vérifie fs.existsSync(filePath)
        │
        ├─→ MongoDB: crée Video {
        │       videoId, filename, url, size, mimeType, userId, livestreamId
        │   }
        │
        └─→ Retourne { success, videoId, url, filename, size }
                url = "http://<host>/videos/<uuid>.mp4"
```

---

### PHASE 6 — Liaison stream ↔ vidéo

```
useLiveStreamAPI.updateStreamWithVideo(url, videoId)   [useLiveStreamApi.ts:65]
        │
        └─→ LiveStreamService.updateLiveStream(livestreamId, { videoUrl, videoId }, token)
                └─→ XHR POST /api/livestream/update
                        └─→ MongoDB: LiveStream.videoUrl = url, LiveStream.videoId = id
```

---

### PHASE 7 — Nettoyage

```
cameraManager.deactivateCamera()
        ├─→ isCameraActive = false
        ├─→ cameraInitialized = false
        └─→ clearTimeout(initTimerRef)
```

---

## Les 3 bugs identifiés

### Bug 1 — BASE_URL hardcodée pour l'émulateur Android seulement

**Fichiers touchés :** `MediaService.ts`, `LiveStreamService.ts`, `SendData.ts`

```ts
// AVANT (cassé sur vrai appareil et iOS)
const BASE_URL = 'http://10.0.2.2:9091';

// APRÈS (détection automatique via Platform.OS)
import { Platform } from 'react-native';
export const SERVER_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:9091'
    : 'http://localhost:9091';
```

| Cible            | Adresse nécessaire     | Avant     |
|------------------|------------------------|-----------|
| Émulateur Android | `10.0.2.2`            | OK        |
| Simulateur iOS    | `localhost`           | ECHEC     |
| Vrai Android      | `192.168.x.x`         | ECHEC     |
| Vrai iPhone       | `192.168.x.x`         | ECHEC     |

> Pour un vrai appareil, modifier `app/lib/config.ts` avec l'IP locale de la machine.

---

### Bug 2 — MIME type hardcodé `video/mp4` (faux sur iOS)

**Fichier :** `MediaService.ts`

Sur iOS, `expo-camera.recordAsync()` produit un fichier `.mov` (QuickTime), pas `.mp4`.
Le type MIME envoyé dans le FormData était toujours `video/mp4`, incorrect pour iOS.

```ts
// AVANT
formData.append('video', {
  uri: videoUri,
  type: 'video/mp4',   // faux sur iOS → fichier .mov
  name: filename,
});

// APRÈS
const ext = filename.split('.').pop()?.toLowerCase();
const mimeType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';

formData.append('video', {
  uri: videoUri,
  type: mimeType,      // 'video/quicktime' sur iOS, 'video/mp4' sur Android
  name: filename,
});
```

---

### Bug 3 — Répertoire de sortie de l'enregistrement non contrôlable

**Fichier :** `useVideoRecording.ts`

`expo-camera v55` ne permet pas de spécifier un chemin de sortie via `recordAsync()`.
Le fichier est toujours enregistré dans le répertoire temporaire de l'OS :

| Plateforme | Chemin de sortie réel                                            |
|------------|------------------------------------------------------------------|
| Android    | `file:///data/user/0/.../cache/Camera/VID_xxx.mp4`              |
| iOS        | `file:///var/mobile/.../tmp/VID_xxx.mov`                        |

Ces fichiers sont **éphémères** et peuvent être supprimés par l'OS.
Le risque est faible si l'upload est déclenché immédiatement après l'arrêt (ce qui est le cas),
mais fragile en cas de crash, de pause ou de manque de mémoire.

**Contournement recommandé (non appliqué, à faire si besoin) :**
Copier le fichier vers `FileSystem.documentDirectory` après `stopRecording()`,
avant d'appeler `uploadVideo()`.

---

## Résumé des corrections appliquées

| Fichier                         | Correction                                      |
|---------------------------------|-------------------------------------------------|
| `app/lib/config.ts` (créé)      | `SERVER_BASE_URL` avec `Platform.OS`           |
| `app/lib/services/MediaService.ts`   | Import config + MIME type dynamique        |
| `app/lib/services/LiveStreamService.ts` | Import config                           |
| `app/lib/services/SendData.ts`   | Import config                                  |

---

## Pour aller plus loin — vrai appareil

Modifier `alert_civique_front/app/lib/config.ts` :

```ts
// Remplacer le bloc existant par :
const REAL_DEVICE_IP = '192.168.1.XX'; // ← ton IP locale (ifconfig / ipconfig)
export const SERVER_BASE_URL = `http://${REAL_DEVICE_IP}:9091`;
```

S'assurer que le serveur Node.js écoute sur `0.0.0.0` (pas seulement `localhost`) :

```js
// server.js
server.listen(PORT, '0.0.0.0', () => { ... });
```
