package com.enterprise.alert_civique.security;

// import fr.doranco.biblio.repository.IActivationTokenRepository; // Removed external dep
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Service pour gérer les tokens JWT d'activation des comptes utilisateurs.
 */
@Service
@RequiredArgsConstructor
public class ActivationJwtService {

    @Value("${app.jwt.activation-secret}")
    private String base64Secret;

    @Value("${app.jwt.activation-expiration-ms}")
    private long expirationTimeToken;

    /**
     * Valide le token JWT d'activation et retourne les claims si le token est valide.
     */
    public Claims valideToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJwt(token)
                .getBody();
    }

    /**
     * Génère un token JWT d'activation pour un utilisateur donné (User ID et email).
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateActivationToken(Long userId, String email, String typeToken, long expirationTimeToken) {

        // expirationMs (en milliseconds)
        String token = Jwts.builder()
                .claim("sub", email)
                .claim("uid", userId)
                .claim("type", typeToken)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTimeToken))
                .signWith(getSigningKey())
                .compact();

        System.out.println("Token : " + token);
        return token;
    }

}
