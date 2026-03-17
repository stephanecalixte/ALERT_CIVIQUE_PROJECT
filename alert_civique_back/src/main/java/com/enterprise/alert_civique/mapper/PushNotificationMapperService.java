package com.enterprise.alert_civique.mapper;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.PushNotificationDTO;
import com.enterprise.alert_civique.entity.PushNotification;


@Service
public class PushNotificationMapperService {

    public PushNotificationDTO toDTO(PushNotification entity){
             if (entity == null){
            return null;
        }
            return new PushNotificationDTO(
                entity.getPushNotificationId(),
                entity.getUserId(),
                entity.getReportId(),
                entity.getMessage(),
                entity.getSentAt()
            );
    }
    public PushNotification toEntity(PushNotificationDTO dto){
            PushNotification entity= new PushNotification();
            entity.setReportId(dto.reportId());
            entity.setUserId(dto.userId());
            entity.setSentAt(dto.sent_at());
            entity.setMessage(dto.message());
            return entity;
    }

}
