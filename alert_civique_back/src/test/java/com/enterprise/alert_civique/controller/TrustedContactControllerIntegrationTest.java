package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.TrustedcontactRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TrustedContactController Integration Tests")
public class TrustedContactControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TrustedcontactRepository trustedContactRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final String BASE_URI = "/api/trusted-contacts";
    private Users testUser;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        trustedContactRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new Users();
        testUser.setEmail("ctrl.trusted@example.com");
        testUser.setPassword("hash");
        testUser.setFirstname("Test");
        testUser.setLastname("User");
        testUser.setPhone("+33600000099");
        testUser.setBirthdate(LocalDate.of(1990, 1, 1));
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("POST /api/trusted-contacts — devrait créer un contact (201)")
    public void testCreate_Success() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Alice", "alice@test.com", "+33611111111", testUser.getUserId());

        mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Alice")))
                .andExpect(jsonPath("$.email", is("alice@test.com")))
                .andExpect(jsonPath("$.id", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/trusted-contacts — devrait retourner la liste (200)")
    public void testGetAll() throws Exception {
        TrustedContactDTO d1 = new TrustedContactDTO(null, "Bob", "bob@test.com", "+33622222222", testUser.getUserId());
        TrustedContactDTO d2 = new TrustedContactDTO(null, "Carol", "carol@test.com", "+33633333333", testUser.getUserId());
        mockMvc.perform(post(BASE_URI).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(d1)));
        mockMvc.perform(post(BASE_URI).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(d2)));

        mockMvc.perform(get(BASE_URI))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/trusted-contacts/{id} — devrait retourner un contact existant (200)")
    public void testGetById_Found() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "David", "david@test.com", "+33644444444", testUser.getUserId());
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get(BASE_URI + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("David")));
    }

    @Test
    @DisplayName("GET /api/trusted-contacts/{id} — devrait retourner 404 pour ID inexistant")
    public void testGetById_NotFound() throws Exception {
        mockMvc.perform(get(BASE_URI + "/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/trusted-contacts/user/{userId} — devrait retourner les contacts de l'utilisateur")
    public void testGetByUserId() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Eve", "eve@test.com", "+33655555555", testUser.getUserId());
        mockMvc.perform(post(BASE_URI).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)));

        mockMvc.perform(get(BASE_URI + "/user/{userId}", testUser.getUserId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("PUT /api/trusted-contacts/{id} — devrait mettre à jour un contact (200)")
    public void testUpdate_Success() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Frank", "frank@test.com", "+33666666666", testUser.getUserId());
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("id").asLong();

        TrustedContactDTO updateDTO = new TrustedContactDTO(id, "Frank Updated", "frank.new@test.com", "+33699999999", testUser.getUserId());

        mockMvc.perform(put(BASE_URI + "/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Frank Updated")))
                .andExpect(jsonPath("$.email", is("frank.new@test.com")));
    }

    @Test
    @DisplayName("PUT /api/trusted-contacts/{id} — devrait retourner 404 pour ID inexistant")
    public void testUpdate_NotFound() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Ghost", "ghost@test.com", "+33600000000", testUser.getUserId());

        mockMvc.perform(put(BASE_URI + "/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/trusted-contacts/{id} — devrait supprimer un contact (204)")
    public void testDelete_Success() throws Exception {
        TrustedContactDTO dto = new TrustedContactDTO(null, "Grace", "grace@test.com", "+33677777777", testUser.getUserId());
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(delete(BASE_URI + "/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/trusted-contacts/{id} — devrait retourner 404 pour ID inexistant")
    public void testDelete_NotFound() throws Exception {
        mockMvc.perform(delete(BASE_URI + "/9999"))
                .andExpect(status().isNotFound());
    }
}
