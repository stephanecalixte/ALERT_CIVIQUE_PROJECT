package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.GeolocalisationDTO;
import com.enterprise.alert_civique.entity.Geolocalisation;
import com.enterprise.alert_civique.entity.Reports;
import com.enterprise.alert_civique.mapper.GeolocalisationMapperService;
import com.enterprise.alert_civique.repository.GeolocalisationRepository;
import com.enterprise.alert_civique.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geolocations")
@RequiredArgsConstructor
public class GeolocalisationController {

    private final GeolocalisationRepository geolocalisationRepository;
    private final GeolocalisationMapperService geolocalisationMapperService;
    private final ReportRepository reportRepository;

    @GetMapping
    public ResponseEntity<List<GeolocalisationDTO>> getAllGeolocations() {
        return ResponseEntity.ok(geolocalisationRepository.findAll()
                .stream()
                .map(geolocalisationMapperService::toDTO)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeolocalisationDTO> getGeolocationById(@PathVariable Long id) {
        Geolocalisation geo = geolocalisationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Geolocation not found with id: " + id));
        return ResponseEntity.ok(geolocalisationMapperService.toDTO(geo));
    }

    @PostMapping
    public ResponseEntity<GeolocalisationDTO> createGeolocation(@RequestBody GeolocalisationDTO dto) {
        Geolocalisation geo = geolocalisationMapperService.toEntity(dto);
        return ResponseEntity.ok(geolocalisationMapperService.toDTO(geolocalisationRepository.save(geo)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeolocalisationDTO> updateGeolocation(@PathVariable Long id,
                                                                 @RequestBody GeolocalisationDTO dto) {
        Geolocalisation geo = geolocalisationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Geolocation not found with id: " + id));

        geo.setLatitude(dto.latitude());
        geo.setLongitude(dto.longitude());
        geo.setTimestamp(dto.timestamp());

        if (dto.reportId() != null) {
            Reports report = reportRepository.findById(dto.reportId())
                    .orElseThrow(() -> new RuntimeException("Report non trouvé avec l'ID : " + dto.reportId()));
            geo.setReport(report);
        } else {
            geo.setReport(null);
        }

        return ResponseEntity.ok(geolocalisationMapperService.toDTO(geolocalisationRepository.save(geo)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<GeolocalisationDTO> deleteGeolocation(@PathVariable Long id) {
        Geolocalisation geo = geolocalisationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Geolocation not found with id: " + id));

        geolocalisationRepository.delete(geo);
        return ResponseEntity.ok(geolocalisationMapperService.toDTO(geo));
    }
}