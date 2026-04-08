package com.enterprise.alert_civique.security;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class Argon2PasswordService implements IPasswordService {

    private final Argon2PasswordEncoder encoder;

    /**
     * Paramètres recommandés pour Argon2id (production 2026) :
     * Si on veut un encodage plus fort (avec un serveur puissant) :
     * - memory = 131072 (128MB)
     * - iterations = 4
     */
    public Argon2PasswordService() {
        this.encoder = new Argon2PasswordEncoder(
                16,     // salt length
                32,     // hash length
                1,      // parallelism
                65536,  // memory (64 MB)
                3       // iterations
        );
    }

    @Override
    public String hash(String rawPassword) throws Exception {
        return encoder.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String hashedPassword) throws Exception {
        return encoder.matches(rawPassword, hashedPassword);
    }
}
