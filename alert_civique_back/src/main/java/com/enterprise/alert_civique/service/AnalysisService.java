package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.AnalysisDTO;
import java.util.List;
import java.util.Optional;

public interface AnalysisService {

    AnalysisDTO createAnalysis(AnalysisDTO analysisDTO);

    AnalysisDTO updateAnalysis(Long id, AnalysisDTO analysisDTO);

    AnalysisDTO deleteAnalysis(Long id);

    List<AnalysisDTO> getAllAnalyses();

    Optional<AnalysisDTO> getAnalysisById(Long id);

    List<AnalysisDTO> getAnalysesByReportId(Long reportId);

    List<AnalysisDTO> getAnalysesByAiValidationId(Long aiValidationId);

    List<AnalysisDTO> getAnalysesByType(String analysisType);
}
