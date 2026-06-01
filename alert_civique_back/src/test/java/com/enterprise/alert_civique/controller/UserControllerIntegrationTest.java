package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour UserController
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("UserController Integration Tests")
public class UserControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final String USERS_BASE_URI = "/api/users";
    private Roles clientRole;
    private Users testUser;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        // Nettoyer la base
        userRepository.deleteAll();

        // Créer le rôle CLIENT
        clientRole = roleRepository.findFirstByName("ROLE_CLIENT").orElse(null);
        if (clientRole == null) {
            clientRole = new Roles();
            clientRole.setName("ROLE_CLIENT");
            // clientRole.setDescription("Utilisateur Client");
            clientRole = roleRepository.save(clientRole);
        }

        // Créer un utilisateur test
        testUser = new Users();
        testUser.setEmail("testuser@example.com");
        testUser.setPassword("hashedPassword123");
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
    @DisplayName("Devrait récupérer tous les utilisateurs")
    public void testGetAllUsers_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get(USERS_BASE_URI)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].email", notNullValue()));
    }

    @Test
    @DisplayName("Devrait récupérer un utilisateur par ID")
    public void testGetUserById_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get(USERS_BASE_URI + "/" + testUser.getUserId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", equalTo(testUser.getUserId().intValue())))
                .andExpect(jsonPath("$.email", equalTo(testUser.getEmail())))
                .andExpect(jsonPath("$.firstname", equalTo(testUser.getFirstname())));
    }

    @Test
    @DisplayName("Devrait retourner 404 pour utilisateur inexistant")
    public void testGetUserById_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get(USERS_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait créer un nouvel utilisateur")
    public void testCreateUser_Success() throws Exception {
        // Arrange
        UserCreateDTO createDTO = new UserCreateDTO(
                "Jane Smith",
                clientRole.getRoleId(),
                "jane.smith@example.com",
                "Password123!",
                LocalDate.of(1995, 5, 5)
        );

        // Act & Assert
        mockMvc.perform(post(USERS_BASE_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.email", equalTo("jane.smith@example.com")));
    }

    @Test
    @DisplayName("Devrait mettre à jour un utilisateur existant")
    public void testUpdateUser_Success() throws Exception {
        // Arrange
        UserCreateDTO updateDTO = new UserCreateDTO(
                "John Updated",
                clientRole.getRoleId(),
                testUser.getEmail(),
                "Password123!",
                LocalDate.of(1990, 1, 1)
        );

        // Act & Assert
        mockMvc.perform(put(USERS_BASE_URI + "/" + testUser.getUserId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", equalTo(testUser.getEmail())));
    }

    @Test
    @DisplayName("Devrait retourner 404 lors de mise à jour utilisateur inexistant")
    public void testUpdateUser_NotFound() throws Exception {
        // Arrange
        UserCreateDTO updateDTO = new UserCreateDTO(
                "John Updated",
                clientRole.getRoleId(),
                "test@example.com",
                "Password123!",
                LocalDate.of(1990, 1, 1)
        );

        // Act & Assert
        mockMvc.perform(put(USERS_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait supprimer un utilisateur existant")
    public void testDeleteUser_Success() throws Exception {
        // Arrange - créer un utilisateur supplémentaire
        Users userToDelete = new Users();
        userToDelete.setEmail("delete.me@example.com");
        userToDelete.setPassword("password");
        userToDelete.setFirstname("Delete");
        userToDelete.setLastname("Me");
        userToDelete.setPhone("+33699999999");
        userToDelete.setBirthdate(LocalDate.of(1980, 1, 1));
        userToDelete.setActive(true);
        userToDelete.setCreatedAt(LocalDateTime.now());
        userToDelete.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        userToDelete.setRoles(roles);
        userToDelete = userRepository.save(userToDelete);

        // Act & Assert
        mockMvc.perform(delete(USERS_BASE_URI + "/" + userToDelete.getUserId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Vérifier que l'utilisateur a été supprimé
        mockMvc.perform(get(USERS_BASE_URI + "/" + userToDelete.getUserId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait retourner 404 lors de suppression d'utilisateur inexistant")
    public void testDeleteUser_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete(USERS_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait créer avec rôle inexistant")
    public void testCreateUser_InvalidRole() throws Exception {
        // Arrange
        UserCreateDTO createDTO = new UserCreateDTO(
                "Test User",
                9999L, // Rôle inexistant
                "test.user@example.com",
                "Password123!",
                LocalDate.of(1990, 1, 1)
        );

        // Act & Assert
        mockMvc.perform(post(USERS_BASE_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());
    }
}
