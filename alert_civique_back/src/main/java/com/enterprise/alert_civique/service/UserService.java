package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.dto.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO createUser(UserCreateDTO dto);
    UserResponseDTO getUserById(Long id);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO updateUser(Long id, UserCreateDTO dto);
    void deleteUser(Long id);
}
