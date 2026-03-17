package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.EmergenciesAlertDTO;
import java.util.List;
import java.util.Optional;

public interface EmergenciesAlertService {
    EmergenciesAlertDTO createEmergenciesAlert(EmergenciesAlertDTO dto) throws Exception;
    EmergenciesAlertDTO updateEmergenciesAlert(Long id, EmergenciesAlertDTO dto) throws Exception;
    EmergenciesAlertDTO deleteEmergenciesAlert(Long id) throws Exception;
    List<EmergenciesAlertDTO> getAllEmergenciesAlerts();
    Optional<EmergenciesAlertDTO> getEmergenciesAlertById(Long id);
    List<EmergenciesAlertDTO> getEmergenciesAlertsByEmail(String email);
}