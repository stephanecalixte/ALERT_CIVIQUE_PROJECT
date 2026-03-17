package com.enterprise.alert_civique.mapper;


import com.enterprise.alert_civique.dto.MediaDTO;
import com.enterprise.alert_civique.entity.*;
import com.enterprise.alert_civique.repository.ReportRepository;
import org.springframework.stereotype.Service;

@Service
public class MediaMapperService {

    private final ReportRepository reportRepository;

    public MediaMapperService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // Entité => DTO
    public MediaDTO toDTO(Media media) {
        if (media == null) {
            return null;
        }
        return new MediaDTO(
            media.getMediaId(),
            media.getUrl(),
            media.getTypeMedia(),
            media.getDateUpload(),
            media.getReport() != null ? media.getReport().getReportId() : null
           
        );
    }

    // DTO => Entité
    public Media toEntity(MediaDTO mediaDTO) {
        if (mediaDTO == null) { 
            throw new RuntimeException("MediaDTO is null");
        }
        
        Media media = new Media();
            
        media.setMediaId(mediaDTO.mediaId());
        media.setUrl(mediaDTO.url());
        media.setTypeMedia(mediaDTO.typeMedia());
        media.setDateUpload(mediaDTO.dateUpload());
        
        if (mediaDTO.reportId() != null) {
            Reports report = reportRepository.findById(mediaDTO.reportId())
                .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'id : " + mediaDTO.reportId()));
            media.setReport(report);
        }
        
        return media;
    }
}
