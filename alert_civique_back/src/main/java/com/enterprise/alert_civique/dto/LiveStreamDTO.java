package com.enterprise.alert_civique.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

/**
 * Les dates sont désérialisées via LocalDateTimeDeserializer (JacksonConfig)
 * qui accepte les deux formats ISO 8601 : avec timezone ("Z" / "+01:00") et sans.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record LiveStreamDTO(
    Long livestreamId,
    Long userId,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    String streamUrl,
    String status,
    String videoUrl,
    Integer duration
) {}
