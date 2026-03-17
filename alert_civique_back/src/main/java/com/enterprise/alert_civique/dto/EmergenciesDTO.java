package com.enterprise.alert_civique.dto;

import com.enterprise.alert_civique.entity.Messages;

import java.time.LocalDateTime;

import java.util.List;

public record EmergenciesDTO(
    Long emergencyAlertId,
    String email,
    LocalDateTime sentAt,
    List<Messages> messages
) {}
