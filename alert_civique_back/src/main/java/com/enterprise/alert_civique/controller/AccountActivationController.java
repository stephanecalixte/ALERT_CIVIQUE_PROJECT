package com.enterprise.alert_civique.controller;


import lombok.RequiredArgsConstructor;
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
public class AccountActivationController {

    private final AccountActivationService accountActivationService;

    @GetMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestParam String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le token d'activation est requis"));
        }
        try {
            accountActivationService.activateAccount(token);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("Token invalide ou utilisateur non trouvé", e.getMessage()));
        } catch (IllegalStateException e) {
            e.printStackTrace();
            return ResponseEntity.accepted().body(Map.of("Compte déjà actif", e.getMessage()));
        }
        return ResponseEntity.ok(Map.of("message", "Compte activé avec succès"));
    }
}
