package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import org.springframework.stereotype.Service;


@Service
public class LiveStreamMapperService {

    //Entity to DTO

    public LiveStreamDTO toDTO(LiveStream entity){
      return  new LiveStreamDTO(
             entity.getLivestreamId(),
             entity.getStartedAt(),
             entity.getEndedAt(),
             entity.getStreamUrl(),
             entity.getStatus()

        );
    }

    public LiveStream toEntity(LiveStreamDTO dto){
        LiveStream liveStream=new LiveStream();
        liveStream.setStreamUrl(liveStream.getStreamUrl());
        liveStream.setStatus(liveStream.getStatus());
        liveStream.setStartedAt(liveStream.getStartedAt());
        liveStream.setLivestreamId(liveStream.getLivestreamId());

        return liveStream;
    }
}
