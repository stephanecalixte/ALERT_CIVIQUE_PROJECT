package com.enterprise.alert_civique.service;

import java.util.List;
import com.enterprise.alert_civique.dto.MediaDTO;


public interface MediaService {

MediaDTO createMedia(MediaDTO mediaDTO) throws Exception;
MediaDTO getMediaById(Long id);
MediaDTO updateMedia(Long id,MediaDTO mediaDTO);
List<MediaDTO>getAllMedia();
MediaDTO deleteMedia(Long id);
}
