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

        // Conversion des String de l'entité vers les enums du DTO
        ReportsStatus status = report.getStatus() != null ? 
            report.getStatus() : null;
            
        DecisionLevel priority = report.getPriority();

        // Récupération de l'ID de géolocalisation si l'objet existe
        Long geolocalisationId = report.getGeolocalisation() != null ? 
            report.getGeolocalisation().getGeolocalisationId() : null;

        return new ReportDTO(
            report.getReportId(),
            report.getDescription(),
            report.getCreatedAt(),
            null,                    // latitude (manquant dans l'entité)
            null,                    // longitude (manquant dans l'entité)
            null,                    // locationText (manquant dans l'entité)
            status,                  // ReportsStatus status (converti)
            priority,                // DecisionLevel priority (converti)
            report.getAnonymous(),
            report.getUserId(),
            report.getCategoryId(),
            geolocalisationId,       // ID de géolocalisation
            0,                       // mediaCount (manquant - valeur par défaut)
            0.0                      // aiConfidenceScore (manquant - valeur par défaut)
        );
    }

    // Mapping DTO -> Entity
    public Reports toEntity(ReportDTO dto) {
        if (dto == null) return null;

        Reports report = new Reports();
      
        report.setReportId(dto.reportId());
        report.setDescription(dto.description());
        report.setCreatedAt(dto.createdAt());
        
        // Conversion des enums du DTO vers String pour l'entité
        report.setStatus(dto.status());
        report.setPriority(dto.priority());
        
        report.setAnonymous(dto.anonymous());
        report.setUserId(dto.userId());
        report.setCategoryId(dto.categoryId());
        
        // Note: geolocalisation est un objet, pas un ID
        // Il faudra le gérer séparément avec un repository
        
        // Les champs suivants n'existent pas dans l'entité :
        // - latitude, longitude, locationText, mediaCount, aiConfidenceScore
        
        return report;
    }
}