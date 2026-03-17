package com.enterprise.alert_civique.service.serviceImpl;

import java.util.List;

import com.enterprise.alert_civique.entity.Media;
import com.enterprise.alert_civique.entity.Reports;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.MediaDTO;

import com.enterprise.alert_civique.mapper.MediaMapperService;
import com.enterprise.alert_civique.service.MediaService;
import com.enterprise.alert_civique.repository.MediaRepository;
import com.enterprise.alert_civique.repository.ReportRepository;


@Service
public class MediaServiceImpl implements MediaService {

    private final MediaMapperService mapperService;
    private final MediaRepository mediaRepository;
    private final ReportRepository reportRepository;

    public MediaServiceImpl(
        MediaMapperService mapperService,
        MediaRepository mediaRepository,
        ReportRepository reportRepository
    ) {
        this.mapperService = mapperService;
        this.mediaRepository = mediaRepository;
        this.reportRepository = reportRepository;
    }

    @Override
    public MediaDTO createMedia(MediaDTO mediaDTO ) {
        Reports report = reportRepository.findById(mediaDTO.reportId())
                .orElseThrow(() -> new RuntimeException("Report not found"));
                Media media1=new Media();
                media1.setUrl(mediaDTO.url());
                media1.setTypeMedia(mediaDTO.typeMedia());
                media1.setDateUpload(mediaDTO.dateUpload());
        Media media = mapperService.toEntity(mediaDTO);
        Media mediaSave = mediaRepository.save(media);
        return mapperService.toDTO(mediaSave);
    }


    @Override
    public MediaDTO getMediaById(Long id) {
   
        Media media = mediaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Media not found"));
            
        return mapperService.toDTO(media);
    }

@Override
public MediaDTO updateMedia(Long id, MediaDTO mediaDTO) {
    Media mediaExisting = mediaRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Media not updated"));

    mediaExisting.setUrl(mediaDTO.url());
    mediaExisting.setTypeMedia(mediaDTO.typeMedia());
    mediaExisting.setDateUpload(mediaDTO.dateUpload());
    Media saved = mediaRepository.save(mediaExisting);
    return mapperService.toDTO(saved);
}

    @Override
    public List<MediaDTO> getAllMedia() {
        return mediaRepository.findAll()
            .stream()
            .map(mapperService::toDTO)
            .toList();
    }

    @Override
    public MediaDTO deleteMedia(Long id) {
        Media media = mediaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Media not found"));

        mediaRepository.delete(media);
        return mapperService.toDTO(media);
    }
}
