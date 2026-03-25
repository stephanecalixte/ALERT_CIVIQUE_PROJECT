package com.enterprise.alert_civique.dto;

import java.time.LocalDateTime;

public record LiveStreamDTO(
    Long livestreamId,
    String userId,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    String streamUrl,
    String status,
    String videoUrl,
    Long mediaId,
    Integer duration
) {}

