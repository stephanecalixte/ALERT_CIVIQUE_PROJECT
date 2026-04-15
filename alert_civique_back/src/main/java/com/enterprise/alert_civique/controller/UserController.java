package com.enterprise.alert_civique.controller;

import java.util.List;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.dto.UserResponseDto;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.mapper.UserMapperService;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@CrossOrigin
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final UserMapperService userMapperService;
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getUsers() {
        try {
            log.info("Retrieving all users");
            List<UserResponseDto> users = userRepository.findAll()
                    .stream()
                    .map(userMapperService::toResponseDto)
                    .toList();
            log.info("Successfully retrieved {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error retrieving users", e);
            throw e;
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            log.info("Retrieving user with ID: {}", userId);
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with UserId: " + userId));
            log.info("Successfully retrieved user: {} (email: {})", userId, user.getEmail());
            return ResponseEntity.ok(userMapperService.toResponseDto(user));
        } catch (RuntimeException e) {
            log.warn("User not found - ID: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error retrieving user with ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreateDTO userCreateDto) {
        try {
            log.info("Creating new user with role ID: {}", userCreateDto.roleId());
            Roles role = roleRepository.findById(userCreateDto.roleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + userCreateDto.roleId()));

String hashedPassword = null; 
Users user = userMapperService.toEntity(userCreateDto, hashedPassword);
            Users savedUser = userRepository.save(user);
            
            log.info("User created successfully - ID: {}, Email: {}", savedUser.getUserId(), savedUser.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(userMapperService.toResponseDto(savedUser));
        } catch (RuntimeException e) {
            log.warn("Failed to create user - {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UserCreateDTO userCreateDto) {
        try {
            log.info("Updating user with ID: {}", userId);
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));

            Roles role = null;
            if (userCreateDto.roleId() != null) {
                role = roleRepository.findById(userCreateDto.roleId())
                        .orElseThrow(() -> new RuntimeException("Role not found with id: " + userCreateDto.roleId()));
            }

userMapperService.updateEntity(user, userCreateDto, null);
            Users updatedUser = userRepository.save(user);
            
            log.info("User updated successfully - ID: {}, Email: {}", updatedUser.getUserId(), updatedUser.getEmail());
            return ResponseEntity.ok(userMapperService.toResponseDto(updatedUser));
        } catch (RuntimeException e) {
            log.warn("Failed to update user with ID: {} - {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error updating user with ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            log.info("Attempting to delete user with ID: {}", userId);
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));

            userRepository.delete(user);
            log.warn("User deleted - ID: {}, Email: {}", userId, user.getEmail());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("Failed to delete user with ID: {} - {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deleting user with ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }
}