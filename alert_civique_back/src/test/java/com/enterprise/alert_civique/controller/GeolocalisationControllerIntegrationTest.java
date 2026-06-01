package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.GeolocalisationDTO;
import com.enterprise.alert_civique.repository.GeolocalisationRepository;
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
@DisplayName("GeolocalisationController Integration Tests")
public class GeolocalisationControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private GeolocalisationRepository geolocalisationRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final String BASE_URI = "/api/geolocations";

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        geolocalisationRepository.deleteAll();
    }

    private GeolocalisationDTO buildDTO() {
        return new GeolocalisationDTO(null, 48.8566, 2.3522, LocalDate.now(), null);
    }

    @Test
    @DisplayName("POST /api/geolocations — devrait créer une géolocalisation (200)")
    public void testCreate_Success() throws Exception {
        GeolocalisationDTO dto = buildDTO();

        mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.geolocalisationId", notNullValue()))
                .andExpect(jsonPath("$.latitude", is(48.8566)))
                .andExpect(jsonPath("$.longitude", is(2.3522)));
    }

    @Test
    @DisplayName("GET /api/geolocations — devrait retourner la liste (200)")
    public void testGetAll() throws Exception {
        mockMvc.perform(post(BASE_URI).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GeolocalisationDTO(null, 48.8566, 2.3522, LocalDate.now(), null))));
        mockMvc.perform(post(BASE_URI).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new GeolocalisationDTO(null, 43.2965, 5.3698, LocalDate.now(), null))));

        mockMvc.perform(get(BASE_URI))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/geolocations — devrait retourner une liste vide si aucune géolocalisation")
    public void testGetAll_Empty() throws Exception {
        mockMvc.perform(get(BASE_URI))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/geolocations/{id} — devrait retourner une géolocalisation existante (200)")
    public void testGetById_Found() throws Exception {
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildDTO())))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("geolocalisationId").asLong();

        mockMvc.perform(get(BASE_URI + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.geolocalisationId", is(id.intValue())))
                .andExpect(jsonPath("$.latitude", is(48.8566)));
    }

    @Test
    @DisplayName("PUT /api/geolocations/{id} — devrait mettre à jour les coordonnées (200)")
    public void testUpdate_Success() throws Exception {
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildDTO())))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("geolocalisationId").asLong();

        GeolocalisationDTO updateDTO = new GeolocalisationDTO(id, 45.7640, 4.8357, LocalDate.now(), null);

        mockMvc.perform(put(BASE_URI + "/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.latitude", is(45.7640)))
                .andExpect(jsonPath("$.longitude", is(4.8357)));
    }

    @Test
    @DisplayName("DELETE /api/geolocations/{id} — devrait supprimer une géolocalisation et la retourner (200)")
    public void testDelete_Success() throws Exception {
        String response = mockMvc.perform(post(BASE_URI)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildDTO())))
                .andReturn().getResponse().getContentAsString();
        Long id = objectMapper.readTree(response).get("geolocalisationId").asLong();

        mockMvc.perform(delete(BASE_URI + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.geolocalisationId", is(id.intValue())));

        mockMvc.perform(get(BASE_URI))
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
