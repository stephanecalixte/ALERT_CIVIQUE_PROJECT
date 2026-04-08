# Changelog — Alert Civique

## Corrections et fonctionnalités implémentées

---

### Icône Contact (onglet tab bar)

**Problème** : L'icône de l'onglet Contact n'apparaissait pas sur Android/Web.

**Fichier modifié** : `alert_civique_front/components/ui/icon-symbol.tsx`

**Correction** : Ajout du mapping `'person.2.fill': 'group'` dans la table de correspondance SF Symbols → Material Icons.

---

### Contact obligatoire à l'inscription

**Problème** : La personne de confiance 1 était optionnelle alors qu'elle doit être obligatoire.

**Fichiers modifiés** :
- `alert_civique_front/hooks/useRegister.ts` — validation ajoutée : nom + téléphone de person1 requis
- `alert_civique_front/app/views/register-screen/RegisterScreen.tsx` — UI mise à jour : champs person1 marqués `*`, messages d'erreur affichés, personnes 2 et 3 marquées "optionnel"

---

### Récupération des contacts dans l'onglet Contact (CRUD complet)

**Problème** : L'onglet Contact n'affichait aucun contact malgré l'inscription.

**Causes identifiées** :
1. Le login retournait uniquement le token JWT (pas le `userId`) → `useTrustedContacts` ne pouvait pas charger les contacts
2. Race condition : `login()` était appelé avant la sauvegarde des contacts → l'écran Contact chargeait avant que les contacts existent en base
3. L'écran Contact ne se rafraîchissait pas au focus

**Backend modifié** :
- `alert_civique_back/.../dto/LoginResponseDto.java` *(nouveau)* — DTO de réponse login : `{ token, userId, email, firstname, lastname }`
- `alert_civique_back/.../controller/AuthController.java` — endpoint `POST /api/auth/login` retourne maintenant `LoginResponseDto` au lieu du token brut

**Frontend modifié** :
- `alert_civique_front/app/lib/services/LoginService.ts` — parse le JSON `LoginResponse` et expose `userId`
- `alert_civique_front/hooks/useRegister.ts` — contacts sauvegardés **avant** `login()` pour éviter la race condition
- `alert_civique_front/hooks/useTrustedContacts.ts` — ajout de `useFocusEffect` pour recharger les contacts à chaque fois que l'onglet est affiché

---

### Persistance de session (reconnaissance après redémarrage)

**Problème** : L'app redemandait de créer un compte à chaque redémarrage — `expo-secure-store` ne persiste pas entre les sessions Expo Go.

**Fichier modifié** : `alert_civique_front/contexts/AuthContext.tsx`

**Correction** : Remplacement de `expo-secure-store` par `@react-native-async-storage/async-storage` qui persiste de manière fiable sur tous les environnements (Expo Go, Android, iOS).

**Comportement attendu** : Après une inscription réussie, l'utilisateur est reconnu automatiquement à chaque redémarrage de l'application sans avoir à se réinscrire.

---

### Flux complet après corrections

```
1. Utilisateur s'inscrit (avec contact de confiance obligatoire)
2. Backend enregistre l'utilisateur
3. Auto-login → récupération du token + userId
4. Contacts de confiance sauvegardés en base (AVANT ouverture de l'app)
5. Session stockée dans AsyncStorage (token + userId + nom + email)
6. App s'ouvre → onglet Contact → contacts chargés via GET /api/trusted-contacts/user/{userId}
7. Prochain démarrage → session restaurée depuis AsyncStorage → pas de réinscription
```

---

### Fichiers créés

| Fichier | Description |
|---|---|
| `alert_civique_back/.../dto/LoginResponseDto.java` | DTO réponse login avec userId |
| `alert_civique_front/app/views/login-screen/LoginScreen.tsx` | Écran de connexion (réservé usage futur) |
| `alert_civique_front/app/views/LoginScreen.tsx` | Copie à la racine views/ pour résolution Metro |
