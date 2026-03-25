package com.enterprise.alert_civique.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {


    @Bean
    public IPasswordService passwordService() {
        // Utilisation d'Argon2Id pour un hachage plus sécurisé
        return new Argon2PasswordService();
        // Si on préfère BCrypt : return new BCryptPasswordService(12);
    }

    @Bean(name="customPasswordEncoder")
    public PasswordEncoder passwordEncoder(IPasswordService passwordService) {
        return new PasswordEncoderAdapter(passwordService);
    }

}
