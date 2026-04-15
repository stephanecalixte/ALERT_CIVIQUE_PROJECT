package com.enterprise.alert_civique;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Classe de base pour tous les tests
 * Configure le profil de test et les paramètres généraux
 */
@SpringBootTest
@ActiveProfiles("test")
public class BaseTest {

    @BeforeEach
    public void setUp() {
        // Initialisation commune pour tous les tests
    }
}
