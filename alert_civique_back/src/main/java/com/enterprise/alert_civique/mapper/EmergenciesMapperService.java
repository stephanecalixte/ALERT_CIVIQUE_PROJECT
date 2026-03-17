package com.enterprise.alert_civique.mapper;

import org.springframework.stereotype.Service;
import com.enterprise.alert_civique.dto.EmergenciesAlertDTO;
import com.enterprise.alert_civique.entity.EmergenciesAlert;

@Service
public class EmergenciesMapperService {

    public EmergenciesAlertDTO toDTO(EmergenciesAlert entity) {
        if (entity == null) {
            return null;
        }
        
        return new EmergenciesAlertDTO(
            entity.getEmergenciesAlertId(),
            entity.getEmail(),
            entity.getSentAt(),
            entity.getMessages()
        );
    }
    public EmergenciesAlert toEntity(EmergenciesAlertDTO dto) {
        if (dto == null) {
            return null;
        }
        
        EmergenciesAlert alert = new EmergenciesAlert();
        
        alert.setEmergenciesAlertId(dto.emergencyAlertId());
        alert.setEmail(dto.email());
        alert.setSentAt(dto.sentAt());
        alert.setMessages(dto.messages());
        
        return alert;
    }
}