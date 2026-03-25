package com.enterprise.alert_civique.mongo.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertHistoryDocument {

    @Id
    private String id;

    private Long userId;
    private Long reportId;
    private String action;
    private String details;
    private LocalDateTime timestamp;

}
