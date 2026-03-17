package com.enterprise.alert_civique.service;

import java.util.List;
import java.util.Optional;

import com.enterprise.alert_civique.dto.ReportMessageDTO;



public interface ReportMessageService {
    ReportMessageDTO createReportMessage(ReportMessageDTO reportMessageDTO);
    List<ReportMessageDTO>getAllReportMessage();
   Optional<ReportMessageDTO> getReportMessageById(Long id);
    void deleteReportMessage(Long id);
}
