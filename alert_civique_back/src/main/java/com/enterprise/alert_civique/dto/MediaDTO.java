package com.enterprise.alert_civique.dto;

import java.time.LocalDateTime;




public record MediaDTO(
        Long mediaId,
        String url,
        String typeMedia,
        LocalDateTime dateUpload,
        Long reportId
) {





}

