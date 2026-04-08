# Diagnostic complet — Bugs inscription & warning Expo Router

Date : 2026-04-08

---

## BUG 1 — HTTP 500 à l'inscription (RegisterService)

### Symptôme

```
ERROR  Register error: [Error: HTTP 500]
```

L'application mobile envoie `POST /api/auth/register` et reçoit une réponse 500.

---

### Cause racine n°1 — Rôle ROLE_CLIENT absent en base

**Fichier** : `alert_civique_back/src/main/java/.../service/RegisterService.java` — ligne 92

```java
Roles defaultRole = roleRepository.findFirstByName("ROLE_CLIENT")
    .orElseThrow(() -> new EntityNotFoundException("Rôle ROLE_CLIENT introuvable en base de données"));
```

Cette ligne cherche le rôle `ROLE_CLIENT` dans la table `roles`. Si le rôle est absent,
elle lève `EntityNotFoundException`, rattrapée par le `catch (Exception e)` du contrôleur
qui retourne HTTP 500.

**Pourquoi le rôle était absent ?**

Le fichier `data.sql` contient :
```sql
INSERT IGNORE INTO roles (role_id, name) VALUES (1, 'ROLE_CLIENT');
```

Avec `ddl-auto=update` et `spring.sql.init.mode=always`, le `data.sql` est censé s'exécuter
après la création des tables. Mais selon l'ordre d'initialisation Spring Boot, il arrive
parfois que le script s'exécute avant qu'Hibernate ait créé la table `roles`, ou que
`INSERT IGNORE` ne fonctionne pas si la table n'existe pas encore.

**Preuve dans les logs** :

```
INFO  RegisterService - Tentative d'inscription pour l'email : ...
DEBUG SQL - SELECT r1_0.role_id, r1_0.name FROM roles WHERE r1_0.name=? LIMIT ?
(aucun résultat → EntityNotFoundException → HTTP 500)
```

**Correction appliquée** :

Création de `DataInitializer.java` :
`alert_civique_back/src/main/java/.../config/DataInitializer.java`

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {
    private final RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) {
        List<String> roles = List.of("ROLE_CLIENT", "ROLE_ADMIN", "ROLE_MODERATOR");
        for (String roleName : roles) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(Roles.builder().name(roleName).build());
                log.info("Rôle '{}' créé en base de données", roleName);
            }
        }
    }
}
```

`ApplicationRunner` s'exécute après le démarrage complet de Spring Boot — les tables
sont garanties d'exister. L'opération est idempotente (`existsByName` avant chaque insert).

---

### Cause racine n°2 — Colonne `role_id` NOT NULL dans la table `users`

**Erreur dans les logs** :

```
WARN  ErrorPacket - Error: 1364-HY000: Field 'role_id' doesn't have a default value
```

**Explication** :

La table `users` en base MariaDB possède une colonne `role_id NOT NULL` sans valeur par défaut.
Cette colonne est un vestige d'un ancien schéma où la relation User→Role était un simple
FK direct (`role_id` dans `users`).

Le schéma actuel de l'entité `Users.java` utilise une relation Many-to-Many via une table
de jointure `user_roles` :

```java
@ManyToMany(fetch = FetchType.EAGER)
@JoinTable(
    name = "user_roles",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id")
)
private Set<Roles> roles;
```

Hibernate génère donc un INSERT dans `users` sans inclure `role_id`. MariaDB rejette
l'INSERT car `role_id` est NOT NULL sans valeur par défaut.

Avec `ddl-auto=update`, **Hibernate ne supprime jamais les colonnes existantes**.
La colonne orpheline `role_id` reste donc indéfiniment tant qu'on ne la supprime pas manuellement.

**Correction à appliquer manuellement dans DBeaver** :

Connecte-toi à `alertdb` (MariaDB port 3307) et exécute :

```sql
-- Option 1 : supprimer la colonne (recommandé)
ALTER TABLE users DROP COLUMN role_id;

-- Option 2 : la rendre nullable sans la supprimer
ALTER TABLE users MODIFY COLUMN role_id BIGINT NULL;
```

Vérifie aussi le nom de la table de jointure :

```sql
SHOW TABLES;
-- doit afficher : user_roles (pas users_roles)
DESCRIBE users;
-- ne doit plus afficher role_id comme NOT NULL
```

---

### Flux complet de l'erreur (diagramme)

```
Mobile → POST /api/auth/register
          │
          ▼
    AuthController.register()
          │
          ▼
    RegisterService.register()
          │
          ├─ existsByEmail() → OK
          │
          ├─ findFirstByName("ROLE_CLIENT")
          │     └─ [cause 1] table roles vide → EntityNotFoundException
          │
          └─ userRepository.save(user)
                └─ [cause 2] role_id NOT NULL sans valeur → SQLError 1364
                                                          → HTTP 500
```

---

## BUG 2 — Warning Expo Router sur AdminService.ts

### Symptôme

```
WARN  Route "./lib/services/AdminService.ts" is missing the required default export.
```

### Cause

Expo Router traite **tous les fichiers dans le dossier `app/`** comme des routes potentielles.
`AdminService.ts` se trouve dans `app/lib/services/`, donc Expo Router l'analyse.

Il détecte l'absence de `export default` (contrairement aux autres services qui ont tous
`export default { ... }` à la fin) et affiche le warning.

**Fichier concerné** : `alert_civique_front/app/lib/services/AdminService.ts`

**Comparaison avec RegisterService.ts** (pas de warning) :
```ts
// RegisterService.ts — a un default export
export default { registerUser };
```

```ts
// AdminService.ts — n'en avait pas
export const AdminService = { ... };
// ← pas de export default → warning Expo Router
```

### Correction appliquée

Ajout de la ligne suivante à la fin de `AdminService.ts` :

```ts
export default AdminService;
```

Cela satisfait Expo Router sans modifier le comportement du service ni les imports existants.

---

## Récapitulatif des corrections

| # | Problème | Fichier modifié/créé | Action |
|---|----------|----------------------|--------|
| 1a | ROLE_CLIENT absent en BDD | `config/DataInitializer.java` | Créé — insère les rôles au démarrage |
| 1b | Colonne `role_id` NOT NULL orpheline | Table `users` en MariaDB | **ALTER TABLE à exécuter manuellement dans DBeaver** |
| 2 | Warning Expo Router | `app/lib/services/AdminService.ts` | Ajout de `export default AdminService` |

---

## Actions restantes

1. **Redémarrer le backend Spring Boot** après ajout de `DataInitializer.java`
   → Vérifier dans les logs : `Rôle 'ROLE_CLIENT' créé en base de données`

2. **Exécuter dans DBeaver** :
   ```sql
   ALTER TABLE users DROP COLUMN role_id;
   ```

3. **Recharger l'app Expo** (déjà fait automatiquement par le hot reload)

4. **Retester l'inscription** depuis l'écran RegisterScreen
