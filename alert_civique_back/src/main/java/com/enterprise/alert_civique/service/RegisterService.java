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
public class RegisterService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // ✅ Ajout du RoleRepository
    private final IActivationRepository activationRepository;
    private final IPasswordService passwordService;
    private final InputSanitizer sanitizer;
    private final PasswordPolicyValidator passwordValidator;

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
        Roles defaultRole = roleRepository.findByName("ROLE_CLIENT")
                .orElseThrow(() -> new EntityNotFoundException("Rôle ROLE_CLIENT introuvable en base de données"));

        Users user = Users.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail().toLowerCase())
                .password(hashedPassword)
                .phone(request.getPhone())
                .birthdate(request.getBirthdate())
                .active(false)
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