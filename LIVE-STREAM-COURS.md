# Cours Complet : Cheminement LiveStream Enregistrement Alert Civique

## Architecture Globale
Frontend (Expo RN) ↔ Backend (Spring Boot Java)

```
User click "Démarrer Live Stream" 
  ↓
toggleCamera() (useLiveStream.ts)
  ↓ Parallel
  ├── sendStartStream() → POST /api/livestream/create 
  └── startRecording() → expo-av Audio.Recording.createAsync()
        ↓
User toggle off → stopRecording() → uploadVideo → PUT /api/livestream/update
```

## 1. Déclenchement (LiveStream.tsx → useLiveStream.ts)

**Bouton press → toggleCamera()**
```tsx
const toggleCamera = async () => {
  if (!isCameraActive) { // Start
    startTimeRef.current = new Date();
    await sendStartStream(); // Backend notify start
    await startRecording();  // Local audio/video
  } else { // Stop
    await sendStopStream();  // Backend notify end
    await stopRecording();   // Cleanup + upload
  }
  setIsCameraActive(!isCameraActive);
}
```

## 2. Backend Notification Start (sendStartStream → LiveStreamService)

**Hook → Service → Backend**
```tsx
// useLiveStream.ts
const sendStartStream = async () => {
  const payload = { userId, facing, startedAt: new Date() };
  const response = await LiveStreamService.sendLiveStreamData(payload, token);
  setLivestreamId(response.livestreamId); // Backend generates ID
}
```

**Service (LiveStreamService.ts)**
```tsx
// Dynamic URL: Android emu → 10.0.2.2:9090
async sendLiveStreamData(payload, token) {
  fetch(`${getBaseUrl()}/api/livestream/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  })
}
```

**Backend (LiveStreamController.java)**
```java
@PostMapping("/create")
public ResponseEntity<LiveStreamDTO> createLive(@RequestBody LiveStreamDTO dto) {
  LiveStream created = liveStreamService.createLiveStream(dto); // Save to Mongo/DB
  return ResponseEntity.created().body(mapper.toDTO(created)); // ID returned
}
```

## 3. Enregistrement Local (expo-camera + expo-av)

**Audio/Video simultané**
```tsx
// startRecording()
if (recorderRef.current) await recorderRef.current.stopAndUnloadAsync(); // Cleanup!
await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HighQuality);
await recorderRef.current.startAsync(); // Record starts
```

**LiveStreamCamera.tsx** (not shown, but expo-camera view active)

## 4. Arrêt & Upload (stopRecording)

**Cleanup + Upload**
```tsx
const stopRecording = async () => {
  await recorderRef.current.stopAndUnloadAsync();
  const uri = recorderRef.current.getURI(); // local:// file

  // Upload to backend media
  const mediaResponse = await MediaService.uploadVideo(uri!, token!); // POST /api/media multipart
  const videoUrl = mediaResponse.url; // Backend S3/CDN URL

  // Update stream with video
  await LiveStreamService.updateLiveStream(livestreamId, {
    videoUrl,
    mediaId: mediaResponse.mediaId
  }, token!); // PUT /api/livestream/update
}
```

**MediaService upload (FormData)**
```
POST /api/media
Content-Type: multipart/form-data
- video file
- Authorization: Bearer token
Backend → MediaController saves to storage → returns URL
```

## 5. Flux Complet Timeline

```
t0: User click START
├── Backend: POST /create → {livestreamId: 42, startedAt: "2024..."}
├── Local: Audio.Recording.startAsync()
└── UI: Camera active, recording=true

Recording... (N seconds)

tn: User click STOP
├── Local: stopAndUnloadAsync() → local URI
├── Upload: MediaService → /api/media → {mediaId: 100, url: "s3/video.mp4"}
├── Backend: PUT /update/42 → {videoUrl, mediaId, endedAt, duration}
└── UI: Refresh streams list via GET /livestream
```

## 6. Erreurs Fixes

**Network failed**:
- localhost → getBaseUrl() auto-detect emu/device
- Mock token → useAuth().token

**"Only one Recording"**:
- Cleanup previous recorderRef.current before createAsync

**Rapid toggle**:
- Guard `if (recording) return;`

## 7. Améliorations Prochaines

1. **Video (pas seulement audio)**: expo-camera.recordAsync()
2. **Real-time stream**: WebRTC/MediaSoup au lieu d'enregistrement
3. **Auth**: SecureStore real JWT
4. **PC IP config**: app.json extra.apiUrl = "http://192.168.1.100:9090"
5. **Error retry**: Exponential backoff fetch

## Backend Complément (LiveStreamService.java)

```java
// Save to Mongo
public LiveStream createLiveStream(LiveStreamDTO dto) {
  LiveStream entity = mapper.toEntity(dto);
  entity.setStatus("ACTIVE");
  return repository.save(entity);
}

// Update with video
public LiveStream updateLiveStream(LiveStreamDTO dto) {
  LiveStream entity = repository.findById(dto.getLivestreamId()).orElseThrow();
  entity.setVideoUrl(dto.getVideoUrl());
  entity.setEndedAt(dto.getEndedAt());
  entity.setDuration(dto.getDuration());
  return repository.save(entity);
}
```

**Test**: `npx expo start` → LiveStream tab → Toggle → Check backend logs/DB + no console errors!

Fin du cours 🚀
