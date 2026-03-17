package com.enterprise.alert_civique.dto;



import java.time.LocalDateTime;

public record HistoryDTO(
    Long historiqueId,
    String analyse,
    Long reportId,   // juste l’ID
    Long userId,     // juste l’ID
    String action,
    LocalDateTime createdAt,
    String details
) {}