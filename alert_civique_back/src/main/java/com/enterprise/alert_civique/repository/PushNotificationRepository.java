package com.enterprise.alert_civique.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.PushNotification;

@Repository
public interface PushNotificationRepository extends JpaRepository<PushNotification,Long>{
    
    List<PushNotification> findByUserId(Long userId);
    
    List<PushNotification> findByReportId(Long reportId);
}
