# TODO: Fix LiveStream Errors

## Status: [IN PROGRESS]

**Step 1: [COMPLETE ✅] Create dynamic BASE_URL & use real auth token in services**
- Edited LiveStreamService.ts & MediaService.ts (getBaseUrl + token param)

**Step 2: [PENDING] Fix duplicate Audio.Recording in useLiveStream.ts**
- Add cleanup logic in startRecording/stopRecording

**Step 3: [PENDING] Test toggleCamera functionality**
- Backend running on :9090
- Expo app network connectivity

**Step 4: [PENDING] Verify no more Network/Recording errors**

## Backend Requirements
- Server: http://localhost:9090 (host)
- Android emu: http://10.0.2.2:9090
- Physical device: http://YOUR_PC_IP:9090
