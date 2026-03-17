package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.AnalysisDTO;
import com.enterprise.alert_civique.entity.Analysis;
import com.enterprise.alert_civique.entity.AiValidation;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.mapper.AnalysisMapperService;
import com.enterprise.alert_civique.repository.AnalysisRepository;
import com.enterprise.alert_civique.repository.AiValidationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.service.AnalysisService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnalysisServiceImpl implements AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final ReportRepository reportRepository;
    private final AiValidationRepository aiValidationRepository;
    private final AnalysisMapperService analysisMapper;

    public AnalysisServiceImpl(
            AnalysisRepository analysisRepository,
            ReportRepository reportRepository,
            AiValidationRepository aiValidationRepository,
            AnalysisMapperService analysisMapper
    ) {
        this.analysisRepository = analysisRepository;
        this.reportRepository = reportRepository;
        this.aiValidationRepository = aiValidationRepository;
        this.analysisMapper = analysisMapper;
    }

    @Override
    public AnalysisDTO createAnalysis(AnalysisDTO analysisDTO) {
        if (analysisDTO == null) {
            throw new IllegalArgumentException("Le DTO Analysis ne peut pas etre null");
        }

        validateCreateRequest(analysisDTO);

        Analysis analysis = analysisMapper.toEntity(analysisDTO);
        analysis.setAnalysisId(null);

        if (analysisDTO.reportId() != null) {
            Reports report = reportRepository.findById(analysisDTO.reportId())
                    .orElseThrow(() -> new RuntimeException("Report non trouve avec l'ID : " + analysisDTO.reportId()));
            analysis.setReport(report);
        }

        if (analysisDTO.aiValidationId() != null) {
            AiValidation aiValidation = aiValidationRepository.findById(analysisDTO.aiValidationId())
                    .orElseThrow(() -> new RuntimeException("AIValidation non trouvee avec l'ID : " + analysisDTO.aiValidationId()));
            analysis.setAiValidation(aiValidation);
        }

        Analysis savedAnalysis = analysisRepository.save(analysis);
        return analysisMapper.toDTO(savedAnalysis);
    }

    @Override
    public AnalysisDTO updateAnalysis(Long id, AnalysisDTO analysisDTO) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID de l'analyse est obligatoire pour la mise a jour");
        }
        if (analysisDTO == null) {
            throw new IllegalArgumentException("Le DTO Analysis ne peut pas etre null");
        }

        Analysis existingAnalysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analyse non trouvee avec l'ID : " + id));

        if (analysisDTO.analyse() != null) {
            existingAnalysis.setAnalyse(analysisDTO.analyse());
        }
        if (analysisDTO.analysisType() != null) {
            existingAnalysis.setAnalysisType(analysisDTO.analysisType());
        }
        if (analysisDTO.confidenceScore() != null) {
            existingAnalysis.setConfidenceScore(analysisDTO.confidenceScore());
        }
        if (analysisDTO.details() != null) {
            existingAnalysis.setDetails(analysisDTO.details());
        }

        if (analysisDTO.reportId() != null) {
            Reports report = reportRepository.findById(analysisDTO.reportId())
                    .orElseThrow(() -> new RuntimeException("Report non trouve avec l'ID : " + analysisDTO.reportId()));
            existingAnalysis.setReport(report);
        }

        if (analysisDTO.aiValidationId() != null) {
            AiValidation aiValidation = aiValidationRepository.findById(analysisDTO.aiValidationId())
                    .orElseThrow(() -> new RuntimeException("AIValidation non trouvee avec l'ID : " + analysisDTO.aiValidationId()));
            existingAnalysis.setAiValidation(aiValidation);
        }

        Analysis updatedAnalysis = analysisRepository.save(existingAnalysis);
        return analysisMapper.toDTO(updatedAnalysis);
    }

    @Override
    public AnalysisDTO deleteAnalysis(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID de l'analyse est obligatoire pour la suppression");
        }

        Analysis analysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analyse non trouvee avec l'ID : " + id));

        analysisRepository.delete(analysis);
        return analysisMapper.toDTO(analysis);
    }

    @Override
    public List<AnalysisDTO> getAllAnalyses() {
        return analysisRepository.findAll().stream()
                .map(analysisMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<AnalysisDTO> getAnalysisById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return analysisRepository.findById(id)
                .map(analysisMapper::toDTO);
    }

    @Override
    public List<AnalysisDTO> getAnalysesByReportId(Long reportId) {
        if (reportId == null) {
            throw new IllegalArgumentException("L'ID du report est obligatoire");
        }
        return analysisRepository.findByReport_ReportId(reportId).stream()
                .map(analysisMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisDTO> getAnalysesByAiValidationId(Long aiValidationId) {
        if (aiValidationId == null) {
            throw new IllegalArgumentException("L'ID de l'AIValidation est obligatoire");
        }
        return analysisRepository.findByAiValidation_AiValidationId(aiValidationId).stream()
                .map(analysisMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalysisDTO> getAnalysesByType(String analysisType) {
        if (analysisType == null || analysisType.isEmpty()) {
            throw new IllegalArgumentException("Le type d'analyse est obligatoire");
        }
        return analysisRepository.findByAnalysisType(analysisType).stream()
                .map(analysisMapper::toDTO)
                .collect(Collectors.toList());
    }

    private void validateCreateRequest(AnalysisDTO analysisDTO) {
        if (analysisDTO.analyse() == null || analysisDTO.analyse().isEmpty()) {
            throw new IllegalArgumentException("Le champ 'analyse' est obligatoire");
        }
        if (analysisDTO.analysisType() == null || analysisDTO.analysisType().isEmpty()) {
            throw new IllegalArgumentException("Le champ 'analysisType' est obligatoire");
        }
    }
}

