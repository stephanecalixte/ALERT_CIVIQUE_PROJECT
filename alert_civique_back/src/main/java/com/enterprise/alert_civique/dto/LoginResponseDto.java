package com.enterprise.alert_civique.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponseDto {
    private String token;
    private Long   userId;
    private String email;
    private String firstname;
    private String lastname;
}
