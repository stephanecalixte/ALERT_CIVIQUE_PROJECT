package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_validation")
public class AiValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_validation_id")
    private Long aiValidationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Reports report;

    @Column(name = "score")
    private Double score;

    @Column(name = "decision_level")
    private String decisionLevel;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "analysis_result", columnDefinition = "TEXT")
    private String analysisResult;

    @OneToMany(mappedBy = "aiValidation")
    private List<Analysis> analyses;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
