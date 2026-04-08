package com.enterprise.alert_civique.dto;

import java.time.LocalDate;



public record ReportMessageDTO(
    Long reportMessageId,
    Long userId,
    Long reportId,
    Long messageId,
    String reason,
    LocalDate createdAt,
    String alertType,
    String senderName
) {}
