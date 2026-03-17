package com.enterprise.alert_civique.service.serviceImpl;



import com.enterprise.alert_civique.dto.GeolocalisationDTO;
import com.enterprise.alert_civique.entity.Geolocalisation;
import com.enterprise.alert_civique.mapper.GeolocalisationMapperService;
import com.enterprise.alert_civique.repository.GeolocalisationRepository;
import com.enterprise.alert_civique.service.GeolocalisationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GeolocalisationServiceImpl implements GeolocalisationService {

    private GeolocalisationRepository geolocalisationRepository;
    private GeolocalisationMapperService geolocalisationMapperService;


    public GeolocalisationServiceImpl(
            GeolocalisationRepository geolocalisationRepository,
            GeolocalisationMapperService geolocalisationMapperService) {
        this.geolocalisationRepository = geolocalisationRepository;
        this.geolocalisationMapperService = geolocalisationMapperService;
    }

    @Override
    public GeolocalisationDTO createGeolocalisation(GeolocalisationDTO dto) throws Exception {
        try {

            if (dto == null) {
                throw new IllegalArgumentException("Les données de géolocalisation ne peuvent pas être nulles");
            }
            
            if (dto.latitude() == null || dto.longitude() == null) {
                throw new IllegalArgumentException("La latitude et la longitude sont obligatoires");
            }


            Geolocalisation geolocalisation = geolocalisationMapperService.toEntity(dto);
            
            if (geolocalisation.getTimestamp() == null) {
                geolocalisation.setTimestamp(LocalDate.now());
            }
            
            Geolocalisation saved = geolocalisationRepository.save(geolocalisation);
            return geolocalisationMapperService.toDTO(saved);
            
        } catch (IllegalArgumentException e) {
            throw new Exception("Erreur de validation : " + e.getMessage());
        } catch (Exception e) {
            throw new Exception("Erreur lors de la création de la géolocalisation : " + e.getMessage());
        }
    }

    @Override
    public GeolocalisationDTO updateGeolocalisation(Long id, GeolocalisationDTO dto) throws Exception {
        try {
            if (id == null) {
                throw new IllegalArgumentException("L'ID est obligatoire");
            }

            Geolocalisation existing = geolocalisationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Géolocalisation non trouvée avec l'id : " + id));

            // Mise à jour des champs
            if (dto.latitude() != null) {
                existing.setLatitude(dto.latitude());
            }
            if (dto.longitude() != null) {
                existing.setLongitude(dto.longitude());
            }
            if (dto.timestamp() != null) {
                existing.setTimestamp(dto.timestamp());
            }

            Geolocalisation updated = geolocalisationRepository.save(existing);
            return geolocalisationMapperService.toDTO(updated);
            
        } catch (RuntimeException e) {
            throw new Exception(e.getMessage());
        } catch (Exception e) {
            throw new Exception("Erreur lors de la mise à jour : " + e.getMessage());
        }
    }

    @Override
    public GeolocalisationDTO deleteGeolocalisation(Long id) throws Exception {
        try {
            if (id == null) {
                throw new IllegalArgumentException("L'ID est obligatoire");
            }

            Geolocalisation geolocalisation = geolocalisationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Géolocalisation non trouvée avec l'id : " + id));

            GeolocalisationDTO deletedDTO = geolocalisationMapperService.toDTO(geolocalisation);
            geolocalisationRepository.delete(geolocalisation);
            
            return deletedDTO;
            
        } catch (RuntimeException e) {
            throw new Exception(e.getMessage());
        } catch (Exception e) {
            throw new Exception("Erreur lors de la suppression : " + e.getMessage());
        }
    }

    @Override
    public List<GeolocalisationDTO> getAllGeolocalisations() {
        return geolocalisationRepository.findAll().stream()
                .map(geolocalisationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<GeolocalisationDTO> getGeolocalisationById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return geolocalisationRepository.findById(id)
                .map(geolocalisationMapperService::toDTO);
    }

    @Override
    public Optional<GeolocalisationDTO> getGeolocalisationByReportId(Long reportId) {
        if (reportId == null) {
            return Optional.empty();
        }
        return geolocalisationRepository.findByReportReportId(reportId)
                .map(geolocalisationMapperService::toDTO);
    }

    @Override
    public List<GeolocalisationDTO> getGeolocalisationsInBoundingBox(
            Double minLat, Double maxLat, Double minLon, Double maxLon) {
        
        if (minLat == null || maxLat == null || minLon == null || maxLon == null) {
            return List.of();
        }
        
        return geolocalisationRepository.findInBoundingBox(minLat, maxLat, minLon, maxLon)
                .stream()
                .map(geolocalisationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GeolocalisationDTO> getGeolocalisationsByDate(LocalDate date) {
        if (date == null) {
            return List.of();
        }
        return geolocalisationRepository.findByTimestamp(date)
                .stream()
                .map(geolocalisationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GeolocalisationDTO> getGeolocalisationsBetweenDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return List.of();
        }
        return geolocalisationRepository.findByTimestampBetween(startDate, endDate)
                .stream()
                .map(geolocalisationMapperService::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GeolocalisationDTO> getOrphanGeolocalisations() {
        return geolocalisationRepository.findByReportIsNull()
                .stream()
                .map(geolocalisationMapperService::toDTO)
                .collect(Collectors.toList());
    }
}