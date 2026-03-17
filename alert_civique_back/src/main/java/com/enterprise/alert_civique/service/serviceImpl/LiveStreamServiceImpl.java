package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.mapper.LiveStreamMapperService;
import com.enterprise.alert_civique.repository.LiveStreamRepository;
import com.enterprise.alert_civique.service.LiveStreamService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LiveStreamServiceImpl implements LiveStreamService {

    private final LiveStreamRepository liveStreamRepository;
    private final LiveStreamMapperService liveStreamMapperService;

  
    public LiveStreamServiceImpl(
            LiveStreamRepository liveStreamRepository,
            LiveStreamMapperService liveStreamMapperService)
    {
        this.liveStreamRepository = liveStreamRepository;
        this.liveStreamMapperService = liveStreamMapperService;
    }

    @Override
    public LiveStream createLiveStream(LiveStreamDTO liveStreamDTO) throws Exception {

        if (liveStreamDTO == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }
        if (liveStreamDTO.streamUrl() == null || liveStreamDTO.streamUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("L'URL du stream est obligatoire");
        }
        if (liveStreamDTO.startedAt() == null) {
            throw new IllegalArgumentException("La date de début est obligatoire");
        }
        if (liveStreamDTO.status() == null) {
            throw new IllegalArgumentException("Le statut est obligatoire");
        }


        LiveStream liveStream = liveStreamMapperService.toEntity(liveStreamDTO);


        liveStream.setLivestreamId(null);


        return liveStreamRepository.save(liveStream);
    }

    @Override
    public LiveStream updateLiveStream(LiveStreamDTO liveStreamDTO) throws Exception {
        if (liveStreamDTO.livestreamId() == null) {
            throw new IllegalArgumentException("L'ID du livestream est obligatoire pour la mise à jour !");
        }
        if (liveStreamDTO.streamUrl() == null) {
            throw new IllegalArgumentException("L'URL du stream est obligatoire !");
        }
        if (liveStreamDTO.startedAt() == null) {
            throw new IllegalArgumentException("La date de début est obligatoire !");
        }
        if (liveStreamDTO.status() == null) {
            throw new IllegalArgumentException("Le statut est obligatoire !");
        }

        LiveStream liveStreamExistant = liveStreamRepository.findById(liveStreamDTO.livestreamId())
                .orElseThrow(() -> new IllegalArgumentException("Livestream non trouvé avec l'ID : " + liveStreamDTO.livestreamId()));
        liveStreamExistant.setStreamUrl(liveStreamDTO.streamUrl());
        liveStreamExistant.setStatus(liveStreamDTO.status());
        liveStreamExistant.setEndedAt(liveStreamDTO.endedAt());
        liveStreamExistant.setStartedAt(liveStreamDTO.startedAt());


        return liveStreamRepository.save(liveStreamExistant);
    }

    @Override
    public LiveStream deleteLiveStream(Long livestreamId) {

        if (livestreamId == null) {
            throw new IllegalArgumentException("L'ID du livestream est obligatoire pour la suppression !");
        }

        LiveStream existingLive = liveStreamRepository.findById(livestreamId)
                .orElseThrow(() -> new IllegalArgumentException("Livestream non trouvé avec l'ID : " + livestreamId));

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