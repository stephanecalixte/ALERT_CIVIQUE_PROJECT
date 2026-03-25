package com.enterprise.alert_civique.service.serviceImpl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.enterprise.alert_civique.dto.UserResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.mapper.UserMapperService;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.service.UserService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapperService userMapperService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDto createUser(UserCreateDTO dto) {

        // ✅ On récupère directement l'entité Roles, plus besoin de RoleEnum
        Roles role = roleRepository.findById(dto.roleId())
                .orElseThrow(() -> new EntityNotFoundException("Rôle non trouvé avec l'id : " + dto.roleId()));

        String hashedPassword = passwordEncoder.encode(dto.password());

        Users user = userMapperService.toEntity(dto, hashedPassword);

        // ✅ Set<Roles> au lieu de Set<RoleEnum>
        user.setRoles(Set.of(role));

        Users savedUser = userRepository.save(user);
        return userMapperService.toResponseDto(savedUser);
    }

    @Override
    public UserResponseDto getUserById(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec l'id : " + userId));
        return userMapperService.toResponseDto(user);
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapperService::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto updateUser(Long userId, UserCreateDTO dto) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable avec l'id : " + userId));

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.email() != null) {
            user.setEmail(dto.email());
        }

        if (dto.password() != null && !dto.password().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(dto.password());
            user.setPassword(hashedPassword);
        }

        // ✅ Set<Roles> au lieu de Set<RoleEnum>
        if (dto.roleId() != null) {
            Roles role = roleRepository.findById(dto.roleId())
                    .orElseThrow(() -> new EntityNotFoundException("Rôle non trouvé avec l'id : " + dto.roleId()));
            user.setRoles(Set.of(role));
        }

        if (dto.registration_date() != null) {
            user.setRegistrationDate(dto.registration_date());
        }

        Users updatedUser = userRepository.save(user);
        return userMapperService.toResponseDto(updatedUser);
    }

    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Impossible de supprimer : utilisateur inexistant avec l'id : " + userId);
        }
        userRepository.deleteById(userId);
    }
}