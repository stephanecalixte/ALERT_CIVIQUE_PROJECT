package com.enterprise.alert_civique.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Implémentation de IPasswordService utilisant BCrypt pour le hachage des mots de passe.
 * BCrypt est un algorithme de hachage adaptatif qui intègre un facteur de travail (strength)
 * pour rendre les attaques par force brute plus difficiles.
 * Cette classe utilise BCryptPasswordEncoder de Spring Security pour effectuer le hachage et la vérification des mots de passe.
 * Le constructeur prend un paramètre de force (strength) qui détermine le coût du hachage. Un strength plus élevé rend le hachage plus sécurisé mais plus lent.
 * Par défaut, un strength de 12 est recommandé pour un bon équilibre entre sécurité et performance
 */
public class BCryptPasswordService implements IPasswordService {

    private final BCryptPasswordEncoder encoder;

    /**
     * Paramètre recommandé : new BCryptPasswordService(12)
     * => (12 = bon équilibre sécurité/performance)
     */
    public BCryptPasswordService(int strength) {
        this.encoder = new BCryptPasswordEncoder(strength);
    }

    @Override
    public String hash(String rawPassword) throws Exception {
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String hashedPassword) throws Exception {
        return encoder.matches(hashedPassword, rawPassword);
    }
}
