# TODO - Fix Chat Status \"Hors ligne\" Despite Server Connection
Status: 🔄 IN PROGRESS by BLACKBOXAI

## Plan Steps:
- [ ] 1. Create this TODO file ✅
- [x] 2. Edit alert_civique_front/hooks/useMessages.ts 
  - Integrate AuthContext real user (no random) ✅
  - Dynamic SOCKET_URL (platform/emulator detection) ✅
  - Enhanced reconnect, cleanup, logging ✅

- [ ] 3. Update alert_civique_front/components/alertButton/MessageButton.tsx (wrap with AuthProvider if needed, add logs)
- [x] 3. Update alert_civique_front/components/alertButton/MessageButton.tsx (no change needed, hook handles) ✅
- [x] 4. Minor logs in alert_civique_front/server/server.js (client IP) ✅

- [ ] 5. Test: cd alert_civique_front && npx expo start --clear
  - RN console: \"✅ Connecté au serveur Socket.io\"
  - Server logs: \"🔌 New client connected\" + IP, \"✅ User connected\"
  - UI: Green dot \"En ligne\", button enabled, messages send/receive

  - RN console: \"✅ Connecté\"
  - Server logs: new client/userConnect
  - UI: green \"En ligne\", button enabled, send message works
- [ ] 6. Update status to ✅ FIXED, Result summary

**Goal:** Reliable \"En ligne\" status, auth-synced user, messages flow.

