package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.UserCreateDTO;
import com.enterprise.alert_civique.dto.UserResponseDto;

import java.util.List;

public interface UserService {
    UserResponseDto createUser(UserCreateDTO dto);
    UserResponseDto getUserById(Long id);
    List<UserResponseDto> getAllUsers();
    UserResponseDto updateUser(Long id, UserCreateDTO dto);
    void deleteUser(Long id);
}
