package com.enterprise.alert_civique.controller;

import com.enterprise.alert_civique.dto.LoginRequestDTO;
import com.enterprise.alert_civique.dto.LoginResponseDto;
import com.enterprise.alert_civique.dto.UserRegisterRequestDto;
import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.service.RegisterService;
import com.enterprise.alert_civique.security.JwtService;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RegisterService registerService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          RegisterService registerService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.registerService = registerService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            String username = loginRequest.getUsername();
            log.info("Authentication attempt for user: {}", username);
            
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            username,
                            loginRequest.getPassword()
                    )
            );

            log.info("Authentication successful for user: {}", username);
            
            String token = jwtService.generateToken(username);

            Users user = userRepository.findByEmailWithRoles(username)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            boolean isAdmin = user.getRoles() != null &&
                    user.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r.getName()));

            log.info("JWT token generated for user: {} (isAdmin: {})", username, isAdmin);
            
            LoginResponseDto response = LoginResponseDto.builder()
                    .token(token)
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .firstname(user.getFirstname())
                    .lastname(user.getLastname())
                    .isAdmin(isAdmin)
                    .build();

            log.info("Login successful for user: {} (userId: {})", username, user.getUserId());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt - Invalid credentials for user: {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nom d'utilisateur ou mot de passe incorrect.");
        } catch (DisabledException e) {
            log.warn("Failed login attempt - User disabled: {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Utilisateur désactivé.");
        } catch (LockedException e) {
            log.warn("Failed login attempt - User account locked: {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Compte verrouillé.");
        } catch (AuthenticationException e) {
            log.warn("Authentication exception for user: {} - {}", loginRequest.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Erreur d'authentification.");
        } catch (Exception e) {
            log.error("Unexpected error during login attempt for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur serveur.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRegisterRequestDto request) {
        try {
            log.info("Registration attempt for email: {}", request.getEmail());
            UserResponseDto response = registerService.register(request);
            log.info("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Unexpected error during registration for email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
