package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.AlertContactNotificationRequest;
import com.enterprise.alert_civique.dto.AlertContactNotificationResult;

import java.util.List;

public interface ContactAlertService {
    List<AlertContactNotificationResult> notifyContacts(AlertContactNotificationRequest request);
}
