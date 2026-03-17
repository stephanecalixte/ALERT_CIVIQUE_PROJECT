package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.ReportMessageDTO;
import com.enterprise.alert_civique.entity.Messages;
import com.enterprise.alert_civique.entity.ReportMessage;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.entity.Reports;

import com.enterprise.alert_civique.repository.MessagesRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ReportMessageMapperService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final MessagesRepository messageRepository;

    public ReportMessageMapperService(UserRepository userRepository,
                                      ReportRepository reportRepository,
                                      MessagesRepository messageRepository) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.messageRepository = messageRepository;
    }

    public ReportMessageDTO toDto(ReportMessage entity) {
        if (entity == null) return null;

        return new ReportMessageDTO(
            entity.getReportMessageId(),
            entity.getUser() != null ? entity.getUser().getUserId() : null,
            entity.getReport() != null ? entity.getReport().getReportId() : null,
            entity.getMessages() != null ? entity.getMessages().getMessageId() : null,
            entity.getReason(),
            entity.getCreatedAt() != null ? LocalDate.parse(entity.getCreatedAt()) : null
        );
    }

    public ReportMessage toEntity(ReportMessageDTO dto) {
        if (dto == null) throw new IllegalArgumentException("DTO ne peut pas être null");

        ReportMessage reportMessage = new ReportMessage();

        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("User non trouvé avec l'id : " + dto.userId()));
            reportMessage.setUser(user);
        }

        if (dto.reportId() != null) {
            Reports report = reportRepository.findById(dto.reportId())
                .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'id : " + dto.reportId()));
            reportMessage.setReport(report);
        }

        if (dto.messageId() != null) {
            Messages message = messageRepository.findById(dto.messageId())
                .orElseThrow(() -> new RuntimeException("Message non trouvé avec l'id : " + dto.messageId()));
            reportMessage.setMessages(message);
        }

        reportMessage.setReason(dto.reason());
        reportMessage.setCreatedAt(
            dto.createdAt() != null ? dto.createdAt().toString() : LocalDate.now().toString()
        );

        return reportMessage;
    }
}