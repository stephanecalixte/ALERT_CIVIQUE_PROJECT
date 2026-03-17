package com.enterprise.alert_civique.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

@Configuration
public class PasswordConfig {

    @Bean
    public IPasswordService passwordService() {
        // Fallback to BCrypt since Argon2 missing
        return new IPasswordServiceImpl();
    }

}
