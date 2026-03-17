package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import java.util.List;
import java.util.Optional;

public interface LiveStreamService {

    LiveStream createLiveStream(LiveStreamDTO liveStreamDTO) throws Exception;
    LiveStream updateLiveStream(LiveStreamDTO liveStreamDTO) throws Exception;
    LiveStream deleteLiveStream(Long livestreamId );
    List<LiveStream> getALLLiveStream();
    Optional<LiveStream>getLiveStreamById(Long livestreamId) throws Exception;

}
