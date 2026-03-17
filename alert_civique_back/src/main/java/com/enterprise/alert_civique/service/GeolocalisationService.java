package com.enterprise.alert_civique.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.enterprise.alert_civique.dto.GeolocalisationDTO;

public interface GeolocalisationService {
     GeolocalisationDTO createGeolocalisation(GeolocalisationDTO dto) throws Exception;
    GeolocalisationDTO updateGeolocalisation(Long id, GeolocalisationDTO dto) throws Exception;
    GeolocalisationDTO deleteGeolocalisation(Long id) throws Exception;
    List<GeolocalisationDTO> getAllGeolocalisations();
    Optional<GeolocalisationDTO> getGeolocalisationById(Long id);
    Optional<GeolocalisationDTO> getGeolocalisationByReportId(Long reportId);
    List<GeolocalisationDTO> getGeolocalisationsInBoundingBox(
            Double minLat, Double maxLat, Double minLon, Double maxLon);
    List<GeolocalisationDTO> getGeolocalisationsByDate(LocalDate date);
    List<GeolocalisationDTO> getGeolocalisationsBetweenDates(LocalDate startDate, LocalDate endDate);
    List<GeolocalisationDTO> getOrphanGeolocalisations();
    
}
