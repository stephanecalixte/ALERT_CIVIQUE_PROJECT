package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.enterprise.alert_civique.enum1.DecisionLevel;
import com.enterprise.alert_civique.enum1.ReportsStatus;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reports {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;


    @Column(name = "anonymous")
    private Boolean anonymous;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "category_id")
    private Long categoryId;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReportsStatus status;


    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL)
    private List<ReportMessage> reportMessages;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private DecisionLevel priority;

    @OneToOne
    @JoinColumn(name = "geolocalisation_id")
    private Geolocalisation geolocalisation;

 
}