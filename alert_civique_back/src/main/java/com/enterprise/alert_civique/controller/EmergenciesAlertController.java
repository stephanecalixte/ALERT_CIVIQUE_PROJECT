package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.EmergenciesAlertDTO;
import com.enterprise.alert_civique.entity.EmergenciesAlert;
import com.enterprise.alert_civique.mapper.EmergenciesMapperService;
import com.enterprise.alert_civique.repository.EmergenciesAlertRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/emergencies")
@CrossOrigin
public class EmergenciesAlertController {

    private final EmergenciesAlertRepository emergencyAlertRepository;
    private final EmergenciesMapperService emergencyAlertMapperService;

    public EmergenciesAlertController(EmergenciesAlertRepository emergencyAlertRepository,
                                      EmergenciesMapperService emergencyAlertMapperService) {
        this.emergencyAlertRepository = emergencyAlertRepository;
        this.emergencyAlertMapperService = emergencyAlertMapperService;
    }

    @GetMapping
    public ResponseEntity<List<EmergenciesAlertDTO>> getAllEmergencies() {
        try {
            List<EmergenciesAlertDTO> list = emergencyAlertRepository.findAll()
                    .stream()
                    .map(emergencyAlertMapperService::toDTO)
                    .toList();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergenciesAlertDTO> getEmergencyById(@PathVariable Long id) {
        try {
            EmergenciesAlert alert = emergencyAlertRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Emergency alert not found with id: " + id));
            return ResponseEntity.ok(emergencyAlertMapperService.toDTO(alert));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<EmergenciesAlertDTO> createEmergency(@RequestBody EmergenciesAlertDTO dto) {
        try {
            EmergenciesAlert alert = emergencyAlertMapperService.toEntity(dto);
            EmergenciesAlert saved = emergencyAlertRepository.save(alert);
            return ResponseEntity.status(HttpStatus.CREATED).body(emergencyAlertMapperService.toDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
public ResponseEntity<EmergenciesAlertDTO> updateEmergency(@PathVariable Long id, @RequestBody EmergenciesAlertDTO dto) {
    try {
        EmergenciesAlert alert = emergencyAlertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency alert not found with id: " + id));

        alert.setSentAt(dto.sentAt());
        alert.setEmail(dto.email());
        alert.setMessages(dto.messages());

        EmergenciesAlert updated = emergencyAlertRepository.save(alert);
        return ResponseEntity.ok(emergencyAlertMapperService.toDTO(updated));

    } catch (IllegalArgumentException e) { // <-- mettre avant RuntimeException
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

    @DeleteMapping("/{id}")
    public ResponseEntity<EmergenciesAlertDTO> deleteEmergency(@PathVariable Long id) {
        try {
            EmergenciesAlert alert = emergencyAlertRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Emergency alert not found with id: " + id));

            emergencyAlertRepository.delete(alert);
            return ResponseEntity.ok(emergencyAlertMapperService.toDTO(alert));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}