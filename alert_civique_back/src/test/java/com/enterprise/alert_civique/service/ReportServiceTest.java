package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.enum1.DecisionLevel;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("ReportService Unit Tests")
public class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    private Users testUser;

    @BeforeEach
    public void setUp() {
        reportRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new Users();
        testUser.setEmail("reporter@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setFirstname("Paul");
        testUser.setLastname("Martin");
        testUser.setPhone("+33605060708");
        testUser.setBirthdate(LocalDate.of(1988, 11, 5));
        testUser = userRepository.save(testUser);
    }

    private ReportDTO buildDTO(Long userId) {
        return new ReportDTO(
                null,
                "Incendie dans le quartier",
                LocalDateTime.now(),
                48.8566,
                2.3522,
                "Paris, France",
                ReportsStatus.PENDING,
                DecisionLevel.LOW,
                false,
                userId,
                null,
                null,
                0,
                0.9,
                "FIRE",
                "Paul Martin"
        );
    }

    @Test
    @DisplayName("Devrait créer un signalement avec succès")
    public void testCreateReport_Success() {
        ReportDTO dto = buildDTO(testUser.getUserId());

        ReportDTO result = reportService.createReport(dto);

        assertNotNull(result);
        assertNotNull(result.reportId());
        assertEquals("Incendie dans le quartier", result.description());
        assertEquals(ReportsStatus.PENDING, result.status());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un DTO null")
    public void testCreateReport_NullDTO() {
        assertThrows(IllegalArgumentException.class,
                () -> reportService.createReport(null),
                "Devrait lever IllegalArgumentException pour DTO null");
    }

    @Test
    @DisplayName("Devrait créer un signalement anonyme sans userId")
    public void testCreateReport_Anonymous() {
        ReportDTO dto = new ReportDTO(
                null, null, LocalDateTime.now(),
                48.8566, 2.3522, "Paris, France",
                null, null, true,
                null, null, null,
                0, 0.7, "FLOOD", null
        );

        ReportDTO result = reportService.createReport(dto);

        assertNotNull(result);
        assertNotNull(result.reportId());
        assertTrue(result.anonymous());
        assertEquals(ReportsStatus.PENDING, result.status());
    }

    @Test
    @DisplayName("Devrait générer une description depuis alertType si description absente")
    public void testCreateReport_AutoDescription() {
        ReportDTO dto = new ReportDTO(
                null, "", LocalDateTime.now(),
                48.8566, 2.3522, "Paris",
                null, null, false,
                testUser.getUserId(), null, null,
                0, 0.8, "ACCIDENT", "Paul"
        );

        ReportDTO result = reportService.createReport(dto);

        assertNotNull(result.description());
        assertTrue(result.description().contains("ACCIDENT"),
                "La description auto-générée doit contenir le type d'alerte");
    }

    @Test
    @DisplayName("Devrait retourner tous les signalements")
    public void testGetAllReports() {
        reportService.createReport(buildDTO(testUser.getUserId()));
        reportService.createReport(buildDTO(testUser.getUserId()));

        List<ReportDTO> reports = reportService.getAllReports();

        assertEquals(2, reports.size());
    }

    @Test
    @DisplayName("Devrait récupérer un signalement par son ID")
    public void testGetReportById_Found() {
        ReportDTO saved = reportService.createReport(buildDTO(testUser.getUserId()));

        ReportDTO found = reportService.getReportById(saved.reportId());

        assertNotNull(found);
        assertEquals(saved.reportId(), found.reportId());
        assertEquals("Incendie dans le quartier", found.description());
    }

    @Test
    @DisplayName("Devrait lever une exception pour un ID inexistant")
    public void testGetReportById_NotFound() {
        assertThrows(Exception.class,
                () -> reportService.getReportById(9999L),
                "Devrait lever une exception pour ID inexistant");
    }

    @Test
    @DisplayName("Devrait lever une exception pour un ID null")
    public void testGetReportById_NullId() {
        assertThrows(IllegalArgumentException.class,
                () -> reportService.getReportById(null));
    }

    @Test
    @DisplayName("Devrait mettre à jour le statut d'un signalement")
    public void testUpdateReport_StatusChange() {
        ReportDTO saved = reportService.createReport(buildDTO(testUser.getUserId()));

        ReportDTO updateDTO = new ReportDTO(
                saved.reportId(), null, null,
                null, null, null,
                ReportsStatus.RESOLVED, null, null,
                null, null, null,
                null, null, null, null
        );
        ReportDTO updated = reportService.updateReport(saved.reportId(), updateDTO);

        assertEquals(ReportsStatus.RESOLVED, updated.status());
    }

    @Test
    @DisplayName("Devrait mettre à jour la description d'un signalement")
    public void testUpdateReport_DescriptionChange() {
        ReportDTO saved = reportService.createReport(buildDTO(testUser.getUserId()));

        ReportDTO updateDTO = new ReportDTO(
                saved.reportId(), "Description mise à jour", null,
                null, null, null,
                null, null, null,
                null, null, null,
                null, null, null, null
        );
        ReportDTO updated = reportService.updateReport(saved.reportId(), updateDTO);

        assertEquals("Description mise à jour", updated.description());
    }

    @Test
    @DisplayName("Devrait lever une exception à la mise à jour avec ID null")
    public void testUpdateReport_NullId() {
        assertThrows(IllegalArgumentException.class,
                () -> reportService.updateReport(null, buildDTO(testUser.getUserId())));
    }

    @Test
    @DisplayName("Devrait lever une exception à la mise à jour si le report n'existe pas")
    public void testUpdateReport_NotFound() {
        assertThrows(Exception.class,
                () -> reportService.updateReport(9999L, buildDTO(testUser.getUserId())));
    }

    @Test
    @DisplayName("Devrait supprimer un signalement et retourner le DTO")
    public void testDeleteReport_Success() {
        ReportDTO saved = reportService.createReport(buildDTO(testUser.getUserId()));
        Long id = saved.reportId();

        ReportDTO deleted = reportService.deleteReport(id);

        assertNotNull(deleted);
        assertEquals(id, deleted.reportId());
        assertFalse(reportRepository.existsById(id));
    }

    @Test
    @DisplayName("Devrait lever une exception à la suppression pour ID null")
    public void testDeleteReport_NullId() {
        assertThrows(IllegalArgumentException.class,
                () -> reportService.deleteReport(null));
    }

    @Test
    @DisplayName("Devrait lever une exception à la suppression pour ID inexistant")
    public void testDeleteReport_NotFound() {
        assertThrows(Exception.class,
                () -> reportService.deleteReport(9999L));
    }
}
