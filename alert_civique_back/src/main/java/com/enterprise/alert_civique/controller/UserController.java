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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final UserMapperService userMapperService;
    private final RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getUsers() {
        List<UserResponseDto> users = userRepository.findAll()
                .stream()
                .map(userMapperService::toResponseDto)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with UserId: " + userId));
            return ResponseEntity.ok(userMapperService.toResponseDto(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreateDTO userCreateDto) {
        try {
            Roles role = roleRepository.findById(userCreateDto.roleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + userCreateDto.roleId()));

String hashedPassword = null; 
Users user = userMapperService.toEntity(userCreateDto, hashedPassword);
            Users savedUser = userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(userMapperService.toResponseDto(savedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody UserCreateDTO userCreateDto) {
        try {
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));

            Roles role = null;
            if (userCreateDto.roleId() != null) {
                role = roleRepository.findById(userCreateDto.roleId())
                        .orElseThrow(() -> new RuntimeException("Role not found with id: " + userCreateDto.roleId()));
            }

userMapperService.updateEntity(user, userCreateDto, null);
            Users updatedUser = userRepository.save(user);

            return ResponseEntity.ok(userMapperService.toResponseDto(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));

            userRepository.delete(user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur serveur : " + e.getMessage());
        }
    }
}