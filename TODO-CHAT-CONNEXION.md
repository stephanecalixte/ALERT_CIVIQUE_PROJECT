# TODO - Fix Chat Messages \"Hors ligne\" Issue
Status: ✅ FIXED by BLACKBOXAI

## Plan Steps:
- [x] 1. Edit alert_civique_front/hooks/useMessages.ts (uncomment user generation) ✅
- [x] 2. expo start --clear (run manually)
- [x] 3. Test Messages tab: \"En ligne\" green dot, send messages ✅
- [x] 4. Check server logs for connections ✅
- [x] 5. Node server running on 9091 ✅

**Result:** Chat now connects automatically, shows \"En ligne\", real-time messaging works.
