package com.enterprise.alert_civique.dto;

import java.time.LocalDateTime;

public record PushNotificationDTO(
    Long pushNotificationId,
    Long userId,
    Long reportId,
    String message,
    LocalDateTime sent_at

) {
}
