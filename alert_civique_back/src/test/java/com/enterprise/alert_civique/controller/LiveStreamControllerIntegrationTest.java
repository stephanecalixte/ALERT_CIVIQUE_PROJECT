package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.LiveStreamRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("LiveStreamController Integration Tests")
public class LiveStreamControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private LiveStreamRepository liveStreamRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final String BASE_URI = "/api/livestream";
    private Users testUser;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        liveStreamRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new Users();
        testUser.setEmail("ctrl.stream@example.com");
        testUser.setPassword("hash");
        testUser.setFirstname("Stream");
        testUser.setLastname("User");
        testUser.setPhone("+33600000088");
        testUser.setBirthdate(LocalDate.of(1991, 5, 10));
        testUser = userRepository.save(testUser);
    }

    @Test
    @DisplayName("POST /api/livestream/create — devrait créer un stream (201)")
    public void testCreate_Success() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null,
                "rtmp://stream.example.com/live", null, null, null);

        mockMvc.perform(post(BASE_URI + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.livestreamId", notNullValue()))
                .andExpect(jsonPath("$.status", is("LIVE")));
    }

    @Test
    @DisplayName("POST /api/livestream/create — devrait retourner 400 pour DTO null")
    public void testCreate_NullBody() throws Exception {
        mockMvc.perform(post(BASE_URI + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("null"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/livestream — devrait retourner tous les streams (200)")
    public void testGetAll() throws Exception {
        LiveStreamDTO d1 = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://s1", null, null, null);
        LiveStreamDTO d2 = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://s2", null, null, null);
        mockMvc.perform(post(BASE_URI + "/create").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(d1)));
        mockMvc.perform(post(BASE_URI + "/create").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(d2)));

        mockMvc.perform(get(BASE_URI))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/livestream/{id} — devrait retourner un stream existant (200)")
    public void testGetById_Found() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://getById", null, null, null);
        String response = mockMvc.perform(post(BASE_URI + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("livestreamId").asLong();

        mockMvc.perform(get(BASE_URI + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.livestreamId", is(id.intValue())));
    }

    @Test
    @DisplayName("GET /api/livestream/{id} — devrait retourner 404 pour ID inexistant")
    public void testGetById_NotFound() throws Exception {
        mockMvc.perform(get(BASE_URI + "/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/livestream/update — devrait mettre à jour un stream (200)")
    public void testUpdate_Success() throws Exception {
        LiveStreamDTO createDTO = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://original", null, null, null);
        String response = mockMvc.perform(post(BASE_URI + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("livestreamId").asLong();

        LiveStreamDTO updateDTO = new LiveStreamDTO(id, testUser.getUserId(),
                null, LocalDateTime.now(),
                "rtmp://updated", "ENDED",
                "http://video.example.com/v.mp4", 180);

        mockMvc.perform(put(BASE_URI + "/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ENDED")))
                .andExpect(jsonPath("$.duration", is(180)));
    }

    @Test
    @DisplayName("PUT /api/livestream/update — devrait retourner 400 si ID manquant")
    public void testUpdate_MissingId() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://x", null, null, null);

        mockMvc.perform(put(BASE_URI + "/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/livestream/{id} — devrait supprimer un stream et le retourner (200)")
    public void testDelete_Success() throws Exception {
        LiveStreamDTO dto = new LiveStreamDTO(null, testUser.getUserId(), null, null, "rtmp://del", null, null, null);
        String response = mockMvc.perform(post(BASE_URI + "/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("livestreamId").asLong();

        mockMvc.perform(delete(BASE_URI + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.livestreamId", is(id.intValue())));
    }

    @Test
    @DisplayName("DELETE /api/livestream/{id} — devrait retourner 400 pour ID inexistant")
    public void testDelete_NotFound() throws Exception {
        mockMvc.perform(delete(BASE_URI + "/9999"))
                .andExpect(status().isBadRequest());
    }
}
