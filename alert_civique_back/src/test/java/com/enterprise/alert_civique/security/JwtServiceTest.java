package com.enterprise.alert_civique.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour JwtService
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("JwtService Unit Tests")
public class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private String testUsername;

    @BeforeEach
    public void setUp() {
        testUsername = "testuser@example.com";
    }

    @Test
    @DisplayName("Devrait générer un token JWT valide")
    public void testGenerateToken_Success() {
        // Act
        String token = jwtService.generateToken(testUsername);

        // Assert
        assertNotNull(token, "Le token ne doit pas être null");
        assertFalse(token.isEmpty(), "Le token ne doit pas être vide");
        assertTrue(token.split("\\.").length == 3, "Le token JWT doit avoir 3 parties séparées par des points");
    }

    @Test
    @DisplayName("Devrait extraire le username du token JWT")
    public void testExtractUsername_Success() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        String extractedUsername = jwtService.extractUsername(token);

        // Assert
        assertEquals(testUsername, extractedUsername, "Le username extrait doit correspondre au username initial");
    }

    @Test
    @DisplayName("Devrait valider un token JWT valide")
    public void testIsTokenValid_ValidToken() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        boolean isValid = jwtService.isTokenValid(token);

        // Assert
        assertTrue(isValid, "Le token valide devrait être reconnu comme valide");
    }

    @Test
    @DisplayName("Devrait rejeter un token JWT invalide")
    public void testIsTokenValid_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.jwt.token";

        // Act
        boolean isValid = jwtService.isTokenValid(invalidToken);

        // Assert
        assertFalse(isValid, "Un token invalide devrait être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un token vide")
    public void testIsTokenValid_EmptyToken() {
        // Arrange
        String emptyToken = "";

        // Act
        boolean isValid = jwtService.isTokenValid(emptyToken);

        // Assert
        assertFalse(isValid, "Un token vide devrait être rejeté");
    }

    @Test
    @DisplayName("Devrait rejeter un token null")
    public void testIsTokenValid_NullToken() {
        // Act & Assert
        assertFalse(jwtService.isTokenValid(null), "UN token null devrait être rejeté");
    }

    @Test
    @DisplayName("Devrait reporter une exception pour username null")
    public void testGenerateToken_NullUsername() {
        // Act & Assert
        assertThrows(Exception.class, () -> jwtService.generateToken(null),
                "La génération de token should throw an exception pour username null");
    }

    @Test
    @DisplayName("Devrait générer différents tokens pour le même username")
    public void testGenerateToken_DifferentTokensForSameUsername() {
        // Act
        String token1 = jwtService.generateToken(testUsername);
        String token2 = jwtService.generateToken(testUsername);

        // Assert
        assertNotEquals(token1, token2, "Les tokens générés à différents moments doivent être différents (timestamps différents)");
    }

    @Test
    @DisplayName("Devrait extraire le même username de tokens différents du même user")
    public void testExtractUsername_SameUsernameFromDifferentTokens() {
        // Act
        String token1 = jwtService.generateToken(testUsername);
        String token2 = jwtService.generateToken(testUsername);
        String username1 = jwtService.extractUsername(token1);
        String username2 = jwtService.extractUsername(token2);

        // Assert
        assertEquals(username1, username2, "Le username extrait doit être le même");
        assertEquals(testUsername, username1, "Le username extrait doit correspondre à l'original");
    }

    @Test
    @DisplayName("Devrait valider un token nouvellement généré")
    public void testIsTokenValid_NewlyGeneratedToken() {
        // Arrange
        String token = jwtService.generateToken(testUsername);

        // Act
        boolean isValid = jwtService.isTokenValid(token);

        // Assert
        assertTrue(isValid, "Un token nouvellement généré doit être valide");
    }

    @Test
    @DisplayName("Devrait rejeter un token avec caractères manquants")
    public void testIsTokenValid_IncompleteToken() {
        // Arrange
        String incompleteToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

        // Act
        boolean isValid = jwtService.isTokenValid(incompleteToken);

        // Assert
        assertFalse(isValid, "Un token incomplet devrait être rejeté");
    }
}
