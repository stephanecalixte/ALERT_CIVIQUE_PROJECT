package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.PushNotificationDTO;

import java.util.List;

public interface PushNotificationService {
    
    PushNotificationDTO sendPushNotification(PushNotificationDTO dto);
    
    List<PushNotificationDTO> getNotificationsByUser(Long userId);
    
    List<PushNotificationDTO> getNotificationsByReport(Long reportId);
    
    void deleteNotification(Long id);
}

