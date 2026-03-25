# ALERT-CIVIQUE-PROJECT TODO - LiveStream & Services Fixes

Current Working Directory: c:/PROJET_DORANCO/ALERT-CIVIQUE-PROJECT/alert_civique_front

## Approved Plan Steps:

### 1. ✅ PLAN CREATED - Fix Expo Router warnings by moving services
   - Rename/move `app/services/` → `app/lib/services/`
   - Files: AuthService.ts, LiveStreamService.ts, LoginService.ts, RegisterService.ts, SendData.ts, MediaService.ts, etc.
   - Update ALL imports referencing these paths.

### 2. ✅ Move/Rename services directory & update imports
   - Create `app/lib/services/` dir
   - Move all .ts files from `app/services/` to new location
   - Bulk update imports: replace `../services/` → `../lib/services/`

### 3. ⏳ Fix LiveStream HTTP 400 errors
   - Add detailed logging to LiveStreamService.sendLiveStreamDataImpl()
   - Verify backend endpoint `/api/livestream/create` handles payload
   - Test connectivity: curl from terminal

### 4. ⏳ Fix Camera recording "not started"
   - Update expo-av usage or migrate to expo-audio
   - Add Android recording permissions
   - Handle Expo Go limitations

### 5. ⏳ Create missing LoginService.ts
   - Similar pattern to RegisterService.ts

### 6. ⏳ Test & Backend verification
   - Backend: verify LiveStreamController POST /api/livestream/create
   - Frontend: expo start --clear --android
   - Check no more route warnings

### 7. ✅ COMPLETE - Remove this TODO.md or mark ✅

**Next Step**: Execute Step 2 - Move services directory

