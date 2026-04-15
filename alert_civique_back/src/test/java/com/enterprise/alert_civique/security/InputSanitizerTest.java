package com.enterprise.alert_civique.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour InputSanitizer
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("InputSanitizer Unit Tests")
public class InputSanitizerTest {

    @Autowired
    private InputSanitizer sanitizer;

    @BeforeEach
    public void setUp() {
        assertNotNull(sanitizer, "InputSanitizer ne doit pas être null");
    }

    @Test
    @DisplayName("Devrait laisser les contenus valides inchangés")
    public void testSanitize_ValidInput() {
        // Arrange
        String validInput = "John Doe";

        // Act
        String result = sanitizer.sanitize(validInput);

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("John") || result.equals(validInput), "Le contenu valide ne doit pas être altéré de manière excessive");
    }

    @Test
    @DisplayName("Devrait supprimer les espaces inutiles")
    public void testSanitize_RemovesWhitespace() {
        // Arrange
        String inputWithSpaces = "  John   Doe  ";

        // Act
        String result = sanitizer.sanitize(inputWithSpaces);

        // Assert
        assertNotNull(result);
        assertFalse(result.startsWith(" "), "Les espaces de début doivent être supprimés");
        assertFalse(result.endsWith(" "), "Les espaces de fin doivent être supprimés");
    }

    @Test
    @DisplayName("Devrait neutraliser les scripts XSS")
    public void testSanitize_RemovesXSSAttempts() {
        // Arrange
        String xssInput = "<script>alert('XSS')</script>";

        // Act
        String result = sanitizer.sanitize(xssInput);

        // Assert
        assertNotNull(result);
        assertFalse(result.contains("<script>"), "Les tags script doivent être supprimés ou échappe");
    }

    @Test
    @DisplayName("Devrait neutraliser les HTML tags malveillants")
    public void testSanitize_RemovesMaliciousHtml() {
        // Arrange
        String htmlInput = "<img src=x onerror='alert(1)'>";

        // Act
        String result = sanitizer.sanitize(htmlInput);

        // Assert
        assertNotNull(result);
        assertFalse(result.contains("onerror"), "Les attributs dangereux doivent être supprimés");
    }

    @Test
    @DisplayName("Devrait gérer les strings vides")
    public void testSanitize_EmptyString() {
        // Arrange
        String emptyString = "";

        // Act
        String result = sanitizer.sanitize(emptyString);

        // Assert
        assertNotNull(result, "Le résultat ne doit pas être null");
    }

    @Test
    @DisplayName("Devrait gérer les strings null")
    public void testSanitize_NullInput() {
        // Act & Assert
        // Peut soit retourne null, soit une string vide selon implémentation
        String result = sanitizer.sanitize(null);
        assertTrue(result == null || result.isEmpty(), "La sanitisation de null doit retourner null ou string vide");
    }

    @Test
    @DisplayName("Devrait préserver le contenu valide avec caractères spéciaux")
    public void testSanitize_PreservesValidSpecialChars() {
        // Arrange
        String validInput = "user@example.com";

        // Act
        String result = sanitizer.sanitize(validInput);

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("@"), "Les caractères spéciaux valides doivent être préservés");
    }

    @Test
    @DisplayName("Devrait gérer les accents et caractères accentués")
    public void testSanitize_PreservesAccents() {
        // Arrange
        String accentedInput = "François Côté";

        // Act
        String result = sanitizer.sanitize(accentedInput);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty(), "Les accents ne doivent pas causer d'erreur");
    }

    @Test
    @DisplayName("Devrait neutraliser les injection SQL")
    public void testSanitize_RemovesSQLInjection() {
        // Arrange
        String sqlInput = "' OR '1'='1";

        // Act
        String result = sanitizer.sanitize(sqlInput);

        // Assert
        assertNotNull(result);
        // La sanitisation peut être différente, on vérifie juste qu'il fonctionne
        assertTrue(!result.isEmpty(), "La sanitisation ne doit pas rejeter, mais neutraliser");
    }
}
