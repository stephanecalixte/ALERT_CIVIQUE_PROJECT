package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LiveStreamMapperService {

    private final UserRepository userRepository;

    public LiveStreamDTO toDTO(LiveStream entity) {
        return new LiveStreamDTO(
            entity.getLivestreamId(),
            entity.getUser() != null ? entity.getUser().getUserId() : null,
            entity.getStartedAt(),
            entity.getEndedAt(),
            entity.getStreamUrl(),
            entity.getStatus(),
            entity.getVideoUrl(),
            entity.getDuration()
        );
    }

    public LiveStream toEntity(LiveStreamDTO dto) {
        LiveStream liveStream = new LiveStream();
        liveStream.setLivestreamId(dto.livestreamId());
        liveStream.setStreamUrl(dto.streamUrl());
        liveStream.setStatus(dto.status());
        liveStream.setStartedAt(dto.startedAt());
        liveStream.setVideoUrl(dto.videoUrl());
        liveStream.setEndedAt(dto.endedAt());
        liveStream.setDuration(dto.duration());

        if (dto.userId() != null) {
            Users user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + dto.userId()));
            liveStream.setUser(user);
        }

        return liveStream;
    }
}
