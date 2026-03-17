package com.enterprise.alert_civique.dto;



import java.time.LocalDate;

// Pour les RÉPONSES (GET) - avec l'objet Roles complet
public record UserResponseDTO(
        Long userId,
        String name,
        Long roleId,           
        String email,
        LocalDate registration_date
) {}