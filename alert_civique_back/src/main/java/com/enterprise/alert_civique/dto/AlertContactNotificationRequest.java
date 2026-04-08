package com.enterprise.alert_civique.dto;

public record AlertContactNotificationRequest(
    Long userId,
    String alertType,
    String senderName
) {}
