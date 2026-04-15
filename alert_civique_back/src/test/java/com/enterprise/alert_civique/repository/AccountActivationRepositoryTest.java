package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.service.AccountActivationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour AccountActivationRepository
 * @param <AccountActivationRepository>
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("AccountActivationRepository Unit Tests")
public class AccountActivationRepositoryTest<AccountActivationRepository> {

    @Autowired
    private AccountActivationRepository accountActivationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Users testUser;
    private AccountActivationService testActivation;
    private UUID activationToken;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        accountActivationRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Créer un rôle
        Roles role = new Roles();
        role.setName("ROLE_TEST");
        // role.setDescription("Test Role");
        role = roleRepository.save(role);

        // Créer un utilisateur test
        testUser = new Users();
        testUser.setEmail("test@example.com");
        testUser.setPassword("HashedPassword123!");
        testUser.setFirstname("John");
        testUser.setLastname("Doe");
        testUser.setPhone("1234567890");
        // testUser.setEnabled(false);
        testUser = userRepository.save(testUser);

        // Créer un token d'activation
        activationToken = UUID.randomUUID();

        // Créer l'activation
        testActivation = new AccountActivation();
        testActivation.setActivationToken(activationToken);
        testActivation.setUser(testUser);
        testActivation.setExpirationDate(Instant.now().plusSeconds(86400)); // 24h
        testActivation.setUsed(false);
        testActivation = accountActivationRepository.save(testActivation);
    }

    @Test
    @DisplayName("Devrait sauvegarder une activation de compte")
    public void testSaveActivation_Success() {
        // Arrange
        UUID newToken = UUID.randomUUID();
        AccountActivation newActivation = new AccountActivation();
        newActivation.setActivationToken(newToken);
        newActivation.setUser(testUser);
        newActivation.setExpirationDate(Instant.now().plusSeconds(86400));
        newActivation.setUsed(false);

        // Act
        AccountActivation saved = accountActivationRepository.save(newActivation);

        // Assert
        assertNotNull(saved.getActivationId(), "L'ID d'activation doit être généré");
        assertEquals(newToken, saved.getActivationToken());
        assertFalse(saved.isUsed(), "Le token ne doit pas être utilisé");
    }

    @Test
    @DisplayName("Devrait trouver une activation par token")
    public void testFindByActivationToken_Success() {
        // Act
        Optional<AccountActivation> found = accountActivationRepository
                .findByActivationToken(activationToken);

        // Assert
        assertTrue(found.isPresent(), "L'activation doit être trouvée");
        assertEquals(testUser.getEmail(), found.get().getUser().getEmail());
        assertFalse(found.get().isUsed(), "Le token ne doit pas être utilisé");
    }

    @Test
    @DisplayName("Devrait retourner vide pour token inexistant")
    public void testFindByActivationToken_NotFound() {
        // Act
        Optional<AccountActivation> found = accountActivationRepository
                .findByActivationToken(UUID.randomUUID());

        // Assert
        assertFalse(found.isPresent(), "Aucune activation ne doit être trouvée");
    }

    @Test
    @DisplayName("Devrait trouver une activation par utilisateur")
    public void testFindByUser_Success() {
        // Act
        Optional<AccountActivation> found = accountActivationRepository
                .findByUser(testUser);

        // Assert
        assertTrue(found.isPresent(), "L'activation doit être trouvée");
        assertEquals(activationToken, found.get().getActivationToken());
    }

    @Test
    @DisplayName("Devrait marquer une activation comme utilisée")
    public void testMarkUsed_Success() {
        // Arrange
        testActivation.setUsed(true);

        // Act
        AccountActivation updated = accountActivationRepository.save(testActivation);

        // Assert
        assertTrue(updated.isUsed(), "Le token doit être marqué comme utilisé");
    }

    @Test
    @DisplayName("Devrait mettre à jour la date d'expiration")
    public void testUpdateExpirationDate_Success() {
        // Arrange
        Instant newExpiration = Instant.now().plusSeconds(172800); // 48h

        // Act
        testActivation.setExpirationDate(newExpiration);
        AccountActivation updated = accountActivationRepository.save(testActivation);

        // Assert
        assertEquals(newExpiration, updated.getExpirationDate());
    }

    @Test
    @DisplayName("Devrait supprimer une activation")
    public void testDelete_Success() {
        // Arrange
        Long activationId = testActivation.getActivationId();

        // Act
        accountActivationRepository.deleteById(activationId);

        // Assert
        assertFalse(accountActivationRepository.findById(activationId).isPresent(),
                "L'activation doit être supprimée");
    }

    @Test
    @DisplayName("Devrait compter les activations")
    public void testCount_Success() {
        // Act
        long count = accountActivationRepository.count();

        // Assert
        assertTrue(count >= 1, "Au moins une activation doit exister");
    }

    @Test
    @DisplayName("Devrait gérer les tokens d'activation multiples")
    public void testMultipleActivations_Success() {
        // Arrange - créer plusieurs tokens pour le même utilisateur
        for (int i = 0; i < 3; i++) {
            AccountActivation activation = new AccountActivation();
            activation.setActivationToken(UUID.randomUUID());
            activation.setUser(testUser);
            activation.setExpirationDate(Instant.now().plusSeconds(86400));
            activation.setUsed(false);
            accountActivationRepository.save(activation);
        }

        // Act
        long count = accountActivationRepository.count();

        // Assert
        assertTrue(count >= 4, "Au moins 4 activations doivent exister");
    }

    @Test
    @DisplayName("Devrait gérer les activations avec date d'expiration passée")
    public void testExpiredActivation_Success() {
        // Arrange
        AccountActivation expiredActivation = new AccountActivation();
        expiredActivation.setActivationToken(UUID.randomUUID());
        expiredActivation.setUser(testUser);
        expiredActivation.setExpirationDate(Instant.now().minusSeconds(3600)); // -1h
        expiredActivation.setUsed(false);

        // Act
        AccountActivation saved = accountActivationRepository.save(expiredActivation);

        // Assert
        assertTrue(saved.getExpirationDate().isBefore(Instant.now()),
                "La date d'expiration doit être dans le passé");
    }

    @Test
    @DisplayName("Devrait gérer les activations déjà utilisées")
    public void testUsedActivation_Success() {
        // Arrange
        AccountActivation usedActivation = new AccountActivation();
        usedActivation.setActivationToken(UUID.randomUUID());
        usedActivation.setUser(testUser);
        usedActivation.setExpirationDate(Instant.now().plusSeconds(86400));
        usedActivation.setUsed(true);

        // Act
        AccountActivation saved = accountActivationRepository.save(usedActivation);

        // Assert
        assertTrue(saved.isUsed(), "L'activation doit être marquée comme utilisée");
    }

    @Test
    @DisplayName("Devrait récupérer une activation par ID")
    public void testFindById_Success() {
        // Act
        Optional<AccountActivation> found = accountActivationRepository
                .findById(testActivation.getActivationId());

        // Assert
        assertTrue(found.isPresent(), "L'activation doit être trouvée par ID");
        assertEquals(activationToken, found.get().getActivationToken());
    }
}
