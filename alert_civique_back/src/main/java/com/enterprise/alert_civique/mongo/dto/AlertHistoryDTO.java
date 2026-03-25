package com.enterprise.alert_civique.mongo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
public class AlertHistoryDTO {

    private Long id;
    private Long userId;
    private Long alertId;
    private String status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime historyDate;

}
