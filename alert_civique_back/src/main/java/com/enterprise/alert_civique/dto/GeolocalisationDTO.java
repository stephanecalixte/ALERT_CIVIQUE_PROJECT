package com.enterprise.alert_civique.dto;




import java.time.LocalDate;

public record GeolocalisationDTO(
  Long geolocalisationId,
  Double latitude,
  Double longitude,
  LocalDate timestamp,
  Long reportId
) {
}
