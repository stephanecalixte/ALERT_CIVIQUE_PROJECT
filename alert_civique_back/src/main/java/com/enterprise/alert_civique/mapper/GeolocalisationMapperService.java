package com.enterprise.alert_civique.mapper;

import com.enterprise.alert_civique.dto.GeolocalisationDTO;
import com.enterprise.alert_civique.entity.Geolocalisation;
import org.springframework.stereotype.Service;


@Service
public class GeolocalisationMapperService {
    //Entity to DTO
    public GeolocalisationDTO toDTO(Geolocalisation entity){
     return  new GeolocalisationDTO(
                    entity.getGeolocalisationId(),
                    entity.getLatitude(),
                    entity.getLongitude(),
                    entity.getTimestamp(),
                    entity.getReport()!=null ?entity.getReport().getReportId():null

             );
    }
    //DTO to entity
    public Geolocalisation toEntity(GeolocalisationDTO dto){
        Geolocalisation geo=new Geolocalisation();
        geo.setGeolocalisationId(dto.geolocalisationId());
        geo.setLongitude(dto.longitude());
        geo.setLatitude(dto.latitude());
        geo.setTimestamp(dto.timestamp());
        // geo.setReport(dto.report()!=null ?dto.reportId():null);

        return geo;
    }
}
