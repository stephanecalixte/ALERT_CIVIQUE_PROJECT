package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.dto.UserResponseDTO;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.entity.ActivationToken;
import com.enterprise.alert_civique.enum1.RoleEnum;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.repository.IActivationRepository;
import com.enterprise.alert_civique.security.IPasswordService;
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
    private final IActivationRepository activationRepository;
    private final IPasswordService passwordService;

public UserResponseDTO register(UserRegisterRequestDto request) throws Exception {
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

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        // Hash du mot de passe (validation @ValidPassword déjà faite au controller)
        String hashedPassword = passwordService.hash(request.getPassword());

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
                .roles(Set.of(RoleEnum.CLIENT))
                .build();

        userRepository.save(user);

        // Generate activation token
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

        // Return response matching UserResponseDTO (userId, name, roleId, email, registration_date)
        // Assuming roleId=3 for CLIENT; adjust if Roles table uses ID
        String fullName = user.getFirstname() + " " + user.getLastname();
        LocalDate regDate = user.getRegistrationDate();
        return new UserResponseDTO(user.getUserId(), fullName, 3L, user.getEmail(), regDate);
    }
}
