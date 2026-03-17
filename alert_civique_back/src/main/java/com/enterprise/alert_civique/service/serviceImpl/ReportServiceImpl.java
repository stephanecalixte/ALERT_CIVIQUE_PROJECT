package com.enterprise.alert_civique.service.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import com.enterprise.alert_civique.enum1.ReportsStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.alert_civique.dto.ReportDTO;
import com.enterprise.alert_civique.entity.Geolocalisation;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.mapper.ReportMapperService;
import com.enterprise.alert_civique.repository.GeolocalisationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import com.enterprise.alert_civique.service.ReportService;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final GeolocalisationRepository geolocalisationRepository;
    private final ReportMapperService reportMapper;

    public ReportServiceImpl
            (
            ReportRepository reportRepository,
            GeolocalisationRepository geolocalisationRepository,
            ReportMapperService reportMapper

            )
    {
        this.reportRepository = reportRepository;
        this.geolocalisationRepository = geolocalisationRepository;
        this.reportMapper = reportMapper;
    }

    @Override
    public ReportDTO createReport(ReportDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }
        if (dto.description() == null || dto.description().trim().isEmpty()) {
            throw new IllegalArgumentException("La description est obligatoire");
        }
        if (dto.userId() == null) {
            throw new IllegalArgumentException("L'ID utilisateur est obligatoire");
        }

        Reports report = reportMapper.toEntity(dto);


        report.setCreatedAt(LocalDateTime.now());


        if (dto.geolocalisationId() != null) {
            Geolocalisation geo = geolocalisationRepository.findById(dto.geolocalisationId())
                    .orElseThrow(() -> new RuntimeException("Géolocalisation non trouvée avec l'ID : " + dto.geolocalisationId()));
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
                .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'ID : " + id));

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
                .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'ID : " + id));


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

        if (dto.userId() != null) {
            existingReport.setUserId(dto.userId());
        }

        if (dto.categoryId() != null) {
            existingReport.setCategoryId(dto.categoryId());
        }


        if (dto.geolocalisationId() != null) {
            Geolocalisation geo = geolocalisationRepository.findById(dto.geolocalisationId())
                    .orElseThrow(() -> new RuntimeException("Géolocalisation non trouvée avec l'ID : " + dto.geolocalisationId()));
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
                .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'ID : " + id));


        reportRepository.delete(report);

        return reportMapper.toDTO(report);
    }


    public List<ReportDTO> getReportsByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("L'ID utilisateur est obligatoire");
        }

        return reportRepository.findByUserId(userId)
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