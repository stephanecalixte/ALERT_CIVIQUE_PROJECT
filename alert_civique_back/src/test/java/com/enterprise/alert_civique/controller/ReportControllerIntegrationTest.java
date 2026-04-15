package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.entity.Reports;
// import com.enterprise.alert_civique.entity.Report;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import com.enterprise.alert_civique.enum1.DecisionLevel;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration pour ReportController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("ReportController Integration Tests")
public class ReportControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String REPORT_BASE_URI = "/api/report";
    private Users testUser;
    private Reports testReport;
    private Roles clientRole;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        reportRepository.deleteAll();
        userRepository.deleteAll();

        // Créer rôle
        clientRole = roleRepository.findFirstByName("ROLE_CLIENT").orElse(null);
        if (clientRole == null) {
            clientRole = new Roles();
            clientRole.setName("ROLE_CLIENT");
            // clientRole.setDescription("Utilisateur Client");
            clientRole = roleRepository.save(clientRole);
        }

        // Créer utilisateur
        testUser = new Users();
        testUser.setEmail("reporter@example.com");
        testUser.setPassword("password");
        testUser.setFirstname("Reporter");
        testUser.setLastname("User");
        testUser.setPhone("+33612345678");
        testUser.setBirthdate(LocalDate.of(1990, 1, 1));
        testUser.setActive(true);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setRegistrationDate(LocalDate.now());
        Set<Roles> roles = new HashSet<>();
        roles.add(clientRole);
        testUser.setRoles(roles);
        testUser = userRepository.save(testUser);

        // Créer un signalement test
        testReport = new Reports();
        testReport.setDescription("Test incident");
        testReport.setStatus(ReportsStatus.PENDING);
        testReport.setPriority(DecisionLevel.HIGH);
        testReport.setLatitude(48.8566);
        testReport.setLatitude(2.3522);
        testReport.setLocationText("Paris, France");
        testReport.setUser(testUser);
        testReport.setCreatedAt(LocalDateTime.now());
        testReport.setAnonymous(false);
        testReport = reportRepository.save(testReport);
    }

    @Test
    @DisplayName("Devrait créer un nouveau signalement")
    public void testCreateReport_Success() throws Exception {
        // Arrange
        ReportDTO reportDTO = new ReportDTO(
                null,
                "New incident report",
                LocalDateTime.now(),
                48.8566,
                2.3522,
                "Paris, France",
                ReportsStatus.PENDING,
                DecisionLevel.MEDIUM,
                false,
                testUser.getUserId(),
                1L,
                null,
                0,
                0.8,
                "ACCIDENT",
                "Test User"
        );

        // Act & Assert
        mockMvc.perform(post(REPORT_BASE_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reportDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reportId", notNullValue()))
                .andExpect(jsonPath("$.description", equalTo("New incident report")))
                .andExpect(jsonPath("$.status", equalTo("PENDING")));
    }

    @Test
    @DisplayName("Devrait récupérer tous les signalements")
    public void testGetAllReports_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get(REPORT_BASE_URI)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].reportId", notNullValue()));
    }

    @Test
    @DisplayName("Devrait récupérer un signalement par ID")
    public void testGetReportById_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(get(REPORT_BASE_URI + "/" + testReport.getReportId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId", equalTo(testReport.getReportId().intValue())))
                .andExpect(jsonPath("$.description", equalTo("Test incident")))
                .andExpect(jsonPath("$.status", equalTo("PENDING")));
    }

    @Test
    @DisplayName("Devrait retourner 404 pour signalement inexistant")
    public void testGetReportById_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(get(REPORT_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait mettre à jour un signalement existant")
    public void testUpdateReport_Success() throws Exception {
        // Arrange
        ReportDTO updateDTO = new ReportDTO(
                testReport.getReportId(),
                "Updated incident",
                testReport.getCreatedAt(),
                48.8566,
                2.3522,
                "Paris, France",
                ReportsStatus.RESOLVED,
                DecisionLevel.LOW,
                false,
                testUser.getUserId(),
                1L,
                null,
                0,
                0.9,
                "RESOLVED",
                "Test User"
        );

        // Act & Assert
        mockMvc.perform(put(REPORT_BASE_URI + "/" + testReport.getReportId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", equalTo("Updated incident")))
                .andExpect(jsonPath("$.status", equalTo("RESOLVED")));
    }

    @Test
    @DisplayName("Devrait retourner 404 lors de mise à jour signalement inexistant")
    public void testUpdateReport_NotFound() throws Exception {
        // Arrange
        ReportDTO updateDTO = new ReportDTO(
                9999L,
                "Updated incident",
                LocalDateTime.now(),
                48.8566,
                2.3522,
                "Paris, France",
                ReportsStatus.RESOLVED,
                DecisionLevel.LOW,
                false,
                testUser.getUserId(),
                1L,
                null,
                0,
                0.9,
                "RESOLVED",
                "Test User"
        );

        // Act & Assert
        mockMvc.perform(put(REPORT_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait supprimer un signalement existant")
    public void testDeleteReport_Success() throws Exception {
        // Arrange - créer un signalement supplémentaire
        Reports reportToDelete = new Reports();
        reportToDelete.setDescription("Report to delete");
        reportToDelete.setStatus(ReportsStatus.PENDING);
        reportToDelete.setPriority(DecisionLevel.MEDIUM);
        reportToDelete.setLatitude(48.8566);
        reportToDelete.setLongitude(2.3522);
        reportToDelete.setLocationText("Paris, France");
        reportToDelete.setUser(testUser);
        reportToDelete.setCreatedAt(LocalDateTime.now());
        reportToDelete.setAnonymous(true);
        reportToDelete = reportRepository.save(reportToDelete);

        // Act & Assert
        mockMvc.perform(delete(REPORT_BASE_URI + "/" + reportToDelete.getReportId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Vérifier suppression
        mockMvc.perform(get(REPORT_BASE_URI + "/" + reportToDelete.getReportId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Devrait retourner 404 lors de suppression signalement inexistant")
    public void testDeleteReport_NotFound() throws Exception {
        // Act & Assert
        mockMvc.perform(delete(REPORT_BASE_URI + "/9999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
