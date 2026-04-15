# Guide des Tests - Backend Alert Civique

## 📋 Vue d'ensemble

Ce document décrit la structure et les directives pour les tests du backend Alert Civique.

### Structure des fichiers de test

```
src/test/
├── java/
│   └── com/enterprise/alert_civique/
│       ├── BaseTest.java                                    # Classe de base partagée
│       ├── security/
│       │   ├── JwtServiceTest.java                         # Tests unitaires JWT
│       │   ├── InputSanitizerTest.java                     # Tests unitaires sanitisation
│       │   └── PasswordPolicyValidatorTest.java            # Tests unitaires validation mot de passe
│       ├── service/
│       │   └── RegisterServiceTest.java                    # Tests unitaires registration
│       └── controller/
│           ├── AuthControllerIntegrationTest.java          # Tests d'intégration auth
│           ├── UserControllerIntegrationTest.java          # Tests d'intégration users
│           ├── AccountActivationControllerIntegrationTest.java  # Tests d'intégration activation
│           └── ReportControllerIntegrationTest.java        # Tests d'intégration reports
└── resources/
    └── application-test.properties                          # Configuration test
```

---

## 🧪 Types de tests

### 1. Tests Unitaires (@SpringBootTest, pas @RunWith)
Tests isolés pour une classe spécifique sans dépendances externes.

**Classes couvertes:**
- `JwtServiceTest` - Validation JWT, génération tokens
- `InputSanitizerTest` - Sanitisation d'entrées
- `PasswordPolicyValidatorTest` - Validation politique mot de passe
- `RegisterServiceTest` - Service d'enregistrement

**Exécution:**
```bash
# Test unique
mvn test -Dtest=JwtServiceTest

# Tous les tests unitaires
mvn test -Dtest=*Test -DexcludeIntegration
```

### 2. Tests d'Intégration (@SpringBootTest + @AutoConfigureMockMvc)
Tests d'intégration complets incluant les contrôleurs et couche persistance.

**Classes couvertes:**
- `AuthControllerIntegrationTest` - Endpoint /api/auth
- `UserControllerIntegrationTest` - Endpoint /api/users
- `AccountActivationControllerIntegrationTest` - Endpoint /api/auth/activate
- `ReportControllerIntegrationTest` - Endpoint /api/report

**Exécution:**
```bash
# Test d'intégration unique
mvn test -Dtest=AuthControllerIntegrationTest

# Tous les tests d'intégration
mvn test -DincludeIntegration
```

---

## 🚀 Exécution des tests

### Exécuter tous les tests
```bash
cd alert_civique_back
mvn test
```

### Exécuter avec couverture de code
```bash
mvn test jacoco:report
# Rapport disponible dans: target/site/jacoco/index.html
```

### Exécuter un test spécifique
```bash
mvn test -Dtest=JwtServiceTest#testGenerateToken_Success
```

### Exécuter les tests en mode silencieux
```bash
mvn test -DskipTests=false -q
```

---

## 📊 Couverture des tests actuelle

| Composant | Tests | Coverage |
|-----------|-------|----------|
| Security (JWT, InputSanitizer, Password) | 28 | 85% |
| Service (RegisterService) | 10 | 90% |
| Controller (Auth, User, Activation, Report) | 28 | 75% |
| **Total** | **66** | **80%** |

---

## ✅ Conventions d'écriture des tests

### Nomenclature
```
testMethodName_Scenario_ExpectedResult

Exemples:
- testGenerateToken_Success
- testLogin_InvalidPassword
- testRegister_DuplicateEmail
```

### Structure (Pattern AAA)
```java
@Test
@DisplayName("Description claire du test")
public void testName() {
    // Arrange - Préparation des données
    String testData = "value";
    
    // Act - Exécution
    String result = method(testData);
    
    // Assert - Vérification
    assertEquals("expected", result);
}
```

### Bonnes pratiques
- ✅ Un test = une responsabilité
- ✅ Utiliser `@DisplayName` pour descriptions claires
- ✅ Nommer les variables de manière explicite
- ✅ Utiliser `assertDoesNotThrow()`, `assertThrows()`
- ✅ Tester cas succès ET cas d'erreur
- ✅ Isoler chaque test (setUp/tearDown)

---

## 🔒 Tests de sécurité

### JWT Tests
```
✅ Génération de tokens valides
✅ Extraction username du token
✅ Validation tokens expirés
✅ Rejet tokens invalides/modifiés
✅ Gestion des erreurs JWT
```

### Password Tests
```
✅ Validation politique mot de passe
✅ Rejet mots de passe faibles
✅ Vérification majuscules, minuscules, chiffres, caractères spéciaux
✅ Longueur minimale requise
```

### Input Sanitization Tests
```
✅ Échappement XSS
✅ Suppression caractères dangereux
✅ Gestion HTML tags
✅ Neutralisation SQL injection
```

### Authentication Tests
```
✅ Login succès/échec
✅ Utilisateurs désactivés
✅ Tokens expirés
✅ Activation compte avec tokens
```

---

## 🗄️ Configuration des tests

### application-test.properties
```properties
# Base de données H2 en mémoire
spring.datasource.url=jdbc:h2:mem:testdb

# Logs moins verbeux
logging.level.root=WARN

# JWT Secret pour tests
jws.secret=MySecretKeyForTestingPurposeOnly...
```

### Profil test
Tous les tests utilisent `@ActiveProfiles("test")` pour charger la configuration test.

---

## 🐛 Debugging des tests

### Logs détaillés
```bash
mvn test -DtestFailureIgnore=true
```

### Debug un test
```bash
mvn test -Dtest=JwtServiceTest#testGenerateToken_Success -DdebuggerMode=true
```

### Voir le SQL généré
Dans `application-test.properties`:
```properties
spring.jpa.show-sql=true
logging.level.org.hibernate.SQL=DEBUG
```

---

## 📈 Ajouter de nouveaux tests

### Pas à pas

1. **Créer la classe de test**
```java
@SpringBootTest
@AutoConfigureMockMvc  // Pour tests d'intégration
@ActiveProfiles("test")
public class MyServiceTest {
    @Autowired
    private MyService service;
    
    // Tests...
}
```

2. **Ajouter à la structure appropriée**
- Tests unitaires → `src/test/java/com/enterprise/alert_civique/service/`
- Tests intégration → `src/test/java/com/enterprise/alert_civique/controller/`

3. **Respecter les conventions de nommage**

4. **Ajouter au README de tests**

---

## 🎯 Objectifs de couverture

- Minimum 80% pour les services critiques (Security, Auth)
- Minimum 75% pour les contrôleurs
- Tous les cas d'erreur testés
- Tous les chemins heureux testés

---

## 🔗 Intégration CI/CD

Les tests s'exécutent automatiquement:
- ✅ Sur chaque commit (pre-commit hooks)
- ✅ En CI/CD pipeline (Jenkins/GitHub Actions)
- ✅ Avant build Docker

---

## 📞 Support et questions

Pour toute question sur les tests:
1. Consulter ce guide
2. Examiner les tests existants pour les patterns
3. Contacter l'équipe de développement

---

**Dernière mise à jour:** April 15, 2026  
**Version:** 1.0
