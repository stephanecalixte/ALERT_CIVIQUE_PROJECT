# Implémentations Sécurité Manquantes - BLACKBOXAI

## 1. Activation Token Controller
**Ajouter à AuthController.java:**
```java
@GetMapping("/activate")
public ResponseEntity<String> activate(@RequestParam String token) {
  try {
    boolean activated = activationService.activate(token);
    return activated ? ResponseEntity.ok("Compte activé!") 
                    : ResponseEntity.badRequest().body("Token invalide/expiré");
  } catch (Exception e) {
    return ResponseEntity.status(500).body("Erreur activation");
  }
}
```

## 2. ActivationService + Impl
**ActivationService.java:**
```java
public interface ActivationService {
  boolean activate(String tokenHash) throws Exception;
}
```

**ActivationServiceImpl.java:**
```java
@Service
@RequiredArgsConstructor
public class ActivationServiceImpl implements ActivationService {
  private final IActivationRepository activationRepository;
  private final UserRepository userRepository;

  @Override
  public boolean activate(String tokenHash) throws Exception {
    ActivationToken token = activationRepository.findByTokenHash(tokenHash);
    if (token == null || token.isUsed() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
      return false;
    }
    Users user = token.getUser();
    user.setActive(true);
    userRepository.save(user);
    token.setUsed(true);
    activationRepository.save(token);
    return true;
  }
}
```

## 3. Ajouts AuthController
**Imports:**
```java
import com.enterprise.alert_civique.service.ActivationService;
private final ActivationService activationService;
```

**Constructor:**
```java
this.activationService = activationService;
```

## 4. SecurityConfig - Ajout JwtFilter
**Imports:**
```java
import com.enterprise.alert_civique.security.JwtAuthenticationFilter;
```

**FilterChain:**
```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

**Constructor:**
```java
private final JwtAuthenticationFilter jwtAuthenticationFilter;
```

## 5. Test Flux Complet
```
1. POST /api/auth/register → Token généré
2. GET /api/auth/activate?token=UUID → Active=true  
3. POST /api/auth/login → JWT (active requis)
4. GET /api/user/** → Bearer JWT → Autorisé
```

## Commandes:
```
mvn clean compile
mvn spring-boot:run
curl -X POST http://localhost:8082/api/auth/register -H "Content-Type: application/json" -d '{"firstname":"test","lastname":"test","email":"test@test.com","password":"Test123!@#","phone":"0123456789","birthdate":"1990-01-01"}'
```

**À implémenter dans VSCode après copier les codes!** 🚀
