# Cours DÉTAILLÉ : LiveStream - TOUTES les Méthodes Expliquées

## Table des Matières
1. [Flux Global](#flux-global)
2. [useLiveStream Hook - Toutes méthodes](#uselifestream)
3. [LiveStreamService - Toutes méthodes](#livestreamservice)
4. [MediaService - uploadVideo](#mediaservice)
5. [Backend Controller](#backend)
6. [Gestion Erreurs Fixes](#erreurs)

## 1. Flux Global `<a name="flux-global"></a>`

```
Click "Démarrer" 
  ↓ toggleCamera(true)
  ├─ sendStartStream() ── payload ── LiveStreamService.sendLiveStreamData ── POST /api/livestream/create ── Backend ID 42
  └─ startRecording() ── expo-av Audio.Recording.createAsync() ── startAsync()
      ↓ (recording en cours...)
  Click "Arrêter"
  ├─ sendStopStream() ── payload ── LiveStreamService.sendLiveStreamData ── POST /api/livestream/create (end)
  └─ stopRecording() 
      ├─ stopAndUnloadAsync() ── URI local file
      ├─ MediaService.uploadVideo ── multipart POST /api/media ── Backend URL S3
      └─ LiveStreamService.updateLiveStream ── PUT /api/livestream/update ── videoUrl
```

## 2. useLiveStream.ts - TOUTES les Méthodes `<a name="uselifestream"></a>`

**Imports clés**
```tsx
import LiveStreamService from '../app/services/LiveStreamService';
import MediaService from '../app/services/MediaService';
import { useAuth } from '../contexts/AuthContext'; // token, userId
```

**État interne**
```tsx
const { userId, token } = useAuth(); // Auth global
const [livestreamId, setLivestreamId] = useState<number | null>(null); // Backend ID
const recorderRef = useRef<Audio.Recording | null>(null); // Expo AV
const recording = useState(false); // UI indicator
```

### `loadStreams()`
```tsx
const loadStreams = async () => {
  try {
    const data: LiveStream[] = await LiveStreamService.getLiveStreams(token!); 
    setStreams(data); // FlatList recent streams
  } catch (error) {
    console.error("Get LiveStreams error:", error); // Network?
    Alert.alert('Erreur', 'Impossible de charger les streams');
  }
};
useEffect(() => loadStreams(), []); // Load on mount
```

### `sendStartStream()`
```tsx
const sendStartStream = useCallback(async () => {
  const payload = {
    userId: userId || '123', // From auth
    facing: 'back' | 'front',
    startedAt: new Date().toISOString() // Backend timestamp
  };
  const response = await LiveStreamService.sendLiveStreamData(payload, token!);
  setLivestreamId(response?.livestreamId); // Save ID pour update later
}, [userId, facing]);
```

### `startRecording()`
```tsx
const startRecording = async () => {
  try {
    // FIX DUPLICATE: Cleanup previous
    if (recorderRef.current && recorderRef.current._isLoaded) {
      await recorderRef.current.stopAndUnloadAsync();
    }
    recorderRef.current = null;

    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ // iOS silent mode
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true
    });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HighQuality // Bitrate auto
    );
    recorderRef.current = recording;
    await recorderRef.current.startAsync(); // 🎤 RECORDING STARTS
    setRecording(true); // UI red button
  } catch (err) {
    recorderRef.current = null;
    Alert.alert('Erreur Audio');
  }
};
```

### `stopRecording()`
```tsx
const stopRecording = async () => {
  if (!recorderRef.current) return;
  await recorderRef.current.stopAndUnloadAsync(); // STOP RECORD
  const uri = recorderRef.current.getURI(); // local://path/video.mp4
  recorderRef.current = null;
  setRecording(false);

  // UPLOAD VIDEO
  const mediaResponse = await MediaService.uploadVideo(uri!, token!);
  const videoUrl = mediaResponse.url; // Backend S3/CDN

  // UPDATE STREAM WITH VIDEO
  if (livestreamId && videoUrl) {
    await LiveStreamService.updateLiveStream(livestreamId, {
      videoUrl, // S3 URL
      mediaId: mediaResponse.mediaId
    }, token!);
  }
};
```

### `sendStopStream()`
```tsx
const sendStopStream = async () => {
  const duration = (Date.now() - startTimeRef.current!) / 1000;
  const payload = {
    userId, endedAt: new Date().toISOString(), duration: Math.floor(duration)
  };
  await LiveStreamService.sendLiveStreamData(payload, token!);
};
```

### `toggleCamera()` - MASTER ORCHESTRATOR
```tsx
const toggleCamera = useCallback(async () => {
  if (recording) { // GUARD rapid toggle
    Alert.alert('Attendez', 'Enregistrement en cours');
    return;
  }
  if (!isCameraActive) {
    await Promise.all([sendStartStream(), startRecording()]);
  } else {
    await Promise.all([sendStopStream(), stopRecording()]);
  }
  setIsCameraActive(!isCameraActive); // UI flip
  loadStreams();
}, [isCameraActive, recording]);
```

## 3. LiveStreamService.ts `<a name="livestreamservice"></a>`

**getBaseUrl() - Fix localhost**
```tsx
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:9090'; // Emulator loopback
    return 'http://localhost:9090'; // iOS simulator
    // Device: edit to PC IP
  }
  return Constants.expoConfig.extra.apiUrl;
};
```

**sendLiveStreamData(payload, token)**
```tsx
async sendLiveStreamData(payload, token) {
  const response = await fetch(`${url}/api/livestream/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return response.json(); // {livestreamId}
}
```

**getLiveStreams(token)**
```tsx
async getLiveStreams(token) {
  const response = await fetch(`${url}/api/livestream`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json(); // LiveStream[]
}
```

**updateLiveStream(id, update, token)**
```tsx
async updateLiveStream(id, update, token) {
  fetch(`${url}/api/livestream/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ livestreamId: id, ...update })
  });
}
```

## 4. MediaService.uploadVideo `<a name="mediaservice"></a>`

**Multipart Upload**
```tsx
static async uploadVideo(uri, token) { // reportId optional
  const formData = new FormData();
  formData.append('video', { uri, type: 'video/mp4', name: `stream-${Date.now()}.mp4` });
  const response = await fetch(`${url}/api/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // No Content-Type (browser sets)
    body: formData
  });
  return response.json(); // {mediaId, url: "s3/alert-123.mp4"}
}
```

## 5. Backend LiveStreamController.java `<a name="backend"></a>`

**POST /api/livestream/create**
```java
@PostMapping("/create")
public ResponseEntity<LiveStreamDTO> createLive(@RequestBody LiveStreamDTO dto) {
  LiveStream entity = mapper.toEntity(dto); // userId, startedAt
  entity.setStatus("LIVE");
  LiveStream saved = service.save(entity);
  return ResponseEntity.created().body(mapper.toDTO(saved)); // {livestreamId: 42}
}
```

**PUT /api/livestream/update**
```java
@PutMapping("/update")
public ResponseEntity<LiveStreamDTO> updateLive(@RequestBody LiveStreamDTO dto) {
  LiveStream entity = repository.findById(dto.getLivestreamId()).orElseThrow();
  entity.setEndedAt(dto.getEndedAt());
  entity.setDuration(dto.getDuration());
  entity.setVideoUrl(dto.getVideoUrl());
  return ResponseEntity.ok(mapper.toDTO(repository.save(entity)));
}
```

## 6. Fixes Erreurs `<a name="erreurs"></a>`

**Network localhost**:
```
❌ localhost:9090 (device → self)
✅ 10.0.2.2:9090 (Android emu → host)
✅ 192.168.1.100:9090 (device → PC WiFi IP)
```

**Duplicate Recording**:
```
❌ Multiple createAsync sans cleanup → expo-av error
✅ if (recorderRef.current) stopAndUnloadAsync()
```

**Token 401**:
```
❌ mock-jwt-token
✅ useAuth().token from SecureStore/LoginService
```

**Test Complet**
```
mvn spring-boot:run
npx expo start --dev-client
→ LiveStream → Start (check backend POST) → Stop (video upload + update)
```

**Debug**:
- Frontend: console.log(BASE_URL, token)
- Backend: @RestController logs + MongoDB streams collection

Fin cours détaillé ! 🎓
