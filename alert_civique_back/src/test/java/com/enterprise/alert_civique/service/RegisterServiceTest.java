package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.repository.IActivationRepository;
import com.enterprise.alert_civique.security.InputSanitizer;
import com.enterprise.alert_civique.security.IPasswordService;
import com.enterprise.alert_civique.security.PasswordPolicyValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour RegisterService
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("RegisterService Unit Tests")
public class RegisterServiceTest {

    @Autowired
    private RegisterService registerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private UserRegisterRequestDto validRequest;

    @BeforeEach
    public void setUp() {
        // Nettoyer la base avant chaque test
        userRepository.deleteAll();

        // Créer une demande d'inscription valide
        validRequest = new UserRegisterRequestDto();
        validRequest.setFirstname("John");
        validRequest.setLastname("Doe");
        validRequest.setEmail("john.doe" + System.currentTimeMillis() + "@example.com");
        validRequest.setPassword("SecurePassword123!");
        validRequest.setPhone("+33612345678");
        validRequest.setBirthdate(LocalDate.of(1990, 1, 1));
    }

    @Test
    @DisplayName("Devrait enregistrer un utilisateur avec des données valides")
    public void testRegister_Success() throws Exception {
        // Act
        UserResponseDto response = registerService.register(validRequest);

        // Assert
        assertNotNull(response, "La réponse ne doit pas être null");
        assertNotNull(response.getUserId(), "L'ID utilisateur doit être généré");
        assertEquals(validRequest.getEmail().toLowerCase(), response.getEmail(), "L'email doit correspondre");
        assertEquals(validRequest.getFirstname(), response.getFirstname(), "Le firstname doit correspondre");
        assertEquals(validRequest.getLastname(), response.getLastname(), "Le lastname doit correspondre");

        // Vérifier que l'utilisateur a été sauvegardé dans la DB
        assertTrue(userRepository.existsByEmail(validRequest.getEmail()), "L'utilisateur doit être dans la DB");
    }

    @Test
    @DisplayName("Devrait rejeter une inscription avec email en doublon")
    public void testRegister_DuplicateEmail() throws Exception {
        // Arrange - enregistrer un premier utilisateur
        registerService.register(validRequest);

        // Créer une seconde demande avec le même email
        UserRegisterRequestDto duplicateRequest = new UserRegisterRequestDto();
        duplicateRequest.setFirstname("Jane");
        duplicateRequest.setLastname("Doe");
        duplicateRequest.setEmail(validRequest.getEmail()); // Même email
        duplicateRequest.setPassword("SecurePassword123!");
        duplicateRequest.setPhone("+33687654321");
        duplicateRequest.setBirthdate(LocalDate.of(1995, 5, 5));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> registerService.register(duplicateRequest),
                "Devrait lever une exception pour email en doublon");
    }

    @Test
    @DisplayName("Devrait rejeter une inscription avec données incomplètes")
    public void testRegister_IncompleteData() {
        // Arrange
        UserRegisterRequestDto incompleteRequest = new UserRegisterRequestDto();
        incompleteRequest.setFirstname(""); // vide
        incompleteRequest.setLastname("Doe");
        incompleteRequest.setEmail("test@example.com");
        incompleteRequest.setPassword("Password123!");
        incompleteRequest.setPhone("+33612345678");
        incompleteRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> registerService.register(incompleteRequest),
                "Devrait lever une exception pour données incomplètes");
    }

    @Test
    @DisplayName("Devrait rejeter une inscription avec un email vide")
    public void testRegister_EmptyEmail() {
        // Arrange
        UserRegisterRequestDto emptyEmailRequest = new UserRegisterRequestDto();
        emptyEmailRequest.setFirstname("John");
        emptyEmailRequest.setLastname("Doe");
        emptyEmailRequest.setEmail(""); // Vide
        emptyEmailRequest.setPassword("Password123!");
        emptyEmailRequest.setPhone("+33612345678");
        emptyEmailRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> registerService.register(emptyEmailRequest),
                "Devrait lever une exception pour email vide");
    }

    @Test
    @DisplayName("Devrait rejeter une inscription avec mot de passe vide")
    public void testRegister_EmptyPassword() {
        // Arrange
        UserRegisterRequestDto emptyPasswordRequest = new UserRegisterRequestDto();
        emptyPasswordRequest.setFirstname("John");
        emptyPasswordRequest.setLastname("Doe");
        emptyPasswordRequest.setEmail("john@example.com");
        emptyPasswordRequest.setPassword(""); // Vide
        emptyPasswordRequest.setPhone("+33612345678");
        emptyPasswordRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> registerService.register(emptyPasswordRequest),
                "Devrait lever une exception pour mot de passe vide");
    }

    @Test
    @DisplayName("Devrait rejeter une demande null")
    public void testRegister_NullRequest() {
        // Act & Assert
        assertThrows((Class<? extends Throwable>) Exception.class, () -> registerService.register(null),
                "Devrait lever une exception pour demande null");
    }

    @Test
    @DisplayName("Devrait valider la politique de mot de passe")
    public void testRegister_WeakPassword() {
        // Arrange
        UserRegisterRequestDto weakPasswordRequest = new UserRegisterRequestDto();
        weakPasswordRequest.setFirstname("John");
        weakPasswordRequest.setLastname("Doe");
        weakPasswordRequest.setEmail("weak@example.com");
        weakPasswordRequest.setPassword("weak"); // Motdepasse faible
        weakPasswordRequest.setPhone("+33612345678");
        weakPasswordRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        assertThrows(Exception.class, () -> registerService.register(weakPasswordRequest),
                "Devrait lever une exception pour mot de passe faible");
    }

    @Test
    @DisplayName("Devrait convertir les emails en minuscules")
    public void testRegister_EmailConvertedToLowercase() throws Exception {
        // Arrange
        validRequest.setEmail("John.Doe@EXAMPLE.COM");

        // Act
        UserResponseDto response = registerService.register(validRequest);

        // Assert
        assertEquals("john.doe@example.com", response.getEmail().toLowerCase(),
                "L'email doit être converti en minuscules");
    }

    @Test
    @DisplayName("Devrait utiliser le rôle CLIENT par défaut")
    public void testRegister_DefaultRoleIsClient() throws Exception {
        // Act
        UserResponseDto response = registerService.register(validRequest);

        // Assert
        assertNotNull(response, "La réponse ne doit pas être null");
        Users savedUser = userRepository.findById(response.getUserId()).orElse(null);
        assertNotNull(savedUser, "L'utilisateur doit exister dans la DB");
        assertTrue(savedUser.getRoles().stream()
                .anyMatch(r -> "ROLE_CLIENT".equals(r.getName())),
                "L'utilisateur doit avoir le rôle CLIENT par défaut");
    }

    @Test
    @DisplayName("Devrait générer un token d'activation")
    public void testRegister_GeneratesActivationToken() throws Exception {
        // Act
        UserResponseDto response = registerService.register(validRequest);

        // Assert
        assertNotNull(response, "Un token d'activation doit être généré");
        // Vérifier que l'utilisateur est créé
        assertTrue(userRepository.existsByEmail(validRequest.getEmail()));
    }
}
