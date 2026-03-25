package com.enterprise.alert_civique.utils;

import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.enum1.RoleEnum;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class for converting entities to DTOs in AlertCivique project.
 * Adapted from external biblio code.
 */
public final class DtoConverter {

    private DtoConverter() {}

    public static UserResponseDto toUserResponseDto(Users user) {
        if (user == null) return null;

        return UserResponseDto.builder()
                .id(user.getUserId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .birthdate(user.getBirthdate())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .roles(null)  // TODO: implement RoleEnum to Roles mapping
                .build();
    }

    // Add more as needed
}

