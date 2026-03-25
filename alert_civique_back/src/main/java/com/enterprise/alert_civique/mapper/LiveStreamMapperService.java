package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import org.springframework.stereotype.Service;

@Service
public class LiveStreamMapperService {

    // Entity to DTO - Fixed order to match LiveStreamDTO record
    public LiveStreamDTO toDTO(LiveStream entity){
      return  new LiveStreamDTO(
             entity.getLivestreamId(),
             "dummy-user", // userId
             entity.getStartedAt(),
             entity.getEndedAt(),
             entity.getStreamUrl(),
             entity.getStatus(),
             entity.getVideoUrl(),
             entity.getMediaId(),
             entity.getDuration()
        );
    }

    // DTO to Entity
    public LiveStream toEntity(LiveStreamDTO dto){
        LiveStream liveStream = new LiveStream();
        liveStream.setStreamUrl(dto.streamUrl());
        liveStream.setStatus(dto.status());
        liveStream.setStartedAt(dto.startedAt());
        liveStream.setLivestreamId(dto.livestreamId());
        liveStream.setVideoUrl(dto.videoUrl());
        liveStream.setMediaId(dto.mediaId());
        liveStream.setEndedAt(dto.endedAt());
        liveStream.setDuration(dto.duration());

        return liveStream;
    }
}
