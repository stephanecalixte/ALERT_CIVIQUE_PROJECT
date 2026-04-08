package com.enterprise.alert_civique.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import com.enterprise.alert_civique.enum1.ReportsStatus;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.entity.Geolocalisation;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.mapper.ReportMapperService;
import com.enterprise.alert_civique.repository.GeolocalisationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.service.ReportService;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final GeolocalisationRepository geolocalisationRepository;
    private final ReportMapperService reportMapper;
    private final UserRepository userRepository; // ✅ Ajout

    public ReportServiceImpl(
            ReportRepository reportRepository,
            GeolocalisationRepository geolocalisationRepository,
            ReportMapperService reportMapper,
            UserRepository userRepository // ✅ Ajout
    ) {
        this.reportRepository = reportRepository;
        this.geolocalisationRepository = geolocalisationRepository;
        this.reportMapper = reportMapper;
        this.userRepository = userRepository; // ✅ Ajout
    }

    @Override
    public ReportDTO createReport(ReportDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }

        Reports report = reportMapper.toEntity(dto);
        report.setCreatedAt(dto.createdAt() != null ? dto.createdAt() : LocalDateTime.now());

        // Description auto-générée depuis alertType si absente
        if (report.getDescription() == null || report.getDescription().trim().isEmpty()) {
            String fallback = dto.alertType() != null ? "Signalement : " + dto.alertType() : "Signalement anonyme";
            report.setDescription(fallback);
        }

        // userId optionnel — si fourni, on lie l'utilisateur
        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                    .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID : " + dto.userId()));
            report.setUser(user);
        }

        if (dto.geolocalisationId() != null) {
            Geolocalisation geo = geolocalisationRepository.findById(dto.geolocalisationId())
                    .orElseThrow(() -> new EntityNotFoundException("Géolocalisation non trouvée avec l'ID : " + dto.geolocalisationId()));
            report.setGeolocalisation(geo);
        }

        Reports savedReport = reportRepository.save(report);
        return reportMapper.toDTO(savedReport);
    }

    @Override
    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll()
                .stream()
                .map(reportMapper::toDTO)
                .toList();
    }

    @Override
    public ReportDTO getReportById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID du report est obligatoire");
        }
        Reports report = reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report non trouvé avec l'ID : " + id));
        return reportMapper.toDTO(report);
    }

    @Override
    public ReportDTO updateReport(Long id, ReportDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID du report est obligatoire pour la mise à jour");
        }
        if (dto == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }

        Reports existingReport = reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report non trouvé avec l'ID : " + id));

        if (dto.description() != null) {
            existingReport.setDescription(dto.description());
        }
        if (dto.status() != null) {
            existingReport.setStatus(dto.status());
        }
        if (dto.priority() != null) {
            existingReport.setPriority(dto.priority());
        }
        if (dto.anonymous() != null) {
            existingReport.setAnonymous(dto.anonymous());
        }

        // ✅ Mise à jour via entité Users au lieu de setUserId()
        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                    .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé avec l'ID : " + dto.userId()));
            existingReport.setUser(user);
        }

        if (dto.geolocalisationId() != null) {
            Geolocalisation geo = geolocalisationRepository.findById(dto.geolocalisationId())
                    .orElseThrow(() -> new EntityNotFoundException("Géolocalisation non trouvée avec l'ID : " + dto.geolocalisationId()));
            existingReport.setGeolocalisation(geo);
        }

        Reports updatedReport = reportRepository.save(existingReport);
        return reportMapper.toDTO(updatedReport);
    }

    @Override
    public ReportDTO deleteReport(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID du report est obligatoire pour la suppression");
        }
        Reports report = reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report non trouvé avec l'ID : " + id));
        reportRepository.delete(report);
        return reportMapper.toDTO(report);
    }

public List<ReportDTO> getReportsByUserId(Long userId) {
    if (userId == null) {
        throw new IllegalArgumentException("L'ID utilisateur est obligatoire");
    }
    return reportRepository.findByUserUserId(userId)
            .stream()
            .map(reportMapper::toDTO)
            .toList();
}

    public List<ReportDTO> getReportsByStatus(String status) {
        if (status == null) {
            throw new IllegalArgumentException("Le statut est obligatoire");
        }
        return reportRepository.findByStatus(ReportsStatus.valueOf(status))
                .stream()
                .map(reportMapper::toDTO)
                .toList();
    }
}