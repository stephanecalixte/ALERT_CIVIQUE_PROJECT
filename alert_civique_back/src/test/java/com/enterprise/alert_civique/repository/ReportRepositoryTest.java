package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour ReportRepository
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("ReportRepository Unit Tests")
public class ReportRepositoryTest {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Users testUser;
    private Reports testReport;

    @BeforeEach
    public void setUp() {
        // Nettoyer
        reportRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        // Créer un rôle
        Roles role = new Roles();
        role.setName("ROLE_CLIENT");
        role = roleRepository.save(role);

        // Créer un utilisateur test
        testUser = new Users();
        testUser.setEmail("reporter@example.com");
        testUser.setPassword("HashedPassword123!");
        testUser.setFirstname("Jane");
        testUser.setLastname("Smith");
        testUser.setPhone("0987654321");
        testUser.setActive(true);
        testUser = userRepository.save(testUser);

        // Créer un signalement test
        testReport = new Reports();
        testReport.setUser(testUser);
        testReport.setAlertType("ACCIDENT");
        testReport.setDescription("Un accident grave à l'intersection");
        testReport.setStatus(ReportsStatus.PENDING);
        testReport.setCreatedAt(LocalDateTime.now());
        testReport = reportRepository.save(testReport);
    }

    @Test
    @DisplayName("Devrait sauvegarder un signalement")
    public void testSaveReport_Success() {
        // Arrange
        Reports newReport = new Reports();
        newReport.setUser(testUser);
        newReport.setAlertType("TRAFFIC");
        newReport.setDescription("Embouteillage majeur sur l'autoroute");
        newReport.setStatus(ReportsStatus.PENDING);
        newReport.setCreatedAt(LocalDateTime.now());

        // Act
        Reports saved = reportRepository.save(newReport);

        // Assert
        assertNotNull(saved.getReportId(), "L'ID signalement doit être généré");
        assertEquals("TRAFFIC", saved.getAlertType());
        assertEquals(ReportsStatus.PENDING, saved.getStatus());
    }

    @Test
    @DisplayName("Devrait trouver un signalement par ID")
    public void testFindById_Success() {
        // Act
        Optional<Reports> found = reportRepository.findById(testReport.getReportId());

        // Assert
        assertTrue(found.isPresent(), "Le signalement doit être trouvé");
        assertEquals(testReport.getAlertType(), found.get().getAlertType());
        assertEquals(testUser.getEmail(), found.get().getUser().getEmail());
    }

    @Test
    @DisplayName("Devrait retourner vide pour ID inexistant")
    public void testFindById_NotFound() {
        // Act
        Optional<Reports> found = reportRepository.findById(9999L);

        // Assert
        assertFalse(found.isPresent(), "Aucun signalement ne doit être trouvé");
    }

    @Test
    @DisplayName("Devrait trouver les signalements par utilisateur")
    public void testFindByUser_Success() {
        // Act
        List<Reports> reports = reportRepository.findByUserUserId(testUser.getUserId());

        // Assert
        assertNotNull(reports);
        assertTrue(reports.size() >= 1, "Au moins un signalement doit exister");
        assertTrue(reports.stream().anyMatch(r -> r.getReportId().equals(testReport.getReportId())));
    }

    @Test
    @DisplayName("Devrait trouver les signalements par statut")
    public void testFindByStatus_Success() {
        // Act
        List<Reports> reports = reportRepository.findByStatus(ReportsStatus.PENDING);

        // Assert
        assertNotNull(reports);
        assertTrue(reports.size() >= 1, "Au moins un signalement PENDING doit exister");
    }

    @Test
    @DisplayName("Devrait mettre à jour le statut d'un signalement")
    public void testUpdateStatus_Success() {
        // Arrange
        testReport.setStatus(ReportsStatus.IN_REVIEW);

        // Act
        Reports updated = reportRepository.save(testReport);

        // Assert
        assertEquals(ReportsStatus.IN_REVIEW, updated.getStatus());
    }

    @Test
    @DisplayName("Devrait mettre à jour la description d'un signalement")
    public void testUpdateDescription_Success() {
        // Arrange
        String newDescription = "Accident résolu, pas de blessés";
        testReport.setDescription(newDescription);

        // Act
        Reports updated = reportRepository.save(testReport);

        // Assert
        assertEquals(newDescription, updated.getDescription());
    }

    @Test
    @DisplayName("Devrait supprimer un signalement")
    public void testDelete_Success() {
        // Arrange
        Long reportId = testReport.getReportId();

        // Act
        reportRepository.deleteById(reportId);

        // Assert
        assertFalse(reportRepository.findById(reportId).isPresent(),
                "Le signalement doit être supprimé");
    }

    @Test
    @DisplayName("Devrait récupérer tous les signalements")
    public void testFindAll_Success() {
        // Act
        List<Reports> reports = reportRepository.findAll();

        // Assert
        assertNotNull(reports);
        assertTrue(reports.size() >= 1, "Au moins un signalement doit exister");
    }

    @Test
    @DisplayName("Devrait compter les signalements")
    public void testCount_Success() {
        // Act
        long count = reportRepository.count();

        // Assert
        assertTrue(count >= 1, "Au moins un signalement doit exister");
    }

    @Test
    @DisplayName("Devrait gérer plusieurs signalements pour le même utilisateur")
    public void testMultipleReportsPerUser_Success() {
        // Arrange - créer plusieurs signalements pour le même utilisateur
        String[] alertTypes = {"TRAFFIC", "POLLUTION", "CRIME"};
        for (String alertType : alertTypes) {
            Reports report = new Reports();
            report.setUser(testUser);
            report.setAlertType(alertType);
            report.setDescription("Report for " + alertType);
            report.setStatus(ReportsStatus.PENDING);
            report.setCreatedAt(LocalDateTime.now());
            reportRepository.save(report);
        }

        // Act
        List<Reports> userReports = reportRepository.findByUserUserId(testUser.getUserId());

        // Assert
        assertTrue(userReports.size() >= 4, "Au moins 4 signalements doivent exister");
    }

    @Test
    @DisplayName("Devrait gérer les différents statuts de signalement")
    public void testDifferentStatuses_Success() {
        // Act & Assert
        for (ReportsStatus status : ReportsStatus.values()) {
            Reports report = new Reports();
            report.setUser(testUser);
            report.setAlertType("TEST");
            report.setDescription("Test status " + status);
            report.setStatus(status);
            report.setCreatedAt(LocalDateTime.now());

            Reports saved = reportRepository.save(report);
            assertEquals(status, saved.getStatus());

            // Vérifier qu'on peut retrouver par statut
            List<Reports> found = reportRepository.findByStatus(status);
            assertTrue(found.stream().anyMatch(r -> r.getReportId().equals(saved.getReportId())));
        }
    }

    @Test
    @DisplayName("Devrait trouver les signalements par utilisateur et statut combinés")
    public void testFindByUserIdAndStatus_Success() {
        // Act
        List<Reports> reports = reportRepository.findByUserIdAndStatus(
                testUser.getUserId(), ReportsStatus.PENDING);

        // Assert
        assertNotNull(reports);
        assertTrue(reports.size() >= 1, "Au moins un signalement PENDING pour cet utilisateur doit exister");
        assertTrue(reports.stream().allMatch(r ->
                r.getUser().getUserId().equals(testUser.getUserId()) &&
                r.getStatus() == ReportsStatus.PENDING));
    }
}
