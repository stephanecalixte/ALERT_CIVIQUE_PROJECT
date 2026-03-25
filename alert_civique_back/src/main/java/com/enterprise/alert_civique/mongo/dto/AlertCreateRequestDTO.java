package com.enterprise.alert_civique.mongo.dto;

import lombok.*;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
public class AlertCreateRequestDTO {

    private Long userId;
    private Long alertId; // Adapted for AlertCivique

}
