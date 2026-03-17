package com.enterprise.alert_civique.dto;



import java.time.LocalDateTime;

public record LiveStreamDTO(

    Long livestreamId,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    String streamUrl,
    String status
) {



}
