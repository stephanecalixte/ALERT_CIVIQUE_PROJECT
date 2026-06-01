package com.enterprise.alert_civique.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enterprise.alert_civique.service.AccountActivationService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AccountActivationController {

    private final AccountActivationService accountActivationService;

    @GetMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestParam String token) {
        log.info("Account activation attempt with token");
        
        if (token == null || token.isBlank()) {
            log.warn("Activation attempt with missing or blank token");
            return ResponseEntity.badRequest().body(Map.of("message", "Le token d'activation est requis"));
        }
        
        try {
            accountActivationService.activateAccount(token);
            log.info("Account activated successfully");
        } catch (IllegalAccessException e) {
            log.warn("Account activation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during account activation", e);
            return ResponseEntity.badRequest().body(Map.of("message", "Erreur lors de l'activation du compte"));
        }
        return ResponseEntity.ok(Map.of("message", "Compte activé avec succès"));
    }
}
