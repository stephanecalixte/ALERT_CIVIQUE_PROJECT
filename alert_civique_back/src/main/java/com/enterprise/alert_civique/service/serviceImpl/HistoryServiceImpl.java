package com.enterprise.alert_civique.service.serviceImpl;


import com.enterprise.alert_civique.dto.HistoryDTO;
import com.enterprise.alert_civique.entity.History;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.mapper.HistoryMapperService;
import com.enterprise.alert_civique.repository.HistoryRepository;
import com.enterprise.alert_civique.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final HistoryRepository historyRepository;
    private final HistoryMapperService historyMapper;

    @Override
    public HistoryDTO createHistory(HistoryDTO historyDTO) {
        if (historyDTO == null) {
            throw new IllegalArgumentException("HistoryDTO ne peut pas être null");
        }
        History entity = historyMapper.toEntity(historyDTO);
        History saved = historyRepository.save(entity);
        return historyMapper.toDTO(saved);
    }

    @Override
    public HistoryDTO updateHistory(Long historyId, HistoryDTO historyDTO) {
        if (historyDTO == null) {
            throw new IllegalArgumentException("HistoryDTO ne peut pas être null");
        }
        History existing = historyRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("History introuvable avec l'id : " + historyId));

        // Mise à jour des champs
        existing.setAnalyse(historyDTO.analyse());
        existing.setAction(historyDTO.action());
        existing.setDetails(historyDTO.details());
        existing.setCreatedAt(historyDTO.createdAt());

        if (historyDTO.reportId() != null) {
            Reports report = new Reports();
            report.setReportId(historyDTO.reportId());
            existing.setReport(report);
        }

        if (historyDTO.userId() != null) {
            Users user = new Users();
            user.setUserId(historyDTO.userId());
            existing.setUser(user);
        }

        History updated = historyRepository.save(existing);
        return historyMapper.toDTO(updated);
    }

    @Override
    public HistoryDTO deleteHistory(Long historyId) {
        History existing = historyRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("History introuvable avec l'id : " + historyId));

        historyRepository.delete(existing);
        return historyMapper.toDTO(existing); // retourne le DTO de l'objet supprimé
    }

    @Override
    public List<HistoryDTO> getAllHistories() {
        return historyRepository.findAll()
                .stream()
                .map(historyMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<HistoryDTO> getHistoryById(Long historyId) {
        return historyRepository.findById(historyId)
                .map(historyMapper::toDTO);
    }
}