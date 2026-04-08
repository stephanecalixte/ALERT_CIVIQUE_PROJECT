package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.ActivationToken;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.IActivationRepository;
import com.enterprise.alert_civique.security.IPasswordService;
import com.enterprise.alert_civique.security.InputSanitizer;
import com.enterprise.alert_civique.security.PasswordPolicyValidator;
import com.enterprise.alert_civique.utils.DtoConverter;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j

/**
 * 
 * Service de gestion de l'inscription des utilisateurs.
 * @since 2024-06
 * @author Enterprise Alert Civique Team    
 * @version 1.0
 * @see AccountActivationService
 * 
 */
public class RegisterService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // ✅ Ajout du RoleRepository
    private final IActivationRepository activationRepository;
    private final IPasswordService passwordService;
    private final InputSanitizer sanitizer;
    private final PasswordPolicyValidator passwordValidator;


    /**
     * Enregistre un nouvel utilisateur après validation des données d'inscription.
     * Valide les champs, vérifie l'unicité de l'email, applique la politique de mot de passe,
     * hash le mot de passe, assigne le rôle par défaut, génère un token d'activation et sauvegarde l'utilisateur en base de données.   
     * 
     * L'activation de l'utilisateur doit être effectuée via le token envoyé par email (non implémenté ici).
     * Le token d'activation est valide pendant 24 heures et ne peut être utilisé qu'une seule fois.
     * En cas de données invalides, d'email déjà utilisé ou de mot de passe ne respectant pas la politique, une exception est levée.
     * @param request Objet contenant les données d'inscription de l'utilisateur (firstname, lastname, email, password, phone, birthdate).
     * @return Un UserResponseDto contenant les informations de l'utilisateur enregistré (sans le mot de passe).
     * @throws Exception  En cas de données d'inscription invalides, d'email déjà utilisé ou de mot de
     *  passe ne respectant pas la politique.
     * @author Calixte Stéphane 
     * 
     */
    public UserResponseDto register(UserRegisterRequestDto request) throws Exception {
        log.info("Tentative d'inscription pour l'email : {}", request.getEmail());

        if (request == null ||
                request.getFirstname() == null || request.getFirstname().isBlank() ||
                request.getLastname() == null || request.getLastname().isBlank() ||
                request.getEmail() == null || request.getEmail().isBlank() ||
                request.getPassword() == null || request.getPassword().isBlank() ||
                request.getPhone() == null || request.getPhone().isBlank() ||
                request.getBirthdate() == null) {
            throw new IllegalArgumentException("Données d'inscription invalides ou incomplètes");
        }

        request.setFirstname(sanitizer.sanitize(request.getFirstname()));
        request.setLastname(sanitizer.sanitize(request.getLastname()));
        request.setEmail(sanitizer.sanitize(request.getEmail()));
        request.setPassword(sanitizer.sanitize(request.getPassword()));
        request.setPhone(sanitizer.sanitize(request.getPhone()));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        passwordValidator.validate(request.getPassword());

        String hashedPassword = passwordService.hash(request.getPassword());

        // ✅ Récupération de l'entité Roles depuis la BDD au lieu de RoleEnum.CLIENT
        Roles defaultRole = roleRepository.findFirstByName("ROLE_CLIENT")
                .orElseThrow(() -> new EntityNotFoundException("Rôle ROLE_CLIENT introuvable en base de données"));

        Users user = Users.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail().toLowerCase())
                .password(hashedPassword)
                .phone(request.getPhone())
                .birthdate(request.getBirthdate())
                .active(true)
                .createdAt(LocalDateTime.now())
                .registrationDate(LocalDate.now())
                .roles(Set.of(defaultRole)) // ✅ Set<Roles> au lieu de Set<RoleEnum>
                .build();

        userRepository.save(user);

        String tokenHash = UUID.randomUUID().toString();
        ActivationToken token = ActivationToken.builder()
                .tokenHash(tokenHash)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .used(false)
                .user(user)
                .build();
        activationRepository.save(token);

        log.info("Activation token '{}' généré pour user {}", tokenHash, user.getEmail());
        log.info("TODO Email: send activation to {} at http://localhost:8080/api/auth/activate?token={}", user.getEmail(), tokenHash);

        return DtoConverter.toUserResponseDto(user);
    }
}