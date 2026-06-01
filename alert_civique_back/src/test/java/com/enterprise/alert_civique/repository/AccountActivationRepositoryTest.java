package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.ActivationToken;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour IActivationRepository
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("AccountActivationRepository Unit Tests")
public class AccountActivationRepositoryTest {

    @Autowired
    private IActivationRepository activationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Users testUser;
    private ActivationToken testActivation;
    private String tokenHash;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        activationRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Créer un rôle
        Roles role = new Roles();
        role.setName("ROLE_TEST");
        role = roleRepository.save(role);

        // Créer un utilisateur test
        testUser = new Users();
        testUser.setEmail("test@example.com");
        testUser.setPassword("HashedPassword123!");
        testUser.setFirstname("John");
        testUser.setLastname("Doe");
        testUser.setPhone("1234567890");
        testUser = userRepository.save(testUser);

        // Créer un hash de token d'activation
        tokenHash = UUID.randomUUID().toString();

        // Créer l'activation
        testActivation = new ActivationToken();
        testActivation.setTokenHash(tokenHash);
        testActivation.setUser(testUser);
        testActivation.setExpiryDate(LocalDateTime.now().plusHours(24));
        testActivation.setUsed(false);
        testActivation = activationRepository.save(testActivation);
    }

    @Test
    @DisplayName("Devrait sauvegarder une activation de compte")
    public void testSaveActivation_Success() {
        // Arrange
        String newTokenHash = UUID.randomUUID().toString();
        ActivationToken newActivation = new ActivationToken();
        newActivation.setTokenHash(newTokenHash);
        newActivation.setUser(testUser);
        newActivation.setExpiryDate(LocalDateTime.now().plusHours(24));
        newActivation.setUsed(false);

        // Act
        ActivationToken saved = activationRepository.save(newActivation);

        // Assert
        assertNotNull(saved.getId(), "L'ID d'activation doit être généré");
        assertEquals(newTokenHash, saved.getTokenHash());
        assertFalse(saved.isUsed(), "Le token ne doit pas être utilisé");
    }

    @Test
    @DisplayName("Devrait trouver une activation par token hash")
    public void testFindByTokenHash_Success() {
        // Act
        ActivationToken found = activationRepository.findByTokenHash(tokenHash);

        // Assert
        assertNotNull(found, "L'activation doit être trouvée");
        assertEquals(testUser.getEmail(), found.getUser().getEmail());
        assertFalse(found.isUsed(), "Le token ne doit pas être utilisé");
    }

    @Test
    @DisplayName("Devrait retourner null pour token hash inexistant")
    public void testFindByTokenHash_NotFound() {
        // Act
        ActivationToken found = activationRepository.findByTokenHash(UUID.randomUUID().toString());

        // Assert
        assertNull(found, "Aucune activation ne doit être trouvée");
    }

    @Test
    @DisplayName("Devrait marquer une activation comme utilisée")
    public void testMarkUsed_Success() {
        // Arrange
        testActivation.setUsed(true);

        // Act
        ActivationToken updated = activationRepository.save(testActivation);

        // Assert
        assertTrue(updated.isUsed(), "Le token doit être marqué comme utilisé");
    }

    @Test
    @DisplayName("Devrait mettre à jour la date d'expiration")
    public void testUpdateExpiryDate_Success() {
        // Arrange
        LocalDateTime newExpiry = LocalDateTime.now().plusHours(48);

        // Act
        testActivation.setExpiryDate(newExpiry);
        ActivationToken updated = activationRepository.save(testActivation);

        // Assert
        assertEquals(newExpiry, updated.getExpiryDate());
    }

    @Test
    @DisplayName("Devrait supprimer une activation")
    public void testDelete_Success() {
        // Arrange
        Long activationId = testActivation.getId();

        // Act
        activationRepository.deleteById(activationId);

        // Assert
        assertFalse(activationRepository.findById(activationId).isPresent(),
                "L'activation doit être supprimée");
    }

    @Test
    @DisplayName("Devrait compter les activations")
    public void testCount_Success() {
        // Act
        long count = activationRepository.count();

        // Assert
        assertTrue(count >= 1, "Au moins une activation doit exister");
    }

    @Test
    @DisplayName("Devrait gérer les tokens d'activation multiples")
    public void testMultipleActivations_Success() {
        // Arrange - créer plusieurs tokens pour le même utilisateur
        for (int i = 0; i < 3; i++) {
            ActivationToken activation = new ActivationToken();
            activation.setTokenHash(UUID.randomUUID().toString());
            activation.setUser(testUser);
            activation.setExpiryDate(LocalDateTime.now().plusHours(24));
            activation.setUsed(false);
            activationRepository.save(activation);
        }

        // Act
        long count = activationRepository.count();

        // Assert
        assertTrue(count >= 4, "Au moins 4 activations doivent exister");
    }

    @Test
    @DisplayName("Devrait gérer les activations avec date d'expiration passée")
    public void testExpiredActivation_Success() {
        // Arrange
        ActivationToken expiredActivation = new ActivationToken();
        expiredActivation.setTokenHash(UUID.randomUUID().toString());
        expiredActivation.setUser(testUser);
        expiredActivation.setExpiryDate(LocalDateTime.now().minusHours(1));
        expiredActivation.setUsed(false);

        // Act
        ActivationToken saved = activationRepository.save(expiredActivation);

        // Assert
        assertTrue(saved.getExpiryDate().isBefore(LocalDateTime.now()),
                "La date d'expiration doit être dans le passé");
    }

    @Test
    @DisplayName("Devrait gérer les activations déjà utilisées")
    public void testUsedActivation_Success() {
        // Arrange
        ActivationToken usedActivation = new ActivationToken();
        usedActivation.setTokenHash(UUID.randomUUID().toString());
        usedActivation.setUser(testUser);
        usedActivation.setExpiryDate(LocalDateTime.now().plusHours(24));
        usedActivation.setUsed(true);

        // Act
        ActivationToken saved = activationRepository.save(usedActivation);

        // Assert
        assertTrue(saved.isUsed(), "L'activation doit être marquée comme utilisée");
    }

    @Test
    @DisplayName("Devrait récupérer une activation par ID")
    public void testFindById_Success() {
        // Act
        Optional<ActivationToken> found = activationRepository.findById(testActivation.getId());

        // Assert
        assertTrue(found.isPresent(), "L'activation doit être trouvée par ID");
        assertEquals(tokenHash, found.get().getTokenHash());
    }
}
