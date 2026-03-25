package com.enterprise.alert_civique.security;


import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Component
public class SecureTokenService {

    public String generateToken() {
        // Générer un token sécurisé (ex: UUID, JWT, etc.)
        return java.util.UUID.randomUUID().toString() + UUID.randomUUID().toString();
    }

    public String hashToken(String token) {
        // Implémenter une méthode de hachage sécurisée (ex: SHA-256)
        try {
            //return DigestUtils.sha256Hex(token);
            //ou on fait à la main pour éviter la dépendance à Apache Commons Codec :
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);

        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
