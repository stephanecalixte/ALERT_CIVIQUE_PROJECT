package com.enterprise.alert_civique.dto;



import java.time.LocalDate;

import com.enterprise.alert_civique.entity.Roles;
// Pour les RÉPONSES (GET) - avec l'objet Roles complet
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.*;


import java.time.LocalDateTime;
import java.util.Set;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor
@Builder
public class UserResponseDto {

    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate birthdate;
    private Boolean active;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    private Set<Roles> roles;


}