package com.enterprise.alert_civique.dto;

import com.enterprise.alert_civique.security.ValidPassword;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @ToString @NoArgsConstructor @AllArgsConstructor @Builder
public class UserRegisterRequestDto {

    @NotBlank
    @Size(min = 2, max = 48)
    @Pattern(regexp = "^[A-Za-z]")
    private String firstname;

    @NotBlank
    @Size(min = 2, max = 48)
    private String lastname;

    @NotBlank
    @Size(min = 6, max = 48)
    @Email(message = "L'email doit être une adresse électronique syntaxiquement correcte")
    private String email;

    @NotBlank
    @Size(min = 12, max = 48)
    @ValidPassword
    private String password;

    @NotBlank
    @Pattern(regexp = "^[0-9+ ]{8,20}$", message = "Le numéro de téléphone doit comporter entre 8 et 20 chiffres, espaces ou signes plus")
    private String phone;

    @Past(message="La date de naissance doit être antérieur à la date du jour")
    private LocalDate birthdate;
}
