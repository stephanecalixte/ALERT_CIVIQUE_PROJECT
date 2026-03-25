package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.PushNotificationDTO;
import com.enterprise.alert_civique.entity.PushNotification;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.mapper.PushNotificationMapperService;
import com.enterprise.alert_civique.repository.PushNotificationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.service.PushNotificationService;
import jakarta.persistence.EntityNotFoundException;
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
    private final UserRepository userRepository;         // ✅ Ajout
    private final ReportRepository reportRepository;     // ✅ Ajout

    @Override
    public PushNotificationDTO sendPushNotification(PushNotificationDTO dto) {
        log.info("Envoi notification push - reportId: {}, userId: {}", dto.reportId(), dto.userId());

        PushNotification entity = pushNotificationMapperService.toEntity(dto);
        entity.setSentAt(LocalDateTime.now());

        // ✅ Assignation des relations via les repositories
        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                    .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + dto.userId()));
            entity.setUser(user);
        }

        if (dto.reportId() != null) {
            Reports report = reportRepository.findById(dto.reportId())
                    .orElseThrow(() -> new EntityNotFoundException("Report introuvable : " + dto.reportId()));
            entity.setReport(report);
        }

        PushNotification saved = pushNotificationRepository.save(entity);
        log.info("Notification sauvegardée ID: {}", saved.getPushNotificationId());

        return pushNotificationMapperService.toDTO(saved);
    }

    @Override
    public List<PushNotificationDTO> getNotificationsByUser(Long userId) {
        log.info("Récupération notifications userId: {}", userId);
        // ✅ findByUserUserId au lieu de findByUserId
        return pushNotificationRepository.findByUserUserId(userId)
                .stream()
                .map(pushNotificationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PushNotificationDTO> getNotificationsByReport(Long reportId) {
        log.info("Récupération notifications reportId: {}", reportId);
        // ✅ findByReportReportId au lieu de findByReportId
        return pushNotificationRepository.findByReportReportId(reportId)
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