package com.enterprise.alert_civique.service;



import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.security.ActivationJwtService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountActivationService {

    private final ActivationJwtService activationJwtService;
    private final UserRepository userRepository;

    public void activateAccount(String token) throws IllegalAccessException, IllegalStateException {

        // Valide le token et récupère les claims
        Claims claims = activationJwtService.valideToken(token);

        String type = claims.get("type", String.class);
        if (!"activation".equals(type)) {
            throw new IllegalAccessException("Token invalide : type incorrect");
        }

        Long userId = claims.get("uid", Long.class);
        if (userId == null) {
            throw new IllegalAccessException("Token invalide : userId invalide");
        }
        Users user = userRepository.findById(userId).orElseThrow(
                () -> new IllegalAccessException("Utilisateur non trouvé")
        );

        if (user.isActive()) {
            throw new IllegalStateException("Compte déjà actif");
        }

        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Effectuer envoi d'email
        System.out.println("Compte activé pour l'utilisateur : " + user.getEmail());
        System.out.println("Envoi d'email de confirmation en cours à " + user.getEmail());
    }
}
