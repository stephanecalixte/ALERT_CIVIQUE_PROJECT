package com.enterprise.alert_civique.controller;

import java.util.List;

import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.service.TrustedContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/trusted-contacts")
public class TrustedContactController {

    private final TrustedContactService trustedContactService;

    public TrustedContactController(TrustedContactService trustedContactService) {
        this.trustedContactService = trustedContactService;
    }

    @PostMapping
    public ResponseEntity<?> createTrustedContact(@RequestBody TrustedContactDTO contactDTO) {
        try {
            TrustedContactDTO created = trustedContactService.createTrustedContact(contactDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTrustedContact(@PathVariable Long id) {
        try {
            TrustedContactDTO contact = trustedContactService.getTrustedContactById(id);
            return ResponseEntity.ok(contact);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TrustedContactDTO>> getAllTrustedContacts() {
        List<TrustedContactDTO> contacts = trustedContactService.getAllTrustedContacts();
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getContactByUserId(@PathVariable Long userId) {
        try {
            TrustedContactDTO contact = trustedContactService.getTrustedContactByUserId(userId);
            return ResponseEntity.ok(contact);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrustedContact(@PathVariable Long id, @RequestBody TrustedContactDTO contactDTO) {
        try {
            TrustedContactDTO updated = trustedContactService.updateTrustedContact(id, contactDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrustedContact(@PathVariable Long id) {
        try {
            trustedContactService.deleteTrustedContact(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur : " + e.getMessage());
        }
    }
}