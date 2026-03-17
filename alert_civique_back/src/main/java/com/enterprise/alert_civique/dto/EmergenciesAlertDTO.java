package com.enterprise.alert_civique.dto;

import com.enterprise.alert_civique.entity.Messages;

import java.time.LocalDateTime;
import java.util.List;

public record EmergenciesAlertDTO(
    Long emergencyAlertId,
    String email,
    LocalDateTime sentAt,
    List<Messages> messages

) {



}
