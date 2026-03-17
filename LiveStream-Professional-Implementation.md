# LiveStream - Implémentation Professionnelle avec Persistance Vidéo

## Changements Implémentés (Progress 7/9)

### Frontend (React Native/Expo)
1. **AuthContext.tsx**: Mock JWT (`mock-jwt-token`, userId=123). Utilise SecureStore placeholder.
2. **LiveStream.ts**: Ajout `videoUrl`, `mediaId`, `duration`.
3. **Services**:
   - LiveStreamService: CRUD avec auth headers, `/create`, `/update`, `/list`.
   - MediaService: Upload multipart avec filename timestamp, auth.
   - SendData: Support token.
4. **useLiveStream.ts**: 
   - useAuth() pour userId.
   - **Enregistrement audio/video** expo-av (HighQuality MP4).
   - Start: POST metadata + start recording.
   - Stop: stop recording + upload → update LiveStream with videoUrl/mediaId.
   - List: GET streams.
5. **LiveStream.tsx**: UI toggle (camera/list), FlatList streams, recording indicator.

### Flux Vidéo Complet
```
1. Toggle ON → sendStartStream() → ID retourné
2. startRecording() expo-av → MP4 local
3. Toggle OFF → stopRecording() → uri
4. MediaService.uploadVideo(uri) → mediaId, videoUrl
5. LiveStreamService.updateLiveStream(ID, {videoUrl, mediaId})
6. Refresh list → DB
```

### Auth & Erreurs
- Mock JWT sur tous headers `Bearer mock-jwt-token`.
- Alert() sur erreurs.
- Console.log pour debug.

## Backend Nécessaire (Manuel - Step 8)
1. **MediaController**: `@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA)` `@RequestPart MultipartFile video`.
2. **Save file**: `/uploads/videos/` + serve static.
3. **LiveStreamDTO/Entity**: add `videoUrl`, `mediaId`.
4. **Auth**: Spring Security JWT validation.

## Installation & Test
```
cd alert_civique_front
npx expo install expo-av expo-secure-store
npx expo start
```
- Ouvrir LiveStream tab → List vide → Start → Record 10s → Stop → Vidéo uploadée/listée.

## Limitations Restantes
- expo-av installé manuellement (cmd PowerShell).
- Backend multipart non implémenté (video rejetée).
- Pas de player vidéo dans list.
- No real backend auth.

**TODO Progress:** Voir TODO-LiveStream-Professional.md

