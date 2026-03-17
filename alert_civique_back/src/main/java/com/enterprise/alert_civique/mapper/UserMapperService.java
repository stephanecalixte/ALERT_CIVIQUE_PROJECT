package com.enterprise.alert_civique.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.dto.UserResponseDTO;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;

@Service
public class UserMapperService {

    // Conversion entité -> DTO de réponse (SANS mot de passe)
    public UserResponseDTO toResponseDto(Users user) {
        if (user == null) {
            return null;
        }

        return new UserResponseDTO(
                user.getUserId(),
                user.getName(),
                null,  // No single role; uses Set<RoleEnum>
                user.getEmail(),
                user.getRegistrationDate()
        );
    }

    // Conversion DTO de création -> entité (AVEC mot de passe hashé)
    public Users toEntity(UserCreateDTO dto, String hashedPassword) {
        if (dto == null) {
            return null;
        }

        Users user = new Users();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setPassword(hashedPassword);

        // Gestion de la date d'inscription
        if (dto.registration_date() != null) {
            user.setRegistrationDate(dto.registration_date());
        } else {
            user.setRegistrationDate(LocalDate.now());
        }

        return user;
    }

    // Méthode utilitaire pour mettre à jour une entité existante
    public void updateEntity(Users user, UserCreateDTO dto, String hashedPassword) {
        if (dto == null) {
            return;
        }

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.email() != null) {
            user.setEmail(dto.email());
        }

        if (hashedPassword != null) {
            user.setPassword(hashedPassword);
        }

        if (dto.registration_date() != null) {
            user.setRegistrationDate(dto.registration_date());
        }
    }

}