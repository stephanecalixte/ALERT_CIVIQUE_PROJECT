package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.AnalysisDTO;
import com.enterprise.alert_civique.entity.Analysis;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.AiValidation;
import org.springframework.stereotype.Service;

@Service
public class AnalysisMapperService {

    // ================= ENTITY → DTO =================
    public AnalysisDTO toDTO(Analysis entity){
        if (entity == null){
            return null;
        }
        return new AnalysisDTO(
                entity.getAnalysisId(),
                entity.getAnalyse(),
                entity.getReport() != null ? entity.getReport().getReportId() : null,
                entity.getAiValidation() != null ? entity.getAiValidation().getAiValidationId() : null,
                entity.getCreatedAt(),
                entity.getAnalysisType(),
                entity.getConfidenceScore(),
                entity.getDetails()
        );
    }

    // ================= DTO → ENTITY =================
    public Analysis toEntity(AnalysisDTO dto){
        if (dto == null){
            return null;
        }

        Analysis entity = new Analysis();
        entity.setAnalysisId(dto.analysisId());
        entity.setAnalyse(dto.analyse());
        entity.setCreatedAt(dto.createdAt());
        entity.setAnalysisType(dto.analysisType());
        entity.setConfidenceScore(dto.confidenceScore());
        entity.setDetails(dto.details());

        // 🔹 Associer les entités via leurs IDs
        if(dto.reportId() != null){
            Reports report = new Reports();
            report.setReportId(dto.reportId());
            entity.setReport(report);
        }

        if(dto.aiValidationId() != null){
            AiValidation aiValidation = new AiValidation();
            aiValidation.setAiValidationId(dto.aiValidationId());
            entity.setAiValidation(aiValidation);
        }

        return entity;
    }
}