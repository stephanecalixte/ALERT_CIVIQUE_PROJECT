package com.enterprise.alert_civique.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.alert_civique.entity.ActivationToken;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.IActivationRepository;
import com.enterprise.alert_civique.repository.UserRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountActivationService {

    private final IActivationRepository activationRepository;
    private final UserRepository userRepository;

    public void activateAccount(String token) throws IllegalAccessException {

        ActivationToken activationToken = activationRepository.findByTokenHash(token);

        if (activationToken == null) {
            throw new IllegalAccessException("Token invalide ou introuvable");
        }
        if (activationToken.isUsed()) {
            throw new IllegalAccessException("Token déjà utilisé");
        }
        if (activationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalAccessException("Token expiré");
        }

        Users user = activationToken.getUser();
        if (user == null) {
            throw new IllegalAccessException("Utilisateur non trouvé");
        }

        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        activationToken.setUsed(true);
        activationRepository.save(activationToken);

        log.info("Compte activé pour l'utilisateur : {}", user.getEmail());
    }
}
