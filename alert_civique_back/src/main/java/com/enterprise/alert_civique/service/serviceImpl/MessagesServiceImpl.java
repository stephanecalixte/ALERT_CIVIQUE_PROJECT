package com.enterprise.alert_civique.service.serviceImpl;



import com.enterprise.alert_civique.dto.MessageDTO;
import com.enterprise.alert_civique.entity.Messages;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.EmergenciesAlert;
import com.enterprise.alert_civique.repository.MessagesRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.EmergenciesAlertRepository;
import com.enterprise.alert_civique.service.MessagesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessagesServiceImpl implements MessagesService {

    private final MessagesRepository messagesRepository;
    private final ReportRepository reportsRepository;
    private final EmergenciesAlertRepository emergenciesAlertRepository;

    @Override
    public List<MessageDTO> getAllMessages() {
        return messagesRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    public Optional<MessageDTO> getMessageById(Long id) {
        return messagesRepository.findById(id)
                .map(this::toDTO);
    }

    @Override
    public MessageDTO createMessage(MessageDTO dto) {

        Messages message = new Messages();

        // Report optionnel
        if (dto.reportId() != null) {
            Reports report = reportsRepository.findById(dto.reportId())
                    .orElseThrow(() -> new RuntimeException("Report not found"));
            message.setReport(report);
        }

        // Alert optionnelle
        if (dto.emergenciesAlertId() != null) {
            EmergenciesAlert alert = emergenciesAlertRepository.findById(dto.emergenciesAlertId())
                    .orElseThrow(() -> new RuntimeException("Alert not found"));
            message.setEmergenciesAlert(alert);
        }

        message.setMessage(dto.message());
        message.setSenderEmail(dto.senderEmail());
        message.setIsRead(dto.isRead());
        message.setCreatedAt(LocalDateTime.now());

        return toDTO(messagesRepository.save(message));
    }

    @Override
    public MessageDTO updateMessage(Long id, MessageDTO dto) {

        Messages message = messagesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setMessage(dto.message());
        message.setSenderEmail(dto.senderEmail());
        message.setIsRead(dto.isRead());

        return toDTO(messagesRepository.save(message));
    }

    @Override
    public void deleteMessage(Long id) {
        messagesRepository.deleteById(id);
    }

    // ================= MAPPER =================

    private MessageDTO toDTO(Messages m) {
        return new MessageDTO(
                m.getMessageId(),
                m.getReport() != null ? m.getReport().getReportId() : null,
                m.getEmergenciesAlert() != null ? m.getEmergenciesAlert().getEmergenciesAlertId() : null,
                m.getMessage(),
                m.getCreatedAt(),
                m.getSenderEmail(),
                m.getIsRead()
        );
    }
}