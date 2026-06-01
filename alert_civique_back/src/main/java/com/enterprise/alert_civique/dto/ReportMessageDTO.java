package com.enterprise.alert_civique.dto;

public record ReportMessageDTO(
    Long reportMessageId,
    Long userId,
    Long reportId,
    Long messageId,
    String reason,
    String createdAt,
    String alertType,
    String senderName
) {}
