package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour UserService
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("UserService Unit Tests")
public class UserServiceTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Roles clientRole;
    private Users testUser;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        userRepository.deleteAll();

        // Créer rôle
        clientRole = roleRepository.findFirstByName("ROLE_CLIENT").orElse(null);
        if (clientRole == null) {
            clientRole = new Roles();
            clientRole.setName("ROLE_CLIENT");
            clientRole = roleRepository.save(clientRole);
        }

        // Créer utilisateur test
        testUser = new Users();
        testUser.setEmail("testuser@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setFirstname("John");
        testUser.setLastname("Doe");
        testUser.setPhone("+33612345678");
        testUser.setBirthdate(LocalDate.of(1990, 1, 1));
        testUser.setActive(true);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        testUser.setRoles(roles);
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("Devrait sauvegarder un utilisateur avec succès")
    public void testSaveUser_Success() {
        // Arrange
        Users newUser = new Users();
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("password");
        newUser.setFirstname("Jane");
        newUser.setLastname("Smith");
        newUser.setPhone("+33687654321");
        newUser.setBirthdate(LocalDate.of(1995, 5, 5));
        newUser.setActive(true);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        newUser.setRoles(roles);

        // Act
        Users savedUser = userRepository.save(newUser);

        // Assert
        assertNotNull(savedUser.getUserId(), "L'ID utilisateur doit être généré");
        assertEquals("newuser@example.com", savedUser.getEmail());
        assertEquals("Jane", savedUser.getFirstname());
        assertTrue(savedUser.isActive());
    }

    @Test
    @DisplayName("Devrait récupérer un utilisateur par email")
    public void testFindByEmail_Success() {
        // Act
        Optional<Users> foundUser = userRepository.findByEmail(testUser.getEmail());

        // Assert
        assertTrue(foundUser.isPresent(), "L'utilisateur doit être trouvé");
        assertEquals(testUser.getEmail(), foundUser.get().getEmail());
        assertEquals(testUser.getFirstname(), foundUser.get().getFirstname());
    }

    @Test
    @DisplayName("Devrait retourner vide pour email inexistant")
    public void testFindByEmail_NotFound() {
        // Act
        Optional<Users> foundUser = userRepository.findByEmail("nonexistent@example.com");

        // Assert
        assertFalse(foundUser.isPresent(), "Aucun utilisateur ne doit être trouvé");
    }

    @Test
    @DisplayName("Devrait récupérer un utilisateur par ID")
    public void testFindById_Success() {
        // Act
        Optional<Users> foundUser = userRepository.findById(testUser.getUserId());

        // Assert
        assertTrue(foundUser.isPresent(), "L'utilisateur doit être trouvé");
        assertEquals(testUser.getUserId(), foundUser.get().getUserId());
    }

    @Test
    @DisplayName("Devrait retourner vide pour ID inexistant")
    public void testFindById_NotFound() {
        // Act
        Optional<Users> foundUser = userRepository.findById(9999L);

        // Assert
        assertFalse(foundUser.isPresent(), "Aucun utilisateur ne doit être trouvé");
    }

    @Test
    @DisplayName("Devrait vérifier si email existe")
    public void testExistsByEmail_True() {
        // Act
        boolean exists = userRepository.existsByEmail(testUser.getEmail());

        // Assert
        assertTrue(exists, "L'email doit exister");
    }

    @Test
    @DisplayName("Devrait vérifier si email n'existe pas")
    public void testExistsByEmail_False() {
        // Act
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // Assert
        assertFalse(exists, "L'email ne doit pas exister");
    }

    @Test
    @DisplayName("Devrait récupérer tous les utilisateurs")
    public void testFindAll_Success() {
        // Act
        List<Users> users = userRepository.findAll();

        // Assert
        assertNotNull(users);
        assertTrue(users.size() >= 1, "Au moins un utilisateur doit exister");
    }

    @Test
    @DisplayName("Devrait supprimer un utilisateur")
    public void testDelete_Success() {
        // Arrange
        Long userIdToDelete = testUser.getUserId();

        // Act
        userRepository.deleteById(userIdToDelete);

        // Assert
        Optional<Users> deletedUser = userRepository.findById(userIdToDelete);
        assertFalse(deletedUser.isPresent(), "L'utilisateur doit être supprimé");
    }

    @Test
    @DisplayName("Devrait mettre à jour un utilisateur")
    public void testUpdate_Success() {
        // Arrange
        testUser.setFirstname("Updated");
        testUser.setLastname("Name");
        testUser.setPhone("+33611111111");

        // Act
        Users updatedUser = userRepository.save(testUser);

        // Assert
        assertEquals("Updated", updatedUser.getFirstname());
        assertEquals("Name", updatedUser.getLastname());
        assertEquals("+33611111111", updatedUser.getPhone());
    }

    @Test
    @DisplayName("Devrait récupérer utilisateur avec rôles")
    public void testFindByEmailWithRoles_Success() {
        // Act
        Optional<Users> foundUser = userRepository.findByEmailWithRoles(testUser.getEmail());

        // Assert
        assertTrue(foundUser.isPresent(), "L'utilisateur doit être trouvé");
        assertNotNull(foundUser.get().getRoles(), "Les rôles doivent être chargés");
        assertTrue(foundUser.get().getRoles().size() > 0, "L'utilisateur doit avoir des rôles");
    }

    @Test
    @DisplayName("Devrait compter tous les utilisateurs")
    public void testCount_Success() {
        // Act
        long count = userRepository.count();

        // Assert
        assertTrue(count >= 1, "Au moins un utilisateur doit exister");
    }

    @Test
    @DisplayName("Devrait gérer plusieurs utilisateurs")
    public void testMultipleUsers_Success() {
        // Arrange - créer plusieurs utilisateurs
        for (int i = 0; i < 3; i++) {
            Users user = new Users();
            user.setEmail("user" + i + "@example.com");
            user.setPassword("password");
            user.setFirstname("User");
            user.setLastname("Test" + i);
            user.setPhone("+33612345678");
            user.setBirthdate(LocalDate.of(1990, 1, 1));
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setRegistrationDate(LocalDate.now());
            Set<Roles> roles = new HashSet<>();
            roles.add(clientRole);
            user.setRoles(roles);
            userRepository.save(user);
        }

        // Act
        List<Users> allUsers = userRepository.findAll();

        // Assert
        assertTrue(allUsers.size() >= 4, "Au moins 4 utilisateurs doivent exister");
    }
}
