package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.Roles;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour RoleRepository
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("RoleRepository Unit Tests")
public class RoleRepositoryTest {

    @Autowired
    private RoleRepository roleRepository;

    private Roles testRole;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        roleRepository.deleteAll();

        // Créer un rôle test
        testRole = new Roles();
        testRole.setName("TEST_ROLE");
        testRole = roleRepository.save(testRole);
    }

    @Test
    @DisplayName("Devrait sauvegarder un rôle avec succès")
    public void testSaveRole_Success() {
        // Arrange
        Roles newRole = new Roles();
        newRole.setName("NEW_ROLE");

        // Act
        Roles savedRole = roleRepository.save(newRole);

        // Assert
        assertNotNull(savedRole.getRoleId(), "L'ID rôle doit être généré");
        assertEquals("NEW_ROLE", savedRole.getName());
    }

    @Test
    @DisplayName("Devrait récupérer un rôle par ID")
    public void testFindById_Success() {
        // Act
        Optional<Roles> foundRole = roleRepository.findById(testRole.getRoleId());

        // Assert
        assertTrue(foundRole.isPresent(), "Le rôle doit être trouvé");
        assertEquals(testRole.getName(), foundRole.get().getName());
    }

    @Test
    @DisplayName("Devrait retourner vide pour ID inexistant")
    public void testFindById_NotFound() {
        // Act
        Optional<Roles> foundRole = roleRepository.findById(9999L);

        // Assert
        assertFalse(foundRole.isPresent(), "Aucun rôle ne doit être trouvé");
    }

    @Test
    @DisplayName("Devrait récupérer un rôle par nom")
    public void testFindFirstByName_Success() {
        // Act
        Optional<Roles> foundRole = roleRepository.findFirstByName("TEST_ROLE");

        // Assert
        assertTrue(foundRole.isPresent(), "Le rôle doit être trouvé");
        assertEquals("TEST_ROLE", foundRole.get().getName());
    }

    @Test
    @DisplayName("Devrait retourner vide pour nom inexistant")
    public void testFindFirstByName_NotFound() {
        // Act
        Optional<Roles> foundRole = roleRepository.findFirstByName("NONEXISTENT_ROLE");

        // Assert
        assertFalse(foundRole.isPresent(), "Aucun rôle ne doit être trouvé");
    }

    @Test
    @DisplayName("Devrait récupérer tous les rôles")
    public void testFindAll_Success() {
        // Act
        var roles = roleRepository.findAll();

        // Assert
        assertNotNull(roles);
        assertTrue(roles.size() >= 1, "Au moins un rôle doit exister");
    }

    @Test
    @DisplayName("Devrait supprimer un rôle")
    public void testDelete_Success() {
        // Arrange
        Long roleIdToDelete = testRole.getRoleId();

        // Act
        roleRepository.deleteById(roleIdToDelete);

        // Assert
        Optional<Roles> deletedRole = roleRepository.findById(roleIdToDelete);
        assertFalse(deletedRole.isPresent(), "Le rôle doit être supprimé");
    }

    @Test
    @DisplayName("Devrait mettre à jour le nom d'un rôle")
    public void testUpdate_Success() {
        // Arrange
        testRole.setName("UPDATED_ROLE");

        // Act
        Roles updatedRole = roleRepository.save(testRole);

        // Assert
        assertEquals("UPDATED_ROLE", updatedRole.getName());
    }

    @Test
    @DisplayName("Devrait compter tous les rôles")
    public void testCount_Success() {
        // Act
        long count = roleRepository.count();

        // Assert
        assertTrue(count >= 1, "Au moins un rôle doit exister");
    }

    @Test
    @DisplayName("Devrait gérer plusieurs rôles")
    public void testMultipleRoles_Success() {
        // Arrange - créer plusieurs rôles
        String[] roleNames = {"ROLE_ADMIN", "ROLE_USER", "ROLE_MODERATOR"};
        for (String roleName : roleNames) {
            Roles role = new Roles();
            role.setName(roleName);
            roleRepository.save(role);
        }

        // Act
        var allRoles = roleRepository.findAll();

        // Assert
        assertTrue(allRoles.size() >= 4, "Au moins 4 rôles doivent exister");

        // Vérifier que les rôles spécifiques existent
        for (String roleName : roleNames) {
            assertTrue(roleRepository.findFirstByName(roleName).isPresent(),
                    "Le rôle " + roleName + " doit exister");
        }
    }

    @Test
    @DisplayName("Devrait gérer les noms de rôle case-sensitive")
    public void testRoleNameCaseSensitive() {
        // Arrange
        Roles upperRole = new Roles();
        upperRole.setName("TEST");
        roleRepository.save(upperRole);

        // Act
        Optional<Roles> foundUpper = roleRepository.findFirstByName("TEST");
        Optional<Roles> foundLower = roleRepository.findFirstByName("test");

        // Assert
        assertTrue(foundUpper.isPresent(), "Rôle en majuscules doit être trouvé");
        assertFalse(foundLower.isPresent(), "Rôle en minuscules ne doit pas être trouvé");
    }
}
