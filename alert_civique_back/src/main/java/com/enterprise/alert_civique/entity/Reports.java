package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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

    // ✅ Relation vers Users au lieu d'un simple Long
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    // ✅ @ManyToMany au lieu de @ManyToOne sur un Set
    @ManyToMany
    @JoinTable(
        name = "report_categories",
        joinColumns = @JoinColumn(name = "report_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Categories> categories;

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

    @OneToMany(mappedBy = "report")
    private Set<Media> medias;
}