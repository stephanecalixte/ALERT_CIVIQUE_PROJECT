package com.enterprise.alert_civique.controller;

import java.util.List;

import com.enterprise.alert_civique.dto.AlertContactNotificationRequest;
import com.enterprise.alert_civique.dto.AlertContactNotificationResult;
import com.enterprise.alert_civique.dto.TrustedContactDTO;
import com.enterprise.alert_civique.service.ContactAlertService;
import com.enterprise.alert_civique.service.TrustedContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/trusted-contacts")
public class TrustedContactController {

    private final TrustedContactService trustedContactService;
    private final ContactAlertService contactAlertService;

    public TrustedContactController(TrustedContactService trustedContactService,
                                    ContactAlertService contactAlertService) {
        this.trustedContactService = trustedContactService;
        this.contactAlertService = contactAlertService;
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
    public ResponseEntity<List<TrustedContactDTO>> getContactsByUserId(@PathVariable Long userId) {
        List<TrustedContactDTO> contacts = trustedContactService.getByUserId(userId);
        return ResponseEntity.ok(contacts);
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

    @PostMapping("/notify-alert")
    public ResponseEntity<List<AlertContactNotificationResult>> notifyAlert(
            @RequestBody AlertContactNotificationRequest request) {
        try {
            List<AlertContactNotificationResult> results = contactAlertService.notifyContacts(request);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}