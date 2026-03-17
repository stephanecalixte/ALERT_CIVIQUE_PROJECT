package com.enterprise.alert_civique.security;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = { PasswordConstraintValidator.class })
public @interface ValidPassword {
    String message() default "Le mot de passe doit comporter au moins 12 caractères, " +"dont au moins une lettre majuscule, une lettre minuscule, " + "un chiffre et un caractère spécial.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
