package com.enterprise.alert_civique.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.enterprise.alert_civique.security.ValidPassword;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class LoginDto {

    @NotBlank
    @Size(min = 6, max = 48)
    @Email(message = "L'email doit être une adresse électronique syntaxiquement correcte")
    private String email;

    @NotBlank
    @ValidPassword
    private String password;
}
