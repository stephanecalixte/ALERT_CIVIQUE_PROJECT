# Guide d'Exécution Complet des Tests - Alert Civique Backend

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure des tests](#structure-des-tests)
3. [Configuration requise](#configuration-requise)
4. [Exécution des tests](#exécution-des-tests)
5. [Analyse des résultats](#analyse-des-résultats)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Ce proyecto contient une suite complète de tests comprenant:

- **83+ tests** répartis sur 15 fichiers
- **Tests unitaires** (70 tests) - test des composants individuels
- **Tests d'intégration** (13 tests) - test du flux complet
- **Couverture de code** > 80% sur les couches métier

### Distribution des tests par couche:

```
┌─────────────────────────────────────────────────────┐
│          Suite de Tests Alert Civique               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Couche Sécurité (30 tests)                        │
│  ├── JwtServiceTest (10 tests)                    │
│  ├── InputSanitizerTest (9 tests)                 │
│  └── PasswordPolicyValidatorTest (11 tests)       │
│                                                     │
│  Couche Service (24 tests)                         │
│  ├── RegisterServiceTest (10 tests)               │
│  └── UserServiceTest (14 tests)                   │
│                                                     │
│  Couche Repository (30 tests)                      │
│  ├── RoleRepositoryTest (12 tests)                │
│  ├── AccountActivationRepositoryTest (11 tests)   │
│  └── ReportRepositoryTest (13 tests)              │
│                                                     │
│  Couche Contrôleur (13 tests d'intégration)       │
│  ├── AuthControllerIntegrationTest (6 tests)     │
│  ├── UserControllerIntegrationTest (8 tests)     │
│  ├── AccountActivationControllerTest (7 tests)   │
│  └── ReportControllerIntegrationTest (8 tests)   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Structure des tests

```
src/test/
├── java/com/enterprise/alert_civique/
│   ├── security/
│   │   ├── JwtServiceTest.java
│   │   ├── InputSanitizerTest.java
│   │   └── PasswordPolicyValidatorTest.java
│   ├── service/
│   │   ├── RegisterServiceTest.java
│   │   └── UserServiceTest.java
│   ├── repository/
│   │   ├── RoleRepositoryTest.java
│   │   ├── AccountActivationRepositoryTest.java
│   │   └── ReportRepositoryTest.java
│   ├── controller/
│   │   ├── AuthControllerIntegrationTest.java
│   │   ├── UserControllerIntegrationTest.java
│   │   ├── AccountActivationControllerIntegrationTest.java
│   │   └── ReportControllerIntegrationTest.java
│   └── BaseTest.java
│
└── resources/
    ├── application-test.properties
    └── application.properties
```

---

## ⚙️ Configuration requise

### Prérequis système

- **Java 17** ou supérieur (LTS)
- **Maven 3.8.9** ou supérieur
- **Git** pour le contrôle de version
- **4 GB RAM** minimum pour la compilation

### Vérification de l'installation

```bash
# Vérifier Java
java -version

# Vérifier Maven
mvn -version

# Vérifier que vous êtes dans le bon répertoire
cd c:\PROJET_DORANCO\ALERT-CIVIQUE-PROJECT\alert_civique_back
```

---

## 🚀 Exécution des tests

### 1️⃣ Exécuter tous les tests

```bash
cd c:\PROJET_DORANCO\ALERT-CIVIQUE-PROJECT\alert_civique_back
mvn test
```

**Résultat attendu:**
```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.enterprise.alert_civique.security.JwtServiceTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.enterprise.alert_civique.service.RegisterServiceTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
...
[INFO] -------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] -------------------------------------------------------
```

### 2️⃣ Exécuter une classe de tests spécifique

```bash
# Exécuter les tests JWT
mvn test -Dtest=JwtServiceTest

# Exécuter les tests de sécurité
mvn test -Dtest=PasswordPolicyValidatorTest

# Exécuter les tests de repository
mvn test -Dtest=RoleRepositoryTest

# Exécuter les tests d'intégration
mvn test -Dtest=AuthControllerIntegrationTest
```

### 3️⃣ Exécuter une méthode de test spécifique

```bash
# Exécuter un test particulier
mvn test -Dtest=JwtServiceTest#testGenerateToken_Success

# Exécuter plusieurs tests
mvn test -Dtest=RegisterServiceTest#testRegister_Success,RegisterServiceTest#testRegister_DuplicateEmail
```

### 4️⃣ Exécuter les tests avec rapport de couverture

```bash
# Générer un rapport de couverture (JaCoCo)
mvn clean test jacoco:report

# Le rapport se trouve dans: target/site/jacoco/index.html
```

### 5️⃣ Exécuter les tests avec logs verbeux

```bash
# Afficher les logs de chaque test
mvn test -X

# Ou avec logging spécifique
mvn test -Dorg.slf4j.simpleLogger.defaultLogLevel=DEBUG
```

### 6️⃣ Exécuter uniquement les tests d'une couche

#### Tests de sécurité uniquement
```bash
mvn test -Dtest=security/**
```

#### Tests de service uniquement
```bash
mvn test -Dtest=service/**
```

#### Tests de repository uniquement
```bash
mvn test -Dtest=repository/**
```

#### Tests de contrôleur uniquement
```bash
mvn test -Dtest=controller/**
```

### 7️⃣ Exécuter les tests en mode parallèle

```bash
# Paralléliser les tests (plus rapide)
mvn test -Dparallel=methods -DthreadCount=4
```

---

## 📊 Analyse des résultats

### Rapport Surefire

Après exécution, les résultats se trouvent dans:

```
alert_civique_back/target/surefire-reports/
```

### Fichiers importants:

1. **TEST-com.enterprise.alert_civique.security.JwtServiceTest.xml**
   - Résultats des tests JWT
   - Temps d'exécution, erreurs, traces de stack

2. **TEST-com.enterprise.alert_civique.service.RegisterServiceTest.xml**
   - Résultats des tests d'inscription

3. **TEST-com.enterprise.alert_civique.controller.AuthControllerIntegrationTest.xml**
   - Résultats des tests d'intégration

### Interpréter les résultats:

```xml
<testcase name="testGenerateToken_Success" time="0.125" classname="...JwtServiceTest">
  <!-- PASS: pas d'élément failure ou error -->
</testcase>

<testcase name="testInvalidPassword" time="0.050" classname="...PasswordPolicyValidatorTest">
  <failure type="AssertionError">
    expected: true but was: false
  </failure>
</testcase>
```

### Console de sortie typique:

```
[INFO] Building alert-civique-back 0.0.1-SNAPSHOT
[INFO] --------------------------------
[INFO] Running com.enterprise.alert_civique.security.JwtServiceTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.234 s

[INFO] Running com.enterprise.alert_civique.service.RegisterServiceTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.456 s

[INFO] -------------------------------------------------------
[INFO] Tests run: 70, Failures: 0, Errors: 0, Skipped: 0
[INFO] -------------------------------------------------------
[INFO] BUILD SUCCESS
```

---

## 💡 Bonnes pratiques

### ✅ Avant d'exécuter les tests

1. **Nettoyer le build précédent**
   ```bash
   mvn clean
   ```

2. **Vérifier que le code compile**
   ```bash
   mvn compile
   ```

3. **Vérifier la connexion à la base de données**
   - Les tests utilisent H2 in-memory, aucune base externe requise

### ✅ Conventions des tests

Chaque test suit le pattern **AAA**:

```java
@Test
@DisplayName("Description claire du test")
public void testMethodName_Scenario_ExpectedResult() {
    // ===== ARRANGE =====
    // Préparer les données de test
    User testUser = new User();
    testUser.setEmail("test@example.com");
    
    // ===== ACT =====
    // Exécuter le code à tester
    User savedUser = userRepository.save(testUser);
    
    // ===== ASSERT =====
    // Vérifier le résultat
    assertNotNull(savedUser.getId());
    assertEquals("test@example.com", savedUser.getEmail());
}
```

### ✅ Nommage des tests

Convenctions:
- Format: `test<MethodName>_<Scenario>_<ExpectedResult>`
- Exemples:
  - ✅ `testGenerateToken_Success`
  - ✅ `testValidatePassword_TooShort`
  - ✅ `testFindByEmail_NotFound`
  - ❌ `testMethod` (trop vague)
  - ❌ `testCase1` (pas descriptif)

### ✅ Structure des données de test

```java
@BeforeEach
public void setUp() {
    // 1. Nettoyer les données précédentes
    userRepository.deleteAll();
    
    // 2. Créer les données nécessaires
    User testUser = new User();
    testUser.setEmail("test@example.com");
    testUser = userRepository.save(testUser);
    
    // 3. Les préparer pour les tests
    this.testUser = testUser;
}
```

---

## 🔧 Dépannage

### ❌ Erreur: "Tests cannot run"

**Cause:** Mauvaise configuration de Java

**Solution:**
```bash
# Vérifier la version Java
java -version

# Définir JAVA_HOME si nécessaire (Windows)
set JAVA_HOME=C:\Program Files\Java\jdk-17

# Vérifier Maven
mvn -version
```

### ❌ Erreur: "Database connection failed"

**Cause:** La base H2 n'est pas configurée correctement

**Solution:**
```bash
# Vérifier application-test.properties
cat src/test/resources/application-test.properties

# Doit contenir:
# spring.datasource.url=jdbc:h2:mem:testdb
# spring.datasource.driver-class-name=org.h2.Driver
```

### ❌ Erreur: "Test timeout"

**Cause:** Un test prend trop long

**Solution:**
```java
@Test(timeout = 5000)  // 5 secondes max
public void testFastMethod() {
    // Test code
}
```

### ❌ Erreur: "AssertionError: expected..."

**Cause:** Les données attendues ne correspondent pas

**Solution:**
1. Vérifier les données initiales dans `setUp()`
2. Ajouter des logs pour déboguer
3. Vérifier la logique du test

Exemple:
```java
@Test
public void testDebug() {
    User user = userRepository.save(testUser);
    
    // Ajouter des logs
    System.out.println("User ID: " + user.getId());
    System.out.println("User Email: " + user.getEmail());
    
    assertEquals("test@example.com", user.getEmail());
}
```

### ❌ Erreur: "Port already in use"

**Cause:** Un autre processus utilise le port

**Solution:**
```bash
# Trouver le processus
netstat -ano | findstr :8080

# Le tuer (remplacer PID)
taskkill /PID <PID> /F
```

### ✅ Succès de test

Après une exécution réussie:

1. **Rapport généré** dans `target/surefire-reports/`
2. **Couverture de code** (avec jacoco)
3. **0 erreurs, 0 échecs**
4. **BUILD SUCCESS**

---

## 📈 Métriques de couverture

### Générer le rapport jacoco

```bash
mvn clean test jacoco:report
# Rapport disponible dans: target/site/jacoco/index.html
```

### Objectifs de couverture

```
┌─────────────────────────────────────────┐
│  Couche           │  Couverture cible   │
├─────────────────────────────────────────┤
│  Sécurité (Security) │  95%+             │
│  Service         │  90%+             │
│  Repository      │  85%+             │
│  Contrôleur      │  80%+             │
└─────────────────────────────────────────┘
```

---

## 🔄 Intégration continue (CI/CD)

### Pour Jenkins/GitHub Actions

```bash
# Script CI/CD typique
#!/bin/bash
cd alert_civique_back
mvn clean test
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tous les tests ont réussi!"
    exit 0
else
    echo "❌ Des tests ont échoué!"
    exit 1
fi
```

---

## 📚 Ressources supplémentaires

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Spring Boot Testing Guide](https://spring.io/guides/gs/testing-web/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Test Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)

---

## ✨ Résumé des commandes principales

| Commande | Descripción |
|----------|-------------|
| `mvn test` | Exécuter tous les tests |
| `mvn clean test` | Nettoyer + exécuter tests |
| `mvn test -Dtest=ClassName` | Exécuter une class spécifique |
| `mvn test -Dtest=ClassName#methodName` | Exécuter une méthode spécifique |
| `mvn clean test jacoco:report` | Générer rapport de couverture |
| `mvn test -X` | Exécuter avec logs verbeux |
| `mvn test -DskipTests` | Compiler sans tests |

---

**Dernière mise à jour:** 2024
**Version:** 1.0
**Auteur:** Alert Civique Development Team
