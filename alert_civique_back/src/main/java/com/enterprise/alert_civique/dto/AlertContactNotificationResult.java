package com.enterprise.alert_civique.dto;

public record AlertContactNotificationResult(
    String contactName,
    String email,
    String phone,
    boolean emailSent,
    boolean smsSent
) {}
