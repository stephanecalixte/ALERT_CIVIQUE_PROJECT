package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.MessageDTO;
import com.enterprise.alert_civique.entity.EmergenciesAlert;
import com.enterprise.alert_civique.entity.Messages;
import com.enterprise.alert_civique.entity.Reports;
import org.springframework.stereotype.Service;

@Service
public class MessageMapperService {

    // ================= ENTITY → DTO =================

    public MessageDTO toDTO(Messages entity){

        return new MessageDTO(
                entity.getMessageId(),
                entity.getReport() != null ? entity.getReport().getReportId() : null,
                entity.getEmergenciesAlert() != null ? entity.getEmergenciesAlert().getEmergenciesAlertId() : null,
                entity.getMessage(),
                entity.getCreatedAt(),
                entity.getSenderEmail(),
                entity.getIsRead()
        );
    }

    // ================= DTO → ENTITY =================

    public Messages toEntity(MessageDTO dto){

        Messages messages = new Messages();

        messages.setMessageId(dto.messageId());
        messages.setMessage(dto.message());
        messages.setCreatedAt(dto.createdAt());
        messages.setSenderEmail(dto.senderEmail());
        messages.setIsRead(dto.isRead());

        // 🔹 Report
        if(dto.reportId() != null){
            Reports report = new Reports();
            report.setReportId(dto.reportId());
            messages.setReport(report);
        }

        // 🔹 Alert
        if(dto.emergenciesAlertId() != null){
            EmergenciesAlert alert = new EmergenciesAlert();
            alert.setEmergenciesAlertId(dto.emergenciesAlertId());
            messages.setEmergenciesAlert(alert);
        }

        return messages;
    }
}