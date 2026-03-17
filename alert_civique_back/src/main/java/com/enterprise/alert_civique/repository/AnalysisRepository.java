package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByReport_ReportId(Long reportId);
    List<Analysis> findByAiValidation_AiValidationId(Long aiValidationId);
    List<Analysis> findByAnalysisType(String analysisType);
    List<Analysis> findByConfidenceScoreGreaterThan(Double minScore);
}