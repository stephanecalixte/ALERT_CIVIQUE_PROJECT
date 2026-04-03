# SOUTENANCE CDA — ALERT'CIVIQUE
## Concepteur Développeur d'Applications — Niveau 6
### Durée : 40 minutes | 18 slides (~2 min/slide)
### Candidat : Calixte Stéphane | Centre : DORANCO | Avril 2026

---

## SLIDE 1 — PAGE DE GARDE
*(30 sec)*

```
┌─────────────────────────────────────────┐
│         DOSSIER DE PROJET               │
│                                         │
│           ALERT'CIVIQUE                 │
│                                         │
│  Projet réalisé dans le cadre de la     │
│  soutenance devant le Jury Final        │
│  pour l'obtention du titre              │
│                                         │
│   Concepteur Développeur d'Applications │
│              Niveau 6                   │
│                                         │
│         Calixte Stéphane                │
│              DORANCO                    │
│            Avril 2026                   │
└─────────────────────────────────────────┘
```

---

## SLIDE 2 — PLAN
*(30 sec)*

| # | Section | Durée |
|---|---------|-------|
| 3 | Contexte & Problématique (QQOQCP) | 3 min |
| 4 | Analyse stratégique (PESTEL / SWOT / SMART) | 2 min |
| 5 | Cahier des charges & Benchmark | 3 min |
| 6 | Persona & Expression des besoins | 2 min |
| 7 | MVP & Versions | 1 min |
| 8 | Méthodologie de travail | 2 min |
| 9 | Spécifications fonctionnelles | 2 min |
| 10 | Architecture & Stack technique | 3 min |
| 11 | Conception UML | 2 min |
| 12 | Base de données SQL (MERISE) | 2 min |
| 13 | Base de données NoSQL (MongoDB) | 1 min |
| 14 | UX/UI — Charte graphique & Maquettes | 2 min |
| 15 | Développement & Intégration | 3 min |
| 16 | Sécurité, RGPD & Qualité du code | 3 min |
| 17 | Tests, Déploiement & DevOps | 2 min |
| 18 | Veilles, Bilan & Conclusion | 3 min + jury |

---

## SLIDE 3 — CONTEXTE & PROBLÉMATIQUE (QQOQCP)
*(3 min)*

### QUI ?
- **Citoyens** (18–75 ans) — particuliers, commerçants, associations locales
- **Services publics** — Mairies (35 000 communes), secours (112, 18, 15), Police
- **Collectivités** — Communes, intercommunalités, départements

### QUOI ?
Plateforme mobile nationale d'alertes citoyennes :
- Signalement en temps réel avec géolocalisation
- Livestream depuis le lieu de l'incident
- Carte interactive et tableau de bord analytique

### OÙ / QUAND ?
France métropolitaine et DOM-TOM — espaces publics, zones résidentielles, établissements recevant du public — **usage quotidien, 24h/24**

### COMMENT ?
```
1. Signalement citoyen (photo + géolocalisation auto)
2. Validation communautaire + IA
3. Transmission aux services compétents
4. Suivi et feedback en temps réel aux citoyens
```

### POURQUOI ?
- Appels d'urgence **lents** et mal géolocalisés
- Réseaux sociaux **sans structure** pour alertes locales
- **Aucune solution nationale** ne combine signalement + livestream + carte
- Fragmentation des apps locales → manque d'interopérabilité

### COMBIEN ?
| Indicateur | Objectif |
|-----------|----------|
| Temps de signalement | < 15 secondes |
| Taux validation communautaire | > 30% |
| Temps de résolution | < 72 heures |
| NPS satisfaction | > 50 |
| Communes partenaires an 1 | > 100 |

---

## SLIDE 4 — ANALYSE STRATÉGIQUE : PESTEL / SWOT / SMART
*(2 min)*

### PESTEL (points clés)
| Facteur | Opportunité | Menace |
|---------|-------------|--------|
| **Politique** | Plan France Numérique 2030 | Réglementations locales variables |
| **Économique** | Fonds transformation numérique | Coûts infrastructure |
| **Social** | Civic tech en croissance | Fracture numérique |
| **Technologique** | 5G + IA + géolocalisation précise | Cybersécurité croissante |
| **Légal** | RGPD, RGAA, ANSSI | Responsabilité faux signalements |

### SWOT
| Forces | Faiblesses |
|--------|------------|
| Solution nationale unifiée | Développement complexe |
| Double validation citoyens + IA | Dépendance partenariats publics |
| Standard ouvert d'interopérabilité | Maintenance continue nécessaire |

| Opportunités | Menaces |
|-------------|---------|
| Marché non saturé au niveau national | Concurrence solutions locales |
| Subventions numériques publiques | Résistance des administrations |
| Partenariats grandes villes | Évolutions réglementaires rapides |

### Objectifs SMART
| Objectif | Mesurable | Temporel |
|----------|-----------|---------|
| MVP fonctionnel | 3 parcours complets | J+90 |
| Acquisition citoyens | 10 000 utilisateurs actifs | Mois 6 |
| Partenariats mairies | 50 communes signées | Mois 4 |
| Rapidité signalement | < 15 secondes | Continu |

---

## SLIDE 5 — CAHIER DES CHARGES : BENCHMARK
*(3 min)*

### Méthodologie de sélection
4 applications représentatives du marché français étudiées :

| Application | Type | Périmètre |
|-------------|------|-----------|
| App-Est (ex-Alertez-Nous) | Concurrent direct | National |
| DansMaRue | Concurrent direct | Paris uniquement |
| Ma ville.signalement | Concurrent indirect | 3 000+ communes |
| Waze | Référence inspirante | International |

### Comparatif fonctionnel
| Fonctionnalité | App-Est | DansMaRue | Ma ville | **Alert_Civique** |
|----------------|:-------:|:---------:|:--------:|:-----------------:|
| Signalement | ✅ (45s) | ✅ (30s) | ✅ (60s+) | **✅ (< 15s)** |
| Géolocalisation | Manuelle | Auto | Manuelle | **Auto + suggestions** |
| Validation | ❌ | Administrative | Manuelle | **Communautaire + IA** |
| Livestream | ❌ | ❌ | ❌ | **✅** |
| Carte interactive | ✅ | ✅ | ✅ | **✅ + heatmap** |
| API ouverte | ❌ | ❌ | Limitée | **✅ REST + Webhook** |
| Note globale | 8.7/20 | 13.3/20 | 7.4/20 | **Cible : 19/20** |

### Points faibles concurrents → améliorations Alert_Civique
- **App-Est :** UX vieillissante (2015), 4 étapes → **Alert_Civique : 2 étapes max**
- **DansMaRue :** Verrouillage Paris, pas de réseau social → **national + communautaire**
- **Ma ville :** UX administrative, pas mobile-first → **mobile-first citoyen**

### Positionnement différenciant
> **NATIONAL** mais LOCAL · **CITOYEN** mais INSTITUTIONNEL · **SIMPLE** mais PUISSANT · **OUVERT** mais SÉCURISÉ

---

## SLIDE 6 — PERSONA & EXPRESSION DES BESOINS
*(2 min)*

### Persona 1 — Marie, 34 ans (Citoyenne)
- Habitante urbaine, active sur les réseaux sociaux
- **Besoin :** Signaler un incident (inondation, accident) rapidement
- **Frustration :** Appels lents, RS non géolocalisés, pas de suivi
- **Attente :** Interface simple, rapide, sur son téléphone

### Persona 2 — Julien, 45 ans (Élu local)
- Responsable de la sécurité du quartier
- **Besoin :** Visualiser les alertes en temps réel + analytics
- **Attente :** Tableau de bord clair, KPI personnalisables, API vers systèmes existants

### Besoins fonctionnels citoyens
- S'inscrire / S'authentifier
- Créer un signalement géolocalisé (photo/vidéo/livestream)
- Visualiser et valider les alertes sur la carte
- Recevoir des notifications intelligentes géolocalisées

### Besoins fonctionnels collectivités
- Tableau de bord temps réel + reporting automatisé
- Assignation des signalements aux services compétents
- Intégration API / Webhooks vers systèmes existants
- Export données ouvertes + analytics avancés (heatmap, tendances)

### Besoins non fonctionnels
| Critère | Exigence |
|---------|----------|
| Performance | Latence API < 250ms (P95) |
| Disponibilité | 99,9% uptime |
| Scalabilité | 10 000 utilisateurs simultanés |
| Accessibilité | RGAA niveau AAA |
| Sécurité | RGPD + référentiel ANSSI |

---

## SLIDE 7 — MVP & VERSIONS
*(1 min)*

### MVP — Version 1.0 *(livré)*
- ✅ Inscription / Authentification (JWT RS256)
- ✅ Signalement géolocalisé + upload photo/vidéo
- ✅ Carte interactive avec markers colorés par priorité
- ✅ Livestream basique (WebRTC → HLS via Node.js)
- ✅ Conteneurisation Docker

### Version 2.0 *(planifiée)*
- Notifications push intelligentes (Firebase Cloud Messaging)
- Validation communautaire + score de confiance IA
- Chat temps réel intégré aux livestreams
- Système de missions citoyennes (gamification)

### Version 3.0 *(perspective)*
- Classification automatique des incidents (TensorFlow Lite)
- Intégration API services d'urgence (15, 17, 18)
- Mode crise (broadcast géolocalisé d'urgence)
- Dashboard élu/administration avec analytics prédictifs

### Modèle économique
```
Freemium citoyen (gratuit)
Version Pro communes : 500–5 000 €/an
API entreprise       : 10 000–50 000 €/an
Data analytics       : 20 000–100 000 €/an
→ CA potentiel an 3  : 5 M€
```

---

## SLIDE 8 — MÉTHODOLOGIE DE TRAVAIL
*(2 min)*

### Méthode choisie : Agile / Scrumban
Combinaison **Scrum** (cadre itératif, sprints) + **Kanban** (flux visuel continu)

**Pourquoi Scrumban ?**
- Projet en autonomie nécessitant flexibilité et cadence
- Besoins évolutifs découverts en cours de développement
- Livraisons régulières et fonctionnelles à chaque sprint

### Organisation des Sprints (2 semaines chacun)
| Sprint | Objectif | Résultat |
|--------|----------|---------|
| 1 | Authentification + Inscription | JWT + BCrypt opérationnels |
| 2 | Carte + Géolocalisation | MapScreen avec markers dynamiques |
| 3 | Upload média (photo/vidéo) | MediaService + stockage back |
| 4 | Livestream WebRTC | Stream mobile → HLS → spectateurs |
| 5 | Sécurité + Tests | Couverture > 70%, tests Postman |
| 6 | Déploiement Docker | docker-compose fonctionnel |

### Méthodologies de développement combinées
- **TDD (Test Driven Development) :** Tests JUnit écrits avant le code métier
- **XP (Extreme Programming) :** Code review systématique, intégration continue

### Outils
| Usage | Outil |
|-------|-------|
| Versionning | Git + GitHub (branches `feature/` → `develop` → `main`) |
| Suivi tâches | GitHub Projects (Kanban board) |
| Tests API | Postman (collection 40+ scénarios) |
| Qualité code | SonarQube |

---

## SLIDE 9 — SPÉCIFICATIONS FONCTIONNELLES
*(2 min)*

### Fonctionnalité : S'inscrire
```
Acteur    : Utilisateur non inscrit
Pré-cond  : Application installée
Scénario nominal :
  1. Saisie nom, email, mot de passe
  2. Validation (format email, mdp ≥ 12 car., entropie élevée)
  3. POST /api/auth/register → BCrypt hash + création compte
  4. Vérification email (lien de confirmation)
  5. Redirection écran principal + trust_score = 0.3
Cas alternatif : Email déjà utilisé → 409 Conflict
```

### Fonctionnalité : S'authentifier
```
Acteur    : Utilisateur inscrit
Scénario nominal :
  1. Saisie email + mot de passe
  2. POST /api/auth/login → JWT RS256 (24h) + refresh token
  3. Stockage sécurisé (AsyncStorage chiffré côté mobile)
  4. Accès aux fonctionnalités protégées selon rôle
Cas alternatif : 5 tentatives échouées → blocage 15 min (brute force)
```

### Fonctionnalité : Créer un signalement
```
Scénario nominal :
  1. Géolocalisation auto-détectée (Expo Location)
  2. Sélection catégorie (grands boutons — 20 catégories + personnalisables)
  3. Photo/vidéo optionnelle (30s max)
  4. POST /api/alerts + upload multipart
  5. Notification push aux citoyens dans le rayon configuré
Objectif : < 15 secondes de bout en bout
```

### Fonctionnalité : Livestream
```
Scénario nominal :
  1. Démarrer le stream (WebSocket → Node.js media server)
  2. Envoi des chunks vidéo (useVideoRecording.ts)
  3. Diffusion HLS aux spectateurs en temps réel
  4. Enregistrement session dans MongoDB
  5. Arrêt : DELETE /api/livestream/{id}
```

---

## SLIDE 10 — ARCHITECTURE & STACK TECHNIQUE
*(3 min)*

### Architectures étudiées
| Architecture | Points forts | Pourquoi non retenu |
|-------------|-------------|---------------------|
| Monolithique | Simple à démarrer | Peu scalable |
| MVC multicouches | Séparation responsabilités | Couplage fort |
| **Hexagonale** | **Découplage domaine/infra** | **→ CHOISI** |
| Architecture en Y | Partage domaine front/back | Complexe pour solo |

### Architecture choisie : MVC Hexagonale
```
[Mobile React Native / Expo]
           ↓ HTTPS + JWT RS256
[Spring Boot — Controller / Service / Repository]
           ↓                    ↓
        [MySQL 8]          [MongoDB 6]
           ↑
[Node.js Media Server] ←→ WebRTC / HLS
```

### Architecture matérielle : n-Tier
```
[Client iOS/Android] → [API REST Spring Boot] → [BDD SQL/NoSQL]
                     → [Node.js Media Server] → [BDD NoSQL]
                     → [CDN média (S3/OVH)]
```

### Stack technologique complète
| Couche | Technologies | Justification |
|--------|-------------|---------------|
| **Front-end** | React Native, Expo, TypeScript | Cross-platform iOS/Android natif |
| **Back-end** | Spring Boot 3.1, Java 17 | Robuste, sécurisé, entreprise |
| **SQL** | MySQL 8 + JPA/Hibernate | Données structurées, relations, transactions |
| **NoSQL** | MongoDB 6 | Données livestream non structurées |
| **Media** | Node.js + WebRTC + HLS | Livestream temps réel faible latence |
| **Sécurité** | Spring Security + JWT RS256 | Authentification + autorisation |
| **DevOps** | Docker, GitHub Actions, SonarQube | CI/CD, qualité, conteneurisation |

---

## SLIDE 11 — CONCEPTION UML
*(2 min)*

### Diagramme de cas d'utilisation
```
         ┌────────────────────────────────────────┐
         │            Alert_Civique               │
         │                                        │
Citoyen ─┤─ S'inscrire / S'authentifier           │
         │─ Créer un signalement géolocalisé      │
         │─ Valider un signalement (communauté)   │
         │─ Démarrer un livestream                │
         │─ Voir la carte + heatmap               │
         │                                        │
Admin   ─┤─ Modérer les signalements              │
         │─ Gérer les utilisateurs + rôles        │
         │─ Consulter analytics / KPI             │
         └────────────────────────────────────────┘
```

### Diagramme de séquences — Authentification
```
Client          Controller          Service          Repository
  │─POST /login──→│                    │                  │
  │               │─authenticate()────→│                  │
  │               │                   │─findByEmail()────→│
  │               │                   │←── User ──────────│
  │               │                   │─BCrypt.check()    │
  │               │←── JWT Token ─────│                  │
  │←─200 + Token──│                   │                  │
```

### Diagramme de classes (entités principales)
```
Users (id, nom, email, password_hash, role, trust_score, created_at)
  │ 1..*
Reports (id, description, latitude, longitude, status, priority, user_id#, category_id#)
  │ 1
Geolocalisation (id, latitude, longitude, adresse, report_id#)
  │ 1
EmergenciesAlert (id, level, message, report_id#)

AiValidation (id, report_id#, ai_score, decision, confidence_level, model_version)
```

### Types énumérés
- `ReportsStatus` : PENDING / VALIDATED / REJECTED / VERIFIED
- `DecisionLevel` : FAIBLE / MODÉRÉ / URGENT / CRITIQUE
- `UserRole` : CITIZEN / MODERATOR / ADMIN

---

## SLIDE 12 — BASE DE DONNÉES SQL — MERISE
*(2 min)*

### MCD → MLD → MPD

**Entités :** USERS, REPORTS, GEOLOCALISATION, EMERGENCIES_ALERT, AI_VALIDATION, CATEGORY

**MLD (Modèle Logique de Données)**
```sql
USERS(id, nom, email, password_hash, role, trust_score, created_at)
CATEGORY(id, nom, icone)
REPORTS(id, description, latitude, longitude, status, priority,
        user_id#, category_id#, created_at)
GEOLOCALISATION(id, latitude, longitude, adresse, report_id#)
EMERGENCIES_ALERT(id, level, message, report_id#, created_at)
AI_VALIDATION(id, report_id#, ai_score, decision, confidence_level,
              model_version, created_at)
```

**Contraintes MPD**
```sql
FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
FOREIGN KEY (category_id) REFERENCES CATEGORY(id)
INDEX ON REPORTS(latitude, longitude)        -- géolocalisation rapide
INDEX ON REPORTS(created_at DESC)
  WHERE status = 'ACTIVE'                   -- alertes actives récentes
CHECK (role IN ('CITIZEN', 'MODERATOR', 'ADMIN'))
CHECK (trust_score BETWEEN 0 AND 1)
```

**Dictionnaire de données (extrait)**
| Champ | Type | Contrainte | Description |
|-------|------|------------|-------------|
| users.email | VARCHAR(255) | UNIQUE, NOT NULL | Email de connexion |
| users.trust_score | DECIMAL(3,2) | DEFAULT 0.3 | Score de confiance |
| reports.latitude | DECIMAL(10,8) | NOT NULL | Position GPS |
| reports.status | ENUM | NOT NULL | Statut du signalement |
| ai_validation.decision | ENUM | NOT NULL | confirm / infirme / like |

**Seuil alerte vérifiée :**
```java
// Alerte considérée "vérifiée" si :
// - 3 confirmations communautaires minimum
// - Score moyen IA > 0.8
if (confirmations >= 3 && scoreMoyen > 0.8) {
    report.setStatus(ReportsStatus.VERIFIED);
    notificationService.notifyServices(report);
}
```

---

## SLIDE 13 — BASE DE DONNÉES NoSQL — MONGODB
*(1 min)*

### Pourquoi MongoDB pour le livestream ?
- Données **non structurées** (chunks vidéo, liste de viewers, métadonnées)
- Schéma **flexible** qui évolue selon l'état du stream
- **Haute performance** lecture/écriture en temps réel

### Modèle de document LiveStream
```json
{
  "_id": "ObjectId",
  "userId": 42,
  "title": "Incendie rue de la Paix",
  "status": "LIVE",
  "viewers": [101, 205, 340],
  "chunks": [
    { "seq": 1, "url": "/hls/stream_001.ts", "duration": 2 },
    { "seq": 2, "url": "/hls/stream_002.ts", "duration": 2 }
  ],
  "location": { "lat": 48.8566, "lng": 2.3522 },
  "startedAt": "2026-04-03T10:00:00Z",
  "metadata": { "resolution": "720p", "bitrate": 1500 }
}
```

### Types de BDD NoSQL comparés
| Type | Exemple | Usage Alert_Civique |
|------|---------|---------------------|
| **Document** | **MongoDB** ✅ | **Livestreams, sessions** |
| Clé-valeur | Redis | Cache (envisagé V2) |
| Colonnes | Cassandra | Non retenu |
| Graphe | Neo4j | Non retenu |

---

## SLIDE 14 — UX/UI — CHARTE GRAPHIQUE & MAQUETTES
*(2 min)*

### Charte graphique
| Élément | Valeur | Usage |
|---------|--------|-------|
| **Bleu confiance** | `#0066CC` | Navigation, boutons principaux |
| **Orange vigilance** | `#FF6600` | Alertes, boutons urgents, bouton FAB |
| **Vert résolu** | `#00CC66` | Statut "traité" |
| **Rouge urgent** | `#FF3333` | Alertes critiques |
| **Blanc** | `#FFFFFF` | Fond principal |
| **Police** | Montserrat (400/600/700) | Lisibilité mobile |
| **Logo** | Main protectrice + antenne signal | "Votre voix, notre vigilance" |

### Zoning de l'écran principal
```
┌──────────────────────────────┐
│  ALERT'CIVIQUE          🔔 2 │  Header + badge notifications
├──────────────────────────────┤
│                              │
│   CARTE INTERACTIVE          │  Markers colorés par priorité
│   🔴 Urgent  🟠 Modéré       │  Rouge / Orange / Jaune / Vert
│   🟡 Faible  🟢 Résolu       │
│                    [🔴 SOS]  │  Bouton flottant urgence
│              [(+) SIGNALER]  │  Bouton flottant principal
├──────────────────────────────┤
│ 🗺 Carte │ 🔔 Alertes │ 📹 Live │ 👤 Profil │
└──────────────────────────────┘
```

### Principes UX
- **Mobile First** — touches minimum 44×44px
- Signalement en **2 écrans max** (objectif < 15 secondes)
- **Accessibilité** : conformité RGAA, contraste WCAG AA minimum
- **Mode sombre** supporté
- Grille 8px — breakpoints Mobile / Tablette / Desktop

### Arborescence
```
[Accueil/Carte] → [Créer signalement] → [Confirmation]
               → [Voir détail alerte]
[Live] → [Démarrer stream] → [En cours]
[Alertes] → [Liste] → [Détail + validation]
[Profil] → [Mes signalements] → [Paramètres]
```

---

## SLIDE 15 — DÉVELOPPEMENT & INTÉGRATION
*(3 min)*

### Structure du projet
```
alert_civique_back/src/main/java/
├── controller/         → Endpoints REST (Report, Auth, Livestream, Geo)
├── service/impl/       → Logique métier (RegisterService, LiveStreamService)
├── repository/         → Spring Data JPA + requêtes personnalisées
├── entity/             → JPA : Users, Reports, Geolocalisation, AiValidation
├── dto/                → Java Records (pattern DTO)
├── mapper/             → Conversion Entity ↔ DTO
├── security/           → JWT RS256 + Spring Security filters
└── enums/              → ReportsStatus, DecisionLevel

alert_civique_front/
├── app/(tabs)/         → Navigation onglets (Carte, Alertes, Live, Profil)
├── components/         → MapScreen.tsx, MarkerComponent.tsx, NativeMap.tsx
├── hooks/              → useRegister.ts, useVideoRecording.ts
└── lib/services/       → LiveStreamService.ts, MediaService.ts, SendData.ts

server/server.js        → Node.js Media Server (WebRTC → HLS)
```

### Compétences back-end validées
```java
// Exemple — RegisterService.java
@Service
public class RegisterService {
    // Injection par constructeur (best practice)
    public RegisterService(UserRepository repo, PasswordEncoder encoder) { ... }

    @Transactional
    public UserDto register(RegisterRequest request) {
        // Validation métier
        if (userRepository.findByEmail(request.email()).isPresent())
            throw new IllegalArgumentException("Email déjà utilisé");
        // BCrypt hash + sauvegarde
        Users user = new Users();
        user.setPasswordHash(encoder.encode(request.password()));
        user.setTrustScore(0.3); // Niveau débutant
        return userMapper.toDto(userRepository.save(user));
    }
}
```

### Fonctionnalités développées
| Fonctionnalité | Back | Front | Statut |
|---------------|------|-------|--------|
| Inscription / Auth JWT | `RegisterService.java` | `useRegister.ts` | ✅ |
| Carte + Markers | `AlertController.java` | `MapScreen.tsx` + `NativeMap.tsx` | ✅ |
| Upload média | Multipart Spring | `MediaService.ts` + `SendData.ts` | ✅ |
| Livestream WebRTC→HLS | `LiveStreamService.java` + `server.js` | `LiveStreamService.ts` + `useVideoRecording.ts` | ✅ |
| Validation communautaire + IA | `AiValidationService.java` | — | 🔄 V2 |

---

## SLIDE 16 — SÉCURITÉ, RGPD & QUALITÉ DU CODE
*(3 min)*

### Protection contre les attaques (OWASP Top 10)
| Attaque | OWASP | Protection mise en place |
|---------|-------|--------------------------|
| Broken Access Control | A01 | Rôles JWT stricts, vérif. systématique côté serveur |
| Cryptographic Failures | A02 | BCrypt pour mots de passe, TLS 1.3, RS256 |
| Injection SQL | A03 | JPA/Hibernate — requêtes préparées exclusivement |
| XSS | A03 | Échappement données, headers Content-Security-Policy |
| Auth Failures | A07 | Rate limiting (5 tentatives → blocage 15 min) |
| CSRF | — | Tokens CSRF + SameSite cookies |
| CORS | — | Origines autorisées strictement configurées |
| MITM | — | HTTPS obligatoire + HSTS activé |

### Sécurité des bases de données
**MySQL :**
- Utilisateur applicatif avec **droits limités** (SELECT, INSERT, UPDATE — pas DROP)
- Connexion uniquement depuis l'hôte applicatif (`GRANT ... TO 'app'@'localhost'`)
- Mot de passe root 32+ caractères, jamais exposé

**MongoDB :**
- Authentification activée (jamais `--noauth`)
- Port 27017 **non exposé** sur Internet
- TLS/SSL activé pour toutes les connexions

### RGPD & CNIL
- Consentement **explicite** à l'inscription
- Droits ARCO : accès, rectification, suppression
- Géodonnées chiffrées au repos
- Durée de conservation limitée — Politique de confidentialité + CGU intégrées

### Qualité du code
| Critère | Standard appliqué |
|---------|------------------|
| Conventions | Google Java Style (back) + ESLint/Prettier (front) |
| Commits | Conventional Commits (`feat:`, `fix:`, `refactor:`) |
| Logs | SLF4J/Logback — niveaux INFO / WARN / ERROR |
| Gestion erreurs | `@ControllerAdvice` global + codes HTTP standards |
| Documentation | Javadoc services critiques + JSDoc hooks React Native |

---

## SLIDE 17 — TESTS, DÉPLOIEMENT & DEVOPS
*(2 min)*

### Stratégie de tests
| Type | Outil | Couverture |
|------|-------|-----------|
| Tests unitaires | JUnit 5 + Mockito | > 70% services métier |
| Tests intégration | Spring Boot Test + MockMvc | Endpoints critiques |
| Tests API REST | Postman (40+ scénarios) | Auth, alertes, livestream |
| Tests manuels | Expo Go (iOS + Android) | Parcours utilisateurs |
| Tests performance | JMeter | < 250ms P95 |

```java
// Exemple — Test unitaire RegisterService
@Test
void shouldRegisterNewUser() {
    RegisterRequest req = new RegisterRequest("calixte@mail.com", "Password1!");
    UserDto result = registerService.register(req);
    assertNotNull(result.getId());
    assertEquals("calixte@mail.com", result.getEmail());
    verify(userRepository).save(any(Users.class));
}
```

### Conteneurisation Docker
```yaml
services:
  backend:
    image: alert-civique-back:1.0
    ports: ["8080:8080"]
  mysql:
    image: mysql:8.0
  mongodb:
    image: mongo:6.0
  media-server:
    image: alert-civique-media:1.0
    ports: ["3000:3000"]
```

### Pipeline CI/CD — GitHub Actions
```
Push sur main
  → [1] Build + Tests unitaires (JUnit 5)
  → [2] Analyse qualité SonarQube
  → [3] Build image Docker
  → [4] Push Docker Hub
  → [5] Deploy staging → production
```

### Environnements
| Env | Description |
|-----|-------------|
| **Local** | Docker Compose + Expo Go |
| **Staging** | VPS de test — données fictives |
| **Production** | Cloud OVH/AWS — données réelles |

---

## SLIDE 18 — VEILLES, BILAN & CONCLUSION
*(3 min + 5 min jury)*

### Veilles technologiques

**Sources :** Feedly, OWASP.org, cyber.gouv.fr (ANSSI), CNIL, GitHub Trending

**OWASP Top 10 — Points critiques pour Alert_Civique**
| Rang | Risque | Action concrète |
|------|--------|-----------------|
| A01 | Broken Access Control | Rôles JWT vérifiés côté serveur à chaque requête |
| A02 | Cryptographic Failures | BCrypt pour mdp, TLS 1.3, RS256 |
| A03 | Injection | Requêtes JPA préparées exclusivement |
| A07 | Auth Failures | Rate limiting + blocage temporaire |

**ANSSI appliqué :** TLS 1.2 minimum, mots de passe 12+ caractères, logs conservés 6 mois
**CNIL appliqué :** durée conservation limitée, consentement granulaire, droit à l'effacement

### Difficultés rencontrées & solutions
| Difficulté | Solution |
|------------|----------|
| Sync WebRTC mobile ↔ serveur | Refactorisation `LiveStreamService` + gestion chunking |
| Permissions caméra iOS vs Android | Détection plateforme dans `useVideoRecording.ts` |
| CORS en environnement Docker | Configuration Spring Security origines dynamiques |
| Erreurs 404 sur les streams | Correction routing Node.js + gestion sessions |

### Compétences CDA validées
- ✅ Analyse stratégique (QQOQCP, PESTEL, SWOT, SMART)
- ✅ Conception architecture logicielle + matérielle (MVC Hexagonale, n-Tier)
- ✅ Modélisation UML (UC, séquences, classes) + MERISE (MCD/MLD/MPD)
- ✅ Développement full-stack (React Native + Spring Boot Java 17)
- ✅ Sécurité applicative et des données (OWASP, RGPD, ANSSI)
- ✅ Tests unitaires + intégration + API
- ✅ Déploiement Docker + CI/CD GitHub Actions

---

# Merci pour votre attention

> **Alert'Civique** — *"Votre voix, notre vigilance"*
>
> Application mobile citoyenne combinant **signalement géolocalisé**,
> **livestream temps réel** et **carte interactive**
> dans une solution sécurisée, scalable et conforme RGPD.

**Stack :** React Native · Spring Boot Java 17 · MySQL · MongoDB · Node.js · Docker · WebRTC

---

## ANNEXES (réponses aux questions du jury)

### A1. Endpoints API principaux
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | /api/auth/register | Non | Inscription |
| POST | /api/auth/login | Non | Connexion → JWT |
| GET | /api/reports/nearby | Oui | Signalements par zone GPS |
| POST | /api/reports | Oui | Créer un signalement |
| POST | /api/geolocalisation/bounding-box | Oui | Alertes dans une zone |
| GET | /api/livestreams | Oui | Livestreams actifs |
| POST | /api/livestream/start | Oui | Démarrer un livestream |
| DELETE | /api/livestream/{id} | Oui | Arrêter un livestream |

### A2. Entités JPA développées
| Entité | Annotations clés | Rôle |
|--------|-----------------|------|
| `Users` | `@Entity`, `@OneToMany` | Gestion utilisateurs |
| `Reports` | `@Entity`, `@ManyToOne` | Signalements citoyens |
| `Geolocalisation` | `@Entity`, `@OneToOne` | Données GPS |
| `EmergenciesAlert` | `@Entity`, `@OneToOne` | Alertes d'urgence |
| `AiValidation` | `@Entity`, `@ManyToOne` | Validation IA |

### A3. Patterns architecturaux utilisés
- **DTO (Java Record)** — Transfer des données entre couches
- **Mapper** — Conversion Entity ↔ DTO (séparation persistance/présentation)
- **Repository** — Spring Data JPA + méthodes personnalisées (`findByEmail`, `findByTimestampBetween`)
- **Service** — Logique métier + validation + transactions `@Transactional`
- **Controller** — Endpoints REST, codes HTTP, `@ControllerAdvice` global

### A4. Niveau de maîtrise
| Compétence | Niveau |
|-----------|--------|
| Spring Boot + API REST | Maîtrise |
| JPA / Hibernate + relations | Maîtrise |
| Architecture en couches | Maîtrise |
| Mapper (Entity ↔ DTO) | Maîtrise |
| React Native / Expo | Bonne maîtrise |
| WebRTC / HLS / Livestream | Bonne maîtrise |
| Docker + CI/CD | Bonne maîtrise |
| Sécurité applicative | Bonne maîtrise |
