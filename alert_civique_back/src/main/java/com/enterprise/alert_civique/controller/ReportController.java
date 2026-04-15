package com.enterprise.alert_civique.controller;

import java.util.List;

import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.service.ReportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@CrossOrigin
@Slf4j
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<?> postReport(@RequestBody ReportDTO dto) {
        try {
            log.info("Creating new report - CategoryId: {}, Status: {}", dto.categoryId(), dto.status());
            ReportDTO created = reportService.createReport(dto);
            log.info("Report created successfully - ID: {}, CategoryId: {}", created.reportId(), created.categoryId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("Report creation failed - Invalid argument: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        try {
            log.info("Retrieving all reports");
            List<ReportDTO> reports = reportService.getAllReports();
            log.info("Successfully retrieved {} reports", reports.size());
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error retrieving all reports", e);
            throw e;
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getReportById(@PathVariable Long id) {
        try {
            log.info("Retrieving report with ID: {}", id);
            ReportDTO report = reportService.getReportById(id);
            log.info("Successfully retrieved report - ID: {}, CategoryId: {}", id, report.categoryId());
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            log.warn("Report not found - ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error retrieving report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(@PathVariable Long id, @RequestBody ReportDTO dto) {
        try {
            log.info("Updating report with ID: {}", id);
            ReportDTO updated = reportService.updateReport(id, dto);
            log.info("Report updated successfully - ID: {}, CategoryId: {}", id, updated.categoryId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.warn("Report update failed - Invalid argument for ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.warn("Report not found for update - ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error updating report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        try {
            log.info("Attempting to delete report with ID: {}", id);
            reportService.deleteReport(id);
            log.warn("Report deleted - ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("Report deletion failed - ID: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deleting report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }
}