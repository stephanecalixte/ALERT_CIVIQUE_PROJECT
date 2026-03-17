package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.Geolocalisation;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GeolocalisationRepository extends JpaRepository<Geolocalisation,Long> {
    // Trouver par report ID
    Optional<Geolocalisation> findByReportReportId(Long reportId);

    // Trouver toutes les géolocalisations dans un rayon donné
    @Query("SELECT g FROM Geolocalisation g WHERE " +
           "g.latitude BETWEEN :minLat AND :maxLat AND " +
           "g.longitude BETWEEN :minLon AND :maxLon")
    List<Geolocalisation> findInBoundingBox(
            @Param("minLat") Double minLatitude,
            @Param("maxLat") Double maxLatitude,
            @Param("minLon") Double minLongitude,
            @Param("maxLon") Double maxLongitude
    );

    // Trouver par date
    List<Geolocalisation> findByTimestamp(LocalDate timestamp);

    // Trouver entre deux dates
    List<Geolocalisation> findByTimestampBetween(LocalDate startDate, LocalDate endDate);

    // Trouver les géolocalisations sans report associé
    List<Geolocalisation> findByReportIsNull();

    // Compter les géolocalisations par zone
    @Query("SELECT COUNT(g) FROM Geolocalisation g WHERE " +
           "g.latitude BETWEEN :minLat AND :maxLat AND " +
           "g.longitude BETWEEN :minLon AND :maxLon")
    Long countInBoundingBox(
            @Param("minLat") Double minLatitude,
            @Param("maxLat") Double maxLatitude,
            @Param("minLon") Double minLongitude,
            @Param("maxLon") Double maxLongitude
    );
}
