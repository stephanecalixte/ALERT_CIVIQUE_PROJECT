package com.enterprise.alert_civique.mapper;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.PushNotificationDTO;
import com.enterprise.alert_civique.entity.PushNotification;

@Service
public class PushNotificationMapperService {

    public PushNotificationDTO toDTO(PushNotification entity) {
        if (entity == null) return null;

        return new PushNotificationDTO(
            entity.getPushNotificationId(),
            // ✅ Navigation via la relation au lieu de getUserId()
            entity.getUser() != null ? entity.getUser().getUserId() : null,
            // ✅ Navigation via la relation au lieu de getReportId()
            entity.getReport() != null ? entity.getReport().getReportId() : null,
            entity.getMessage(),
            entity.getSentAt()
        );
    }

    public PushNotification toEntity(PushNotificationDTO dto) {
        PushNotification entity = new PushNotification();
        // ✅ userId et reportId supprimés — les relations Users et Reports
        // doivent être assignées dans le Service via leurs repositories
        // ex: entity.setUser(userRepository.findById(dto.userId())...)
        //     entity.setReport(reportRepository.findById(dto.reportId())...)
        entity.setSentAt(dto.sent_at());
        entity.setMessage(dto.message());
        return entity;
    }
}