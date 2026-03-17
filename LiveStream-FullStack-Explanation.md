# Explications Complètes LiveStream: Frontend → Backend

## 1. Frontend (React Native/Expo) - Structure & Flux

### Fichiers Principaux
```
contexts/AuthContext.tsx     # JWT mock (userId=123)
models/LiveStream.ts         # +videoUrl, mediaId, duration
app/services/
  ├── LiveStreamService.ts   # create/update/get avec auth
  ├── MediaService.ts        # upload MP4 multipart
  └── SendData.ts            # headers Bearer token
hooks/useLiveStream.ts       # core logic + expo-av recording
app/(tabs)/LiveStream.tsx    # UI list/toggle + FlatList
```

### Flux Vidéo Frontend
```
1. useAuth() → userId='123'
2. Toggle ON → POST /api/livestream/create → livestreamId retourné
3. expo-av Audio.Recording.createAsync(HighQuality MP4)
4. Toggle OFF → stopAndUnloadAsync() → uri local
5. MediaService.uploadVideo(uri) → multipart → mediaId/videoUrl
6. LiveStreamService.updateLiveStream(id, {videoUrl, mediaId})
7. GET /api/livestream → refresh FlatList
```

**Payload exemples:**
```json
// Start
{"userId":"123","facing":"back","startedAt":"2024-01-01T10:00:00Z"}

// Update video
{"livestreamId":1,"videoUrl":"http://localhost:8082/uploads/videos/123.mp4","mediaId":5}
```

## 2. Backend (Spring Boot/Java) - Structure Actuelle vs Nécessaire

### Actuel (Metadata seulement)
- **Controller**: LiveStreamController.java - `/api/livestream` CRUD
- **DTO**: LiveStreamDTO `(livestreamId, startedAt, endedAt, streamUrl, status)`
- **Entity**: LiveStream.java - table `lives_stream`
- **MediaController**: JSON seulement - **PAS multipart**

### Nécessaire pour Vidéo (Corrections)
1. **Ajouter à LiveStreamDTO & Entity:**
```
String videoUrl;
Long mediaId;
Integer duration;
```

2. **MediaController - Nouveau POST:**
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA)
public ResponseEntity<MediaDTO> uploadVideo(
  @RequestPart("video") MultipartFile file,
  @RequestPart(value = "dto", required = false) MediaDTO dto
) {
  String filename = "livestream-" + System.currentTimeMillis() + ".mp4";
  Path path = Paths.get("uploads/videos/" + filename);
  file.transferTo(path);
  Media media = new Media();
  media.setUrl("/uploads/videos/" + filename);
  media.setTypeMedia("VIDEO");
  // save repo
  return ResponseEntity.ok(mapper.toDTO(media));
}
```

3. **application.properties:**
```
spring.web.resources.static-locations=file:uploads/
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

4. **Dossier**: Créer `alert_civique_back/src/main/resources/static/uploads/videos/`

### Mapping Champs
| Front | Backend |
|-------|---------|
| userId | streamUrl (remplacer) |
| startedAt | startedAt |
| endedAt | endedAt |
| duration | nouveau |
| videoUrl | nouveau |
| mediaId | nouveau |

## 3. Authentification JWT
**Frontend**: `Authorization: Bearer mock-jwt-token`
**Backend**: Ajouter `@PreAuthorize` + SecurityConfig JWT filter (si pas déjà).

## 4. Test End-to-End
1. Backend: `cd alert_civique_back && mvn spring-boot:run`
2. Frontend: `cd alert_civique_front && npx expo install expo-av expo-secure-store && npx expo start`
3. App → LiveStream → Start → Record → Stop → Check DB + /uploads/videos/

## 5. Erreurs Typiques
- **400 Upload**: Backend pas multipart
- **500 File save**: Dossier uploads absent
- **No videoUrl**: Media upload fail

**Fichiers référence:** `LiveStream-Professional-Implementation.md` + code sources.

