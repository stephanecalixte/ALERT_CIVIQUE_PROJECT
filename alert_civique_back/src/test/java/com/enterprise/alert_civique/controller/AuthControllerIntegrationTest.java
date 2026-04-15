package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.LoginRequestDTO;
import com.enterprise.alert_civique.dto.LoginResponseDto;
import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.security.IPasswordService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour AuthController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController Integration Tests")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private IPasswordService passwordService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String AUTH_BASE_URI = "/api/auth";
    private String testEmail;
    private String testPassword;
    private Roles clientRole;

    @BeforeEach
    public void setUp() {
        // Nettoyer la base
        userRepository.deleteAll();

        // Préparer les données
        testEmail = "test" + System.currentTimeMillis() + "@example.com";
        testPassword = "SecurePassword123!";

        // Créer le rôle CLIENT s'il n'existe pas
        clientRole = roleRepository.findFirstByName("ROLE_CLIENT").orElse(null);
        if (clientRole == null) {
            clientRole = new Roles();
            clientRole.setName("ROLE_CLIENT");
            // clientRole.setDescription("Utilisateur Client");
            clientRole = roleRepository.save(clientRole);
        }
    }

    @Test
    @DisplayName("Devrait enregistrer un nouvel utilisateur avec succès")
    public void testRegister_Success() throws Exception {
        // Arrange
        UserRegisterRequestDto registerRequest = new UserRegisterRequestDto();
        registerRequest.setFirstname("John");
        registerRequest.setLastname("Doe");
        registerRequest.setEmail(testEmail);
        registerRequest.setPassword(testPassword);
        registerRequest.setPhone("+33612345678");
        registerRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId", notNullValue()))
                .andExpect(jsonPath("$.email", equalTo(testEmail)))
                .andExpect(jsonPath("$.firstname", equalTo("John")))
                .andExpect(jsonPath("$.lastname", equalTo("Doe")));
    }

    @Test
    @DisplayName("Devrait rejeter l'enregistrement avec email en doublon")
    public void testRegister_DuplicateEmail() throws Exception {
        // Arrange - créer un premier utilisateur
        UserRegisterRequestDto firstRequest = new UserRegisterRequestDto();
        firstRequest.setFirstname("John");
        firstRequest.setLastname("Doe");
        firstRequest.setEmail(testEmail);
        firstRequest.setPassword(testPassword);
        firstRequest.setPhone("+33612345678");
        firstRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        mockMvc.perform(post(AUTH_BASE_URI + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // Créer une second demande avec le même email
        UserRegisterRequestDto secondRequest = new UserRegisterRequestDto();
        secondRequest.setFirstname("Jane");
        secondRequest.setLastname("Doe");
        secondRequest.setEmail(testEmail); // Même email
        secondRequest.setPassword(testPassword);
        secondRequest.setPhone("+33687654321");
        secondRequest.setBirthdate(LocalDate.of(1995, 5, 5));

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Devrait enregistrer avec données incomplètes")
    public void testRegister_IncompleteData() throws Exception {
        // Arrange
        UserRegisterRequestDto incompleteRequest = new UserRegisterRequestDto();
        incompleteRequest.setFirstname(""); // vide
        incompleteRequest.setLastname("Doe");
        incompleteRequest.setEmail(testEmail);
        incompleteRequest.setPassword(testPassword);
        incompleteRequest.setPhone("+33612345678");
        incompleteRequest.setBirthdate(LocalDate.of(1990, 1, 1));

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(incompleteRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Devrait connecter un utilisateur existant")
    public void testLogin_Success() throws Exception {
        // Arrange - créer un utilisateur
        Users user = new Users();
        user.setEmail(testEmail);
        user.setPassword(passwordService.hash(testPassword));
        user.setFirstname("John");
        user.setLastname("Doe");
        user.setPhone("+33612345678");
        user.setBirthdate(LocalDate.of(1990, 1, 1));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setRegistrationDate(LocalDate.now());

        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        user.setRoles(roles);

        userRepository.save(user);

        // Créer la demande de connexion
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(testEmail);
        loginRequest.setPassword(testPassword);

        // Act & Assert
        MvcResult result = mockMvc.perform(post(AUTH_BASE_URI + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", equalTo(testEmail)))
                .andExpect(jsonPath("$.userId", notNullValue()))
                .andReturn();

        // Vérifier qu'un token a été généré
        String responseBody = result.getResponse().getContentAsString();
        LoginResponseDto response = objectMapper.readValue(responseBody, LoginResponseDto.class);
        assertNotNull(response.getToken(), "Un token JWT doit être généré");
    }

    @Test
    @DisplayName("Devrait rejeter la connexion avec mot de passe incorrect")
    public void testLogin_InvalidPassword() throws Exception {
        // Arrange - créer un utilisateur
        Users user = new Users();
        user.setEmail(testEmail);
        user.setPassword(passwordService.hash(testPassword));
        user.setFirstname("John");
        user.setLastname("Doe");
        user.setPhone("+33612345678");
        user.setBirthdate(LocalDate.of(1990, 1, 1));
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setRegistrationDate(LocalDate.now());

        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        user.setRoles(roles);

        userRepository.save(user);

        // Créer la demande avec mauvais mot de passe
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(testEmail);
        loginRequest.setPassword("WrongPassword123!");

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait rejeter la connexion avec utilisateur inexistant")
    public void testLogin_NonExistentUser() throws Exception {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername("nonexistent@example.com");
        loginRequest.setPassword(testPassword);

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Devrait rejeter la connexion si l'utilisateur est désactivé")
    public void testLogin_DisabledUser() throws Exception {
        // Arrange - créer un utilisateur désactivé
        Users user = new Users();
        user.setEmail(testEmail);
        user.setPassword(passwordService.hash(testPassword));
        user.setFirstname("John");
        user.setLastname("Doe");
        user.setPhone("+33612345678");
        user.setBirthdate(LocalDate.of(1990, 1, 1));
        user.setActive(false); // Désactivé
        user.setCreatedAt(LocalDateTime.now());
        user.setRegistrationDate(LocalDate.now());

        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        user.setRoles(roles);

        userRepository.save(user);

        // Créer la demande de connexion
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setUsername(testEmail);
        loginRequest.setPassword(testPassword);

        // Act & Assert
        mockMvc.perform(post(AUTH_BASE_URI + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden());
    }
}
