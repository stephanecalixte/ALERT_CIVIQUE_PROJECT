package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.mapper.LiveStreamMapperService;
import com.enterprise.alert_civique.repository.LiveStreamRepository;
import com.enterprise.alert_civique.service.LiveStreamService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class LiveStreamServiceImpl implements LiveStreamService {

    private final LiveStreamRepository liveStreamRepository;
    private final LiveStreamMapperService liveStreamMapperService;
    private final RestTemplate restTemplate;

    @Value("${node.media.base-url}")
    private String nodeMediaBaseUrl;

    public LiveStreamServiceImpl(
            LiveStreamRepository liveStreamRepository,
            LiveStreamMapperService liveStreamMapperService,
            RestTemplate restTemplate)
    {
        this.liveStreamRepository = liveStreamRepository;
        this.liveStreamMapperService = liveStreamMapperService;
        this.restTemplate = restTemplate;
    }

    @Override
    public LiveStream createLiveStream(LiveStreamDTO liveStreamDTO) throws Exception {
        if (liveStreamDTO == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }
        // streamUrl, startedAt et status sont optionnels à la création :
        // startedAt est géré par @PrePersist, status par défaut = "LIVE"
        LiveStream liveStream = liveStreamMapperService.toEntity(liveStreamDTO);
        liveStream.setLivestreamId(null); // forcer l'auto-génération
        return liveStreamRepository.save(liveStream);
    }

    @Override
    public LiveStream updateLiveStream(LiveStreamDTO liveStreamDTO) throws Exception {
        if (liveStreamDTO.livestreamId() == null) {
            throw new IllegalArgumentException("L'ID du livestream est obligatoire pour la mise à jour !");
        }

        LiveStream existing = liveStreamRepository.findById(liveStreamDTO.livestreamId())
                .orElseThrow(() -> new IllegalArgumentException("Livestream non trouvé avec l'ID : " + liveStreamDTO.livestreamId()));

        // Mise à jour uniquement des champs fournis (non null)
        // Les dates (String) sont parsées dans le mapper lors d'un appel toEntity,
        // ici on les réapplique manuellement via le mapper partiel
        LiveStream patch = liveStreamMapperService.toEntity(liveStreamDTO);
        if (patch.getStreamUrl() != null) existing.setStreamUrl(patch.getStreamUrl());
        if (patch.getVideoUrl()  != null) existing.setVideoUrl(patch.getVideoUrl());
        if (patch.getStatus()    != null) existing.setStatus(patch.getStatus());
        if (patch.getEndedAt()   != null) existing.setEndedAt(patch.getEndedAt());
        if (patch.getStartedAt() != null) existing.setStartedAt(patch.getStartedAt());
        if (patch.getDuration()  != null) existing.setDuration(patch.getDuration());
        if (patch.getUser()      != null) existing.setUser(patch.getUser());

        return liveStreamRepository.save(existing);
    }

    @Override
    public LiveStream deleteLiveStream(Long livestreamId) {

        if (livestreamId == null) {
            throw new IllegalArgumentException("L'ID du livestream est obligatoire pour la suppression !");
        }

        LiveStream existingLive = liveStreamRepository.findById(livestreamId)
                .orElseThrow(() -> new IllegalArgumentException("Livestream non trouvé avec l'ID : " + livestreamId));

        // Supprimer le fichier vidéo + document MongoDB sur le serveur Node.js (best-effort)
        try {
            String url = nodeMediaBaseUrl + "/videos/by-livestream/" + livestreamId;
            restTemplate.delete(url);
            log.info("Vidéo supprimée sur le serveur media pour le livestream {}", livestreamId);
        } catch (Exception e) {
            log.warn("Impossible de supprimer la vidéo sur le serveur media (livestreamId={}) : {}",
                    livestreamId, e.getMessage());
        }

        liveStreamRepository.delete(existingLive);

        return existingLive;
    }

    @Override
    public List<LiveStream> getALLLiveStream() {

        return liveStreamRepository.findAll();
    }

    @Override
    public Optional<LiveStream> getLiveStreamById(Long livestreamId) throws Exception {

        if (livestreamId == null) {
            throw new IllegalArgumentException("L'ID du livestream est obligatoire pour la recherche !");
        }


        return liveStreamRepository.findById(livestreamId);
    }
}