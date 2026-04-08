# Cheminement CameraButton

## Vue d'ensemble

```
CameraButton → Modal → LiveStreamScreen → useLiveStreamManager → hooks métier → API/Upload
```

---

## 1. CameraButton.tsx

```
[onPress]
  └── setShowCamera(true)
        └── <Modal> visible + animationType="slide"
              └── <LiveStreamScreen onClose={() => setShowCamera(false)} autoStart={true} />
```

**Fichier :** `components/alertButton/CameraButton.tsx`

---

## 2. LiveStreamScreen.tsx

- Reçoit `autoStart={true}` et `onClose`
- Passe `onClose` comme `onComplete` au hook
- Affiche le `<CameraView>` avec `onCameraReady`
- Affiche le spinner si `isUploading`

**Fichier :** `app/views/LiveStreamSreen.tsx`

---

## 3. useLiveStreamManager.ts

Point d'entrée principal qui orchestre tous les hooks.

```
[montage]
  ├── checkCameraPermission()
  └── loadStreams()

[hasPermission=true + autoStart=true]
  └── toggleCamera()
        └── cameraManager.activateCamera()   → isCameraActive = true

[isCameraActive=true]
  └── <CameraView> rendu
        └── onCameraReady()                  → cameraInitialized = true

[cameraInitialized=true]
  └── startStreamAndRecord()
        ├── liveStreamAPI.sendStartStream()  → POST /api/livestreams
        └── videoRecording.startRecording()  → CameraView.recordAsync()

[utilisateur appuie "Arrêter"]
  └── toggleCamera()
        ├── videoRecording.stopRecording()   → videoUri
        ├── liveStreamAPI.sendStopStream()   → PUT /api/livestreams/:id/stop
        ├── videoUpload.uploadVideo(videoUri)→ POST /upload/video  → { url, videoId }
        ├── liveStreamAPI.updateStreamWithVideo(url, videoId)
        └── onComplete()
              └── onClose()                  → Modal fermée
```

**Fichier :** `hooks/useLiveStreamManager.ts`

---

## 4. Hooks métier

| Hook | Rôle | Fichier |
|------|------|---------|
| `useCameraManager` | Permissions, activation caméra, `cameraRef`, `onCameraReady` | `hooks/useCameraManager.ts` |
| `useVideoRecording` | `startRecording()`, `stopRecording()`, état `recording` | `hooks/useVideoRecording.ts` |
| `useLiveStreamApi` | `sendStartStream()`, `sendStopStream()`, `updateStreamWithVideo()` | `hooks/useLiveStreamApi.ts` |
| `useVideoUpload` | `uploadVideo(uri)` → URL serveur | `hooks/useVideoUpload.ts` |

---

## 5. Appels API

| Étape | Méthode | Endpoint |
|-------|---------|----------|
| Démarrer stream | `POST` | `/api/livestreams` |
| Arrêter stream | `PUT` | `/api/livestreams/:id/stop` |
| Upload vidéo | `POST` | `/upload/video` |
| Lier vidéo au stream | `PUT` | `/api/livestreams/:id` |

---

## 6. États UI

| État | Affichage |
|------|-----------|
| `isLoading=true` | "Chargement..." |
| `hasPermission=false` | Bouton "Autoriser la caméra" |
| `isUploading=true` | Spinner + "Enregistrement de la vidéo..." |
| `isCameraActive=true` | CameraView + bouton "Arrêter" + indicateur REC |
| `recording=true` | Point rouge clignotant "ENREGISTREMENT EN COURS" |
