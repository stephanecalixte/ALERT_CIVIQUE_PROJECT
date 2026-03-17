package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.PushNotificationDTO;
import com.enterprise.alert_civique.entity.PushNotification;
import com.enterprise.alert_civique.mapper.PushNotificationMapperService;
import com.enterprise.alert_civique.repository.PushNotificationRepository;
import com.enterprise.alert_civique.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PushNotificationServiceImpl implements PushNotificationService {

    private final PushNotificationRepository pushNotificationRepository;
    private final PushNotificationMapperService pushNotificationMapperService;

    @Override
    public PushNotificationDTO sendPushNotification(PushNotificationDTO dto) {
        log.info("Envoi notification push - reportId: {}, userId: {}", dto.reportId(), dto.userId());
        
        PushNotification entity = pushNotificationMapperService.toEntity(dto);
        entity.setSentAt(LocalDateTime.now());
        
        PushNotification saved = pushNotificationRepository.save(entity);
        log.info("Notification sauvegardée ID: {}", saved.getPushNotificationId());
        
        // TODO: Intégration FCM/APNS
        // sendFCMNotification(saved.getToken(), dto.message());
        
        return pushNotificationMapperService.toDTO(saved);
    }

    @Override
    public List<PushNotificationDTO> getNotificationsByUser(Long userId) {
        log.info("Récupération notifications userId: {}", userId);
        return pushNotificationRepository.findByUserId(userId)
                .stream()
                .map(pushNotificationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PushNotificationDTO> getNotificationsByReport(Long reportId) {
        log.info("Récupération notifications reportId: {}", reportId);
        return pushNotificationRepository.findByReportId(reportId)
                .stream()
                .map(pushNotificationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteNotification(Long id) {
        log.info("Suppression notification ID: {}", id);
        pushNotificationRepository.deleteById(id);
    }
}

