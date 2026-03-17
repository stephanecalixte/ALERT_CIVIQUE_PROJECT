package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.AIValidationDTO;
import com.enterprise.alert_civique.service.AiValidationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-validations")
public class AiValidationController {

    private final AiValidationService aiValidationService;

    public AiValidationController(AiValidationService aiValidationService) {
        this.aiValidationService = aiValidationService;
    }

    @GetMapping
    public ResponseEntity<List<AIValidationDTO>> getAll() {
        try {
            List<AIValidationDTO> list = aiValidationService.getAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIValidationDTO> getById(@PathVariable("id") Long id) {
        try {
            AIValidationDTO dto = aiValidationService.getById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<AIValidationDTO> create(@RequestBody AIValidationDTO dto) {
        try {
            AIValidationDTO created = aiValidationService.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
@PutMapping("/{id}")
public ResponseEntity<AIValidationDTO> update(@PathVariable("id") Long id, @RequestBody AIValidationDTO dto) {
    try {
        AIValidationDTO updated = aiValidationService.update(id, dto);
        return ResponseEntity.ok(updated);
    } catch (IllegalArgumentException e) {  // Plus spécifique
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    } catch (RuntimeException e) {  // Plus général
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        try {
            aiValidationService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}