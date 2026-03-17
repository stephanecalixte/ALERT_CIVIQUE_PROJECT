package com.enterprise.alert_civique.dto;

import java.time.LocalDate;
import java.util.Set;





public record UserDto(
    Long   userId,
    String name,
    Long roleId,
    String email,
    Set<RoleDTO>roles,
    LocalDate registration_date
) {






}
