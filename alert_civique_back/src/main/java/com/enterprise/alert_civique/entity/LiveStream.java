package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lives_stream")
public class LiveStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "livestream_id")
    private Long livestreamId;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "stream_url")
    private String streamUrl;

    @Column(name = "status")
    private String status; // "LIVE", "ENDED", "SCHEDULED"

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        status = "LIVE";
    }
}
