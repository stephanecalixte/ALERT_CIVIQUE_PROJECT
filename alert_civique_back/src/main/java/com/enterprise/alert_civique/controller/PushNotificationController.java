package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.PushNotificationDTO;
import com.enterprise.alert_civique.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/push-notifications")
@RequiredArgsConstructor
@Slf4j
public class PushNotificationController {

    private final PushNotificationService pushNotificationService;

    @PostMapping("/send")
    public ResponseEntity<PushNotificationDTO> sendNotification(@RequestBody PushNotificationDTO dto) {
        log.info("POST /send - {}", dto);
        PushNotificationDTO response = pushNotificationService.sendPushNotification(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PushNotificationDTO>> getByUser(@PathVariable Long userId) {
        log.info("GET /user/{} ", userId);
        return ResponseEntity.ok(pushNotificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<List<PushNotificationDTO>> getByReport(@PathVariable Long reportId) {
        log.info("GET /report/{}", reportId);
        return ResponseEntity.ok(pushNotificationService.getNotificationsByReport(reportId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        log.info("DELETE /{ }", id);
        pushNotificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}

