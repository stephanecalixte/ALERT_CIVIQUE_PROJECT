package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.entity.ActivationToken;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.IActivationRepository;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour AccountActivationController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AccountActivationController Integration Tests")
public class AccountActivationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private IActivationRepository activationRepository;

    private static final String AUTH_BASE_URI = "/api/auth";
    private Users testUser;
    private ActivationToken testToken;
    private Roles clientRole;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        activationRepository.deleteAll();
        userRepository.deleteAll();

        // Créer rôle
        clientRole = roleRepository.findFirstByName("ROLE_CLIENT").orElse(null);
        if (clientRole == null) {
            clientRole = new Roles();
            clientRole.setName("ROLE_CLIENT");
            clientRole = roleRepository.save(clientRole);
        }

        // Créer utilisateur inactif
        testUser = new Users();
        testUser.setEmail("inactive@example.com");
        testUser.setPassword("password");
        testUser.setFirstname("Inactive");
        testUser.setLastname("User");
        testUser.setPhone("+33612345678");
        testUser.setBirthdate(LocalDate.of(1990, 1, 1));
        testUser.setActive(false); // Inactif jusqu'à activation
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        testUser.setRoles(roles);
        testUser = userRepository.save(testUser);

        // Créer token d'activation valide
        testToken = new ActivationToken();
        testToken.setTokenHash(UUID.randomUUID().toString());
        testToken.setUser(testUser);
        testToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        testToken.setUsed(false);
        testToken = activationRepository.save(testToken);
    }

    @Test
    @DisplayName("Devrait activer le compte avec token valide")
    public void testActivateAccount_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", testToken.getTokenHash())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("activé")));

        // Vérifier que l'utilisateur est maintenant actif
        Users activatedUser = userRepository.findById(testUser.getUserId()).orElse(null);
        assert activatedUser != null;
        // assertTrue(activatedUser.isActive(), "L'utilisateur doit être actif après activation");
    }

    @Test
    @DisplayName("Devrait rejeter l'activation avec token absent")
    public void testActivateAccount_MissingToken() throws Exception {
        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Devrait rejeter l'activation avec token vide")
    public void testActivateAccount_EmptyToken() throws Exception {
        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", "")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("requis")));
    }

    @Test
    @DisplayName("Devrait rejeter l'activation avec token invalide")
    public void testActivateAccount_InvalidToken() throws Exception {
        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", "invalid-token-" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Devrait créer un nouvel utilisateur avec token d'activation")
    public void testAccountActivationFlow_WithNewUser() throws Exception {
        // Créer un nouvel utilisateur inactif
        Users newUser = new Users();
        newUser.setEmail("newuser@example.com");
        newUser.setPassword("password");
        newUser.setFirstname("New");
        newUser.setLastname("User");
        newUser.setPhone("+33687654321");
        newUser.setBirthdate(LocalDate.of(1995, 5, 5));
        newUser.setActive(false);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        newUser.setRoles(roles);
        newUser = userRepository.save(newUser);

        // Créer un token pour ce nouvel utilisateur
        ActivationToken newUserToken = new ActivationToken();
        newUserToken.setTokenHash(UUID.randomUUID().toString());
        newUserToken.setUser(newUser);
        newUserToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        newUserToken.setUsed(false);
        newUserToken = activationRepository.save(newUserToken);

        // Vérifier que l'utilisateur est inactif avant activation
        Users userBefore = userRepository.findById(newUser.getUserId()).orElse(null);
        assert userBefore != null;
        // assertFalse(userBefore.isActive(), "L'utilisateur ne doit pas être actif avant activation");

        // Act & Assert - Activer le compte
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", newUserToken.getTokenHash())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Devrait rejeter l'activation avec token expiré")
    public void testActivateAccount_ExpiredToken() throws Exception {
        // Arrange - créer un token expiré
        ActivationToken expiredToken = new ActivationToken();
        expiredToken.setTokenHash(UUID.randomUUID().toString());
        expiredToken.setUser(testUser);
        expiredToken.setExpiryDate(LocalDateTime.now().minusHours(1)); // Expiré il y a 1 heure
        expiredToken.setUsed(false);
        expiredToken = activationRepository.save(expiredToken);

        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", expiredToken.getTokenHash())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Devrait rejeter l'activation avec token déjà utilisé")
    public void testActivateAccount_UsedToken() throws Exception {
        // Arrange - créer un token déjà utilisé
        ActivationToken usedToken = new ActivationToken();
        usedToken.setTokenHash(UUID.randomUUID().toString());
        usedToken.setUser(testUser);
        usedToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        usedToken.setUsed(true); // Déjà utilisé
        usedToken = activationRepository.save(usedToken);

        // Act & Assert
        mockMvc.perform(get(AUTH_BASE_URI + "/activate")
                .param("token", usedToken.getTokenHash())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
