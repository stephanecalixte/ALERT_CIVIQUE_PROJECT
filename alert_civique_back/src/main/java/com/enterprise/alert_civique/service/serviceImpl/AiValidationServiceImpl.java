package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.AIValidationDTO;
import com.enterprise.alert_civique.entity.AiValidation;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.mapper.AiValidationMapperService;
import com.enterprise.alert_civique.repository.AiValidationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.service.AiValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AiValidationServiceImpl implements AiValidationService {

    private final AiValidationRepository validationRepository;
    private final AiValidationMapperService mapper;
    private final ReportRepository reportRepository;

    @Override
    public List<AIValidationDTO> getAll() {
        return validationRepository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    @Override
    public AIValidationDTO getById(Long id) {
        AiValidation entity = validationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AiValidation non trouvée avec l'id : " + id));
        return mapper.toDTO(entity);
    }

    @Override
    public AIValidationDTO create(AIValidationDTO dto) {
        AiValidation entity = mapper.toEntity(dto);
        entity.setAiValidationId(null);

        // ✅ Récupère le vrai Report en base au lieu du Reports fantôme du mapper
        if (dto.reportId() != null) {
            Reports report = reportRepository.findById(dto.reportId())
                    .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'id : " + dto.reportId()));
            entity.setReport(report);
        }

        AiValidation saved = validationRepository.save(entity);
        return mapper.toDTO(saved);
    }

    @Override
    public AIValidationDTO update(Long id, AIValidationDTO dto) {
        AiValidation existing = validationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AiValidation non trouvée avec l'id : " + id));

        existing.setScore(dto.score());
        existing.setDecisionLevel(dto.decisionLevel());
        existing.setModelVersion(dto.modelVersion());
        existing.setAnalysisResult(dto.analysisResult());

        // ✅ Même correction pour l'update
        if (dto.reportId() != null) {
            Reports report = reportRepository.findById(dto.reportId())
                    .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'id : " + dto.reportId()));
            existing.setReport(report);
        } else {
            existing.setReport(null);
        }

        AiValidation updated = validationRepository.save(existing);
        return mapper.toDTO(updated);
    }

    @Override
    public void delete(Long id) {
        validationRepository.deleteById(id);
    }
}