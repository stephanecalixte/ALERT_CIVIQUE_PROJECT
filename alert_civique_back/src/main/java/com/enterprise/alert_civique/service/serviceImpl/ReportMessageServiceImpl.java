package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.ReportMessageDTO;
import com.enterprise.alert_civique.entity.ReportMessage;
import com.enterprise.alert_civique.mapper.ReportMessageMapperService;
import com.enterprise.alert_civique.repository.ReportMessageRepository;
import com.enterprise.alert_civique.service.ReportMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportMessageServiceImpl implements ReportMessageService {

    private final ReportMessageRepository repository;
    private final ReportMessageMapperService mapper;

    @Override
    public ReportMessageDTO createReportMessage(ReportMessageDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("DTO null");
        }

        ReportMessage entity = mapper.toEntity(dto);

        ReportMessage saved = repository.save(entity);

        return mapper.toDto(saved);
    }

    @Override
    public List<ReportMessageDTO> getAllReportMessage() {

        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public Optional<ReportMessageDTO> getReportMessageById(Long id) {

        ReportMessage entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        return Optional.ofNullable(mapper.toDto(entity));
    }

    @Override
    public void deleteReportMessage(Long id) {

        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }

        repository.deleteById(id);
    }

    @Override
    public List<ReportMessageDTO> getChatReportMessages() {
        return repository.findByAlertTypeIsNotNullOrderByCreatedAtAsc()
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}

