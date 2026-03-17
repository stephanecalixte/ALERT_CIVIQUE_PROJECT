package com.enterprise.alert_civique.dto;

import com.enterprise.alert_civique.enum1.ReportsStatus;

import com.enterprise.alert_civique.enum1.DecisionLevel;
import java.time.LocalDateTime;

public record ReportDTO(
        Long reportId,
        String description,
        LocalDateTime createdAt,
        Double latitude,
        Double longitude,
        String locationText,
        ReportsStatus status,
        DecisionLevel priority,
        Boolean anonymous,
        Long userId,
        Long categoryId,
        Long geolocalisationId,
        Integer mediaCount,
        Double aiConfidenceScore
) {




}
