package com.enterprise.alert_civique.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.PushNotification;

@Repository
public interface PushNotificationRepository extends JpaRepository<PushNotification, Long> {

    // ✅ Navigation via la relation user.userId
    List<PushNotification> findByUserUserId(Long userId);

    // ✅ Navigation via la relation report.reportId
    List<PushNotification> findByReportReportId(Long reportId);
}