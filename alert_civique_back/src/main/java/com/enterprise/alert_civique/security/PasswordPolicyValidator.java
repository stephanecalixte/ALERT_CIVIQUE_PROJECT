package com.enterprise.alert_civique.security;

import org.springframework.stereotype.Component;

@Component
public class PasswordPolicyValidator {
    
    public void validate(String password) throws IllegalArgumentException {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Le mot de passe ne peut pas être vide.");
        }
        if (password.length() < 12) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 12 caractères.");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins une lettre majuscule.");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins une lettre minuscule.");
        }
        if (!password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins un chiffre.");
        }
        if (!password.matches(".*[!@#$%^&*()].*")) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()).");
        }
    }
}
