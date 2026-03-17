package com.enterprise.alert_civique.mapper;



import com.enterprise.alert_civique.dto.AIValidationDTO;
import com.enterprise.alert_civique.entity.AiValidation;
import com.enterprise.alert_civique.entity.Reports;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiValidationMapperService {

    // ================= ENTITY → DTO =================
    public AIValidationDTO toDTO(AiValidation entity){
        if (entity == null){
            return null;
        }

        // transformer les objets liés en IDs
        List<Long> analysesIds = null;
        if (entity.getAnalyses() != null){
            analysesIds = entity.getAnalyses().stream()
                                .map(a -> a.getAnalysisId()) // adapter selon ton entity Analysis
                                .collect(Collectors.toList());
        }

        return new AIValidationDTO(
                entity.getAiValidationId(),
                entity.getReport() != null ? entity.getReport().getReportId() : null,
                entity.getScore(),
                entity.getDecisionLevel(),
                entity.getCreatedAt(),
                entity.getModelVersion(),
                entity.getAnalysisResult(),
                analysesIds
        );
    }

    // ================= DTO → ENTITY =================
    public AiValidation toEntity(AIValidationDTO dto){
        if (dto == null){
            return null;
        }

        AiValidation entity = new AiValidation();

        entity.setAiValidationId(dto.aiValidationId());
        entity.setScore(dto.score());
        entity.setDecisionLevel(dto.decisionLevel());
        entity.setCreatedAt(dto.createdAt());
        entity.setModelVersion(dto.modelVersion());
        entity.setAnalysisResult(dto.analysisResult());

        // 🔹 Report : ici on ne met que l’ID, la récupération réelle se fait dans le service
        if (dto.reportId() != null){
            Reports report = new Reports();
            report.setReportId(dto.reportId());
            entity.setReport(report);
        }

        // 🔹 Analyses : même principe, à gérer dans le service si nécessaire
        // entity.setAnalyses(...);

        return entity;
    }
}