package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.EmergenciesAlertDTO;
import com.enterprise.alert_civique.entity.EmergenciesAlert;
import com.enterprise.alert_civique.mapper.EmergenciesMapperService;
import com.enterprise.alert_civique.repository.EmergenciesAlertRepository;
import com.enterprise.alert_civique.service.EmergenciesAlertService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmergenciesAlertServiceImpl implements EmergenciesAlertService {

    private final EmergenciesAlertRepository emergenciesAlertRepository;
    private final EmergenciesMapperService emergenciesMapper;

    public EmergenciesAlertServiceImpl(
            EmergenciesAlertRepository emergenciesAlertRepository,
            EmergenciesMapperService emergenciesMapper
    ) {
        this.emergenciesAlertRepository = emergenciesAlertRepository;
        this.emergenciesMapper = emergenciesMapper;
    }

    @Override
    public EmergenciesAlertDTO createEmergenciesAlert(EmergenciesAlertDTO dto) throws Exception {
        if (dto == null) {
            throw new IllegalArgumentException("Le DTO EmergenciesAlert ne peut pas etre null");
        }

        validateCreateRequest(dto);

        EmergenciesAlert alert = emergenciesMapper.toEntity(dto);
        alert.setEmergenciesAlertId(null);

        EmergenciesAlert savedAlert = emergenciesAlertRepository.save(alert);
        return emergenciesMapper.toDTO(savedAlert);
    }

    @Override
    public EmergenciesAlertDTO updateEmergenciesAlert(Long id, EmergenciesAlertDTO dto) throws Exception {
        if (id == null) {
            throw new IllegalArgumentException("L'ID de l'alerte d'urgence est obligatoire pour la mise a jour");
        }
        if (dto == null) {
            throw new IllegalArgumentException("Le DTO EmergenciesAlert ne peut pas etre null");
        }

        EmergenciesAlert existingAlert = emergenciesAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte d'urgence non trouvee avec l'ID : " + id));

        if (dto.email() != null) {
            existingAlert.setEmail(dto.email());
        }

        if (dto.messages() != null) {
            existingAlert.setMessages(dto.messages());
        }

        EmergenciesAlert updatedAlert = emergenciesAlertRepository.save(existingAlert);
        return emergenciesMapper.toDTO(updatedAlert);
    }

    @Override
    public EmergenciesAlertDTO deleteEmergenciesAlert(Long id) throws Exception {
        if (id == null) {
            throw new IllegalArgumentException("L'ID de l'alerte d'urgence est obligatoire pour la suppression");
        }

        EmergenciesAlert alert = emergenciesAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte d'urgence non trouvee avec l'ID : " + id));

        emergenciesAlertRepository.delete(alert);
        return emergenciesMapper.toDTO(alert);
    }

    @Override
    public List<EmergenciesAlertDTO> getAllEmergenciesAlerts() {
        return emergenciesAlertRepository.findAll().stream()
                .map(emergenciesMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<EmergenciesAlertDTO> getEmergenciesAlertById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return emergenciesAlertRepository.findById(id)
                .map(emergenciesMapper::toDTO);
    }

    @Override
    public List<EmergenciesAlertDTO> getEmergenciesAlertsByEmail(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("L'email est obligatoire pour la recherche");
        }
        return emergenciesAlertRepository.findByEmail(email).stream()
                .map(emergenciesMapper::toDTO)
                .collect(Collectors.toList());
    }

    private void validateCreateRequest(EmergenciesAlertDTO dto) {
        if (dto.email() == null || dto.email().isEmpty()) {
            throw new IllegalArgumentException("Le champ 'email' est obligatoire");
        }
    }
}

