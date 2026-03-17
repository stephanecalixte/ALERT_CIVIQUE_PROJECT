package com.enterprise.alert_civique.dto;


import java.time.LocalDate;

public record UserCreateDTO(
        String name,
        Long roleId,          // ✅ Long pour l'ID
        String email,
        String password,      // ✅ Le mot de passe
        LocalDate registration_date

) {






}
