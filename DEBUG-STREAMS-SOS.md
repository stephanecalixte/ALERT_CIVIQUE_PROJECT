# Debug SOS "Impossible de charger les streams"

## Problèmes possibles:

1. **Backend LiveStreamController:**
   - /api/livestream/create GET POST OK, permitAll.
   - LiveStreamService / LiveStreamMapperService / LiveStream entity OK.

2. **Front SOS Button:**
   - SosButton.tsx → LiveStream.tsx (caméra)
   - LiveStreamService.ts appelle API backend → erreur réseau/400.

3. **Causes communes:**
   - Backend pas démarré (`mvn spring-boot:run`)
   - CORS (fixé)
   - Geolocalisation error → SOS bloque
   - LiveStream.tsx fetch /api/livestream → 500 DB

## Fixes appliqués:
- BACK classes adaptées
- CORS OPTIONS ajouté
- Mongo syntaxes OK

## Test steps:
1. `cd alert_civique_back && mvn spring-boot:run`
2. `cd alert_civique_front && npx expo start --clear`
3. Appuyez SOS → console log + network tab.

**Console erreur copie pour fix précis.**

**Vérifiez:**
- LiveStreamService.ts URL (http://localhost:8080/api/livestream?)
- LiveStreamController logs (app.log)


