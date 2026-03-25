package com.enterprise.alert_civique.mapper;

import org.springframework.stereotype.Service;
import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import com.enterprise.alert_civique.enum1.DecisionLevel;

@Service
public class ReportMapperService {

    // Mapping Entity -> DTO
    public ReportDTO toDTO(Reports report) {
        if (report == null) return null;

        ReportsStatus status = report.getStatus() != null ?
            report.getStatus() : null;

        DecisionLevel priority = report.getPriority();

        Long geolocalisationId = report.getGeolocalisation() != null ?
            report.getGeolocalisation().getGeolocalisationId() : null;

        // ✅ Récupération de l'userId via la relation Users
        Long userId = report.getUser() != null ?
            report.getUser().getUserId() : null;

        return new ReportDTO(
            report.getReportId(),
            report.getDescription(),
            report.getCreatedAt(),
            null,           // latitude
            null,           // longitude
            null,           // locationText
            status,
            priority,
            report.getAnonymous(),
            userId,         // ✅ report.getUser().getUserId() au lieu de report.getUserId()
            null,           // categoryId
            geolocalisationId,
            0,              // mediaCount
            0.0             // aiConfidenceScore
        );
    }

    // Mapping DTO -> Entity
    public Reports toEntity(ReportDTO dto) {
        if (dto == null) return null;

        Reports report = new Reports();

        report.setReportId(dto.reportId());
        report.setDescription(dto.description());
        report.setCreatedAt(dto.createdAt());
        report.setStatus(dto.status());
        report.setPriority(dto.priority());
        report.setAnonymous(dto.anonymous());

        // ✅ userId retiré ici — l'association Users est gérée dans ReportServiceImpl
        // via userRepository.findById() + report.setUser(user)

        return report;
    }
}