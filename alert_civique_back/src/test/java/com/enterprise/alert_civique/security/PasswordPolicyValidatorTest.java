package com.enterprise.alert_civique.security;

import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour PasswordPolicyValidator
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("PasswordPolicyValidator Unit Tests")
public class PasswordPolicyValidatorTest {

    @Autowired
    private PasswordPolicyValidator passwordValidator;

    @BeforeEach
    public void setUp() {
        assertNotNull(passwordValidator, "PasswordPolicyValidator ne doit pas être null");
    }

    @Test
    @DisplayName("Devrait accepter un mot de passe valide")
    public void testValidatePassword_ValidPassword() {
        // Arrange
        String validPassword = "SecurePassword123!";

        // Act & Assert - no exception should be thrown
        assertDoesNotThrow(() -> passwordValidator.validate(validPassword),
                "Un mot de passe valide ne doit pas lever d'exception");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe trop court")
    public void testValidatePassword_TooShort() {
        // Arrange
        String shortPassword = "Short1!";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(shortPassword),
                "Un mot de passe trop court doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe sans majuscule")
    public void testValidatePassword_NoUppercase() {
        // Arrange
        String noUppercasePassword = "password123!";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(noUppercasePassword),
                "Un mot de passe sans majuscule doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe sans minuscule")
    public void testValidatePassword_NoLowercase() {
        // Arrange
        String noLowercasePassword = "PASSWORD123!";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(noLowercasePassword),
                "Un mot de passe sans minuscule doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe sans chiffre")
    public void testValidatePassword_NoDigit() {
        // Arrange
        String noDigitPassword = "SecurePassword!";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(noDigitPassword),
                "Un mot de passe sans chiffre doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe sans caractère spécial")
    public void testValidatePassword_NoSpecialCharacter() {
        // Arrange
        String noSpecialCharPassword = "SecurePassword123";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(noSpecialCharPassword),
                "Un mot de passe sans caractère spécial doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe vide")
    public void testValidatePassword_EmptyPassword() {
        // Arrange
        String emptyPassword = "";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(emptyPassword),
                "Un mot de passe vide doit être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe null")
    public void testValidatePassword_NullPassword() {
        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(null),
                "Un mot de passe null doit être rejeté");
    }

    @Test
    @DisplayName("Devrait accepter un mot de passe long et complexe")
    public void testValidatePassword_LongComplexPassword() {
        // Arrange
        String complexPassword = "VeryLongSecurePassword123!@#$%^&*()";

        // Act & Assert
        assertDoesNotThrow(() -> passwordValidator.validate(complexPassword),
                "Un mot de passe long et complexe doit être accepté");
    }

    @Test
    @DisplayName("Devrait accepter un mot de passe avec plusieurs caractères spéciaux")
    public void testValidatePassword_MultipleSpecialCharacters() {
        // Arrange
        String passwordWithMultipleSpecialChars = "SecurePass123!@#";

        // Act & Assert
        assertDoesNotThrow(() -> passwordValidator.validate(passwordWithMultipleSpecialChars),
                "Un mot de passe avec plusieurs caractères spéciaux doit être accepté");
    }

    @Test
    @DisplayName("Devrait rejeter un mot de passe avec espaces")
    public void testValidatePassword_WithSpaces() {
        // Arrange
        String passwordWithSpaces = "Secure Pass 123!";

        // Act & Assert
        assertThrows(Exception.class, () -> passwordValidator.validate(passwordWithSpaces),
                "Un mot de passe avec espaces doit être rejeté");
    }
}
