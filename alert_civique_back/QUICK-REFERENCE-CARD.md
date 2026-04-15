# 🎯 CARTE DE RÉFÉRENCE RAPIDE - Tests Alert Civique

**Imprimez cette page ou gardez-la en favori!**

---

## 📍 Localisation

```
📁 c:\PROJET_DORANCO\ALERT-CIVIQUE-PROJECT\alert_civique_back\
```

---

## 🚀 COMMANDES PRINCIPALES

### ✅ Exécuter TOUS les tests
```bash
cd c:\PROJET_DORANCO\ALERT-CIVIQUE-PROJECT\alert_civique_back
mvn clean test
```
**Résultat attendu:** ✅ 116 tests réussis

---

### ✅ Exécuter + Rapport de couverture
```bash
mvn clean test jacoco:report
# Rapport: target/site/jacoco/index.html
```

---

## 🔐 COUCHE SÉCURITÉ (30 tests)

### JWT (10 tests)
```bash
mvn test -Dtest=JwtServiceTest
```

### Validation d'entrée (9 tests)
```bash
mvn test -Dtest=InputSanitizerTest
```

### Politique mot de passe (11 tests)
```bash
mvn test -Dtest=PasswordPolicyValidatorTest
```

---

## 🔧 COUCHE SERVICE (24 tests)

### Inscription (10 tests)
```bash
mvn test -Dtest=RegisterServiceTest
```

### Utilisateurs (14 tests)
```bash
mvn test -Dtest=UserServiceTest
```

---

## 💾 COUCHE REPOSITORY (36 tests)

### Rôles (12 tests)
```bash
mvn test -Dtest=RoleRepositoryTest
```

### Activation (11 tests)
```bash
mvn test -Dtest=AccountActivationRepositoryTest
```

### Signalements (13 tests)
```bash
mvn test -Dtest=ReportRepositoryTest
```

---

## 🌐 COUCHE INTÉGRATION (26 tests)

### Authentification (6 tests)
```bash
mvn test -Dtest=AuthControllerIntegrationTest
```

### Utilisateurs (8 tests)
```bash
mvn test -Dtest=UserControllerIntegrationTest
```

### Activation (7 tests)
```bash
mvn test -Dtest=AccountActivationControllerIntegrationTest
```

### Signalements (8 tests)
```bash
mvn test -Dtest=ReportControllerIntegrationTest
```

---

## 🎯 UNE MÉTHODE SPÉCIFIQUE

```bash
# Exemple: JWT - test de génération de token
mvn test -Dtest=JwtServiceTest#testGenerateToken_Success
```

---

## 📊 FILTRER PAR COUCHE

### Sécurité seulement
```bash
mvn test -Dtest=security/**
```

### Service seulement
```bash
mvn test -Dtest=service/**
```

### Repository seulement
```bash
mvn test -Dtest=repository/**
```

### Intégration seulement
```bash
mvn test -Dtest=controller/**
```

---

## 📁 FICHIERS DE TEST

```
src/test/java/com/enterprise/alert_civique/
├── security/
│   ├── JwtServiceTest.java              (10 tests)
│   ├── InputSanitizerTest.java          (9 tests)
│   └── PasswordPolicyValidatorTest.java (11 tests)
├── service/
│   ├── RegisterServiceTest.java         (10 tests)
│   └── UserServiceTest.java             (14 tests)
├── repository/
│   ├── RoleRepositoryTest.java          (12 tests)
│   ├── AccountActivationRepositoryTest.java (11 tests)
│   └── ReportRepositoryTest.java        (13 tests)
├── controller/
│   ├── AuthControllerIntegrationTest.java (6 tests)
│   ├── UserControllerIntegrationTest.java (8 tests)
│   ├── AccountActivationControllerIntegrationTest.java (7 tests)
│   └── ReportControllerIntegrationTest.java (8 tests)
└── BaseTest.java (configuration partagée)
```

---

## 📚 DOCUMENTATION

| Document | Chemin | Contenu |
|----------|--------|---------|
| 📖 Guide complet | `TEST-EXECUTION-COMPLETE-GUIDE.md` | Configuration, exécution, dépannage |
| 📋 Résumé | `TEST-SUITE-SUMMARY.md` | Tous les 116 tests, couverture |
| 🗂️ Index | `TEST-INDEX.md` | Navigation rapide, description tests |
| 📝 Guide test | `TESTING-GUIDE.md` | Conventions, pattern AAA |

---

## ⚡ RACCOURCIS UTILES

### Nettoyer + Compiler + Tester
```bash
mvn clean compile test
```

### Tester en mode parallèle (plus rapide)
```bash
mvn test -Dparallel=methods -DthreadCount=4
```

### Tester avec logs verbeux
```bash
mvn test -X
```

### Sauter les tests (compilation seulement)
```bash
mvn compile -DskipTests
```

---

## ✅ CHECKLIST D'EXÉCUTION

Avant de lancer les tests:

- [ ] Vous êtes dans: `alert_civique_back/`
- [ ] Java 17+ : `java -version`
- [ ] Maven 3.8.9+ : `mvn -version`
- [ ] Aucun service sur le port 8080
- [ ] 4 GB RAM minimum disponible

---

## 🎨 PATTERN DE NOMINATION

Chaque test suit ce pattern:

```
test<MethodName>_<Scenario>_<Expected>
```

**Exemples:**
- ✅ `testGenerateToken_Success`
- ✅ `testValidatePassword_TooShort`
- ✅ `testFindByEmail_NotFound`

---

## 📊 STATISTIQUES ACTUELLES

```
┌─────────────────────────────┐
│ SUITE DE TESTS COMPLÈTE     │
├─────────────────────────────┤
│ Total tests: 116            │
│ Fichiers test: 15           │
│ Couverture: > 85%           │
│ Status: ✅ COMPLET          │
│                             │
│ • Sécurité: 30 tests        │
│ • Service: 24 tests         │
│ • Repository: 36 tests      │
│ • Intégration: 26 tests     │
└─────────────────────────────┘
```

---

## 🆘 PROBLÈMES COURANTS

### ❌ "Tests cannot run"
```bash
# Vérifier Java
java -version

# Doit être 17+
```

### ❌ "Port 8080 already in use"
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### ❌ "Maven build failed"
```bash
# Nettoyer le cache
mvn clean
mvn test
```

### ❌ "Database connection failed"
- Vérifier `src/test/resources/application-test.properties`
- Doit contenir: `spring.datasource.url=jdbc:h2:mem:testdb`

---

## 🎯 PATH EXECUTABLES

Vérifier les chemins d'exécution:

```bash
# Vérifier JAVA_HOME
echo %JAVA_HOME%

# Vérifier MAVEN_HOME
echo %MAVEN_HOME%

# Doit afficher le chemin JDK17+
# Exemple: C:\Program Files\Java\jdk-17.0.x
```

---

## 📞 AIDE RAPIDE

**Question:** Comment exécuter les tests?
```bash
mvn clean test
```

**Question:** Comment voir le rapport de couverture?
```bash
mvn clean test jacoco:report
# Ouvrir: target/site/jacoco/index.html
```

**Question:** Comment tester un seul composant?
```bash
mvn test -Dtest=JwtServiceTest
```

**Question:** Comment savoir quels tests existent?
→ Voir `TEST-INDEX.md`

**Question:** Comment déboguer un test?
→ Voir `TEST-EXECUTION-COMPLETE-GUIDE.md - Dépannage`

---

## 🔄 INTÉGRATION CI/CD

Pour Jenkins/GitHub Actions:

```bash
#!/bin/bash
cd alert_civique_back
mvn clean test
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Tests passés!"
  exit 0
else
  echo "❌ Tests échoués!"
  exit 1
fi
```

---

## 📖 RESSOURCES

- [JUnit 5 Docs](https://junit.org/junit5/docs/current/user-guide/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Mockito Guide](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)

---

## 🎓 EXEMPLE COMPLET DE TEST

```java
@SpringBootTest
@ActiveProfiles("test")
public class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @BeforeEach
    public void setUp() {
        // Préparer les données
        User testUser = new User();
        testUser.setEmail("test@example.com");
    }
    
    @Test
    @DisplayName("Devrait sauvegarder un utilisateur")
    public void testSaveUser_Success() {
        // ARRANGE
        User user = new User();
        user.setEmail("test@example.com");
        
        // ACT
        User saved = userService.save(user);
        
        // ASSERT
        assertNotNull(saved.getId());
        assertEquals("test@example.com", saved.getEmail());
    }
}
```

---

## 💾 PROCHAINES ÉTAPES

1. ✅ Exécuter: `mvn clean test`
2. ✅ Vérifier: Tous les tests passent
3. ✅ Rapport: `mvn clean test jacoco:report`
4. ✅ Intégrer à CI/CD (Jenkins/GitHub)

---

**Dernière mise à jour:** 2024  
**Version:** 1.0  
**Auteur:** Alert Civique Development Team

---

**Gardez cette page à proximité pour un accès rapide! ⚡**
