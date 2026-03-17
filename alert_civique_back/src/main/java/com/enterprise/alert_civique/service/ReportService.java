package com.enterprise.alert_civique.service;

import java.util.List;

import com.enterprise.alert_civique.dto.ReportDTO;


public interface ReportService {
  ReportDTO createReport(ReportDTO dto);
  List<ReportDTO>getAllReports();
  ReportDTO getReportById(Long id);
  ReportDTO updateReport(Long id,ReportDTO dto);
  ReportDTO deleteReport(Long id);
 
  
}
