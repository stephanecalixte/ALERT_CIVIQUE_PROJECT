package com.enterprise.alert_civique.dto;

import java.time.LocalDateTime;


public record MessageDTO(
        Long messageId,
        Long reportId,
        Long emergenciesAlertId,
        String message,
        LocalDateTime createdAt,
        String senderEmail,
        Boolean isRead
) {}