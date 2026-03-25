# Mongo Compilation Fix

**Erreur:** org.springframework.data.mongodb.repository not found

**Cause:** VSCode linter / Java extension cache. pom.xml a starter-mongodb OK.

**Solution:**
1. VSCode: Ctrl+Shift+P → "Java: Reload Projects"
2. Terminal: `cd alert_civique_back && mvn clean compile`
3. Fichiers repos stub OK (no extends MongoRepository needed for starter).

**mvn OK → ignore linter.**

Pour SOS streams: BACK LiveStreamController OK. Front useLiveStream hook fetch 404? Console expo copy.
