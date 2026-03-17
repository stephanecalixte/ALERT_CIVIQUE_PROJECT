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
@Table(name = "analyses")
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "analyse", columnDefinition = "TEXT")
    private String analyse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Reports report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_validation_id")
    private AiValidation aiValidation;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "analysis_type")
    private String analysisType;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
