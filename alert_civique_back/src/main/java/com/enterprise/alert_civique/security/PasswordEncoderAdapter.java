package com.enterprise.alert_civique.security;

import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncoderAdapter implements PasswordEncoder {

    private final IPasswordService passwordService;

    public PasswordEncoderAdapter(IPasswordService passwordService) {
        this.passwordService = passwordService;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        try {
            return passwordService.hash(rawPassword.toString());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        try {
            return passwordService.matches(rawPassword.toString(), encodedPassword);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
