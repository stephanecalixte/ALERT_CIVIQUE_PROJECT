package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Geolocalisation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long geolocalisationId;
    private Double latitude;
    private Double longitude;
    private LocalDate timestamp;

    @OneToOne(mappedBy = "geolocalisation")
    private Reports report;
}
