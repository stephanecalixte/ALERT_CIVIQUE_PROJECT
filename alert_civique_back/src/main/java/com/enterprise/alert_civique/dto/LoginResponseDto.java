package com.enterprise.alert_civique.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponseDto {
    private String  token;
    private Long    userId;
    private String  email;
    private String  firstname;
    private String  lastname;

    @JsonProperty("isAdmin")
    private boolean isAdmin;
}
