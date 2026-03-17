package com.enterprise.alert_civique.dto;


import java.time.LocalDateTime;

public record AnalysisDTO(
        Long analysisId,
        String analyse,
        Long reportId,        // juste l'ID
        Long aiValidationId,  // juste l'ID
        LocalDateTime createdAt,
        String analysisType,
        Double confidenceScore,
        String details
) {}
