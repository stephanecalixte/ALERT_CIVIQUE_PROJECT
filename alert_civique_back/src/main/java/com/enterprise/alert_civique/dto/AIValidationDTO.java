package com.enterprise.alert_civique.dto;


import java.time.LocalDateTime;
import java.util.List;



public record AIValidationDTO(
        Long aiValidationId,
        Long reportId,        
        Double score,
        String decisionLevel,
        LocalDateTime createdAt,
        String modelVersion,
        String analysisResult,
        List<Long> analysesIds   
) {}
