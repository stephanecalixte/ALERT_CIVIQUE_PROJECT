package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.LoginRequestDTO;
import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.service.RegisterService;
import com.enterprise.alert_civique.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RegisterService registerService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, RegisterService registerService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.registerService = registerService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(), 
                            loginRequest.getPassword()
                    )
            );

            String token = jwtService.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok(token);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nom d'utilisateur ou mot de passe incorrect.");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Utilisateur désactivé.");
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Compte verrouillé.");
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Erreur d'authentification.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRegisterRequestDto request) {
        try {
            UserResponseDto response = registerService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
