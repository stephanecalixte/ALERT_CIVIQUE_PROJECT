package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.RoleDTO;


import java.util.List;
import java.util.Optional;

public interface RoleService {

    RoleDTO createRole(RoleDTO roleDTO);
    List<RoleDTO> getAllRoles();
    Optional<RoleDTO> getRoleById(Long roleId);
    RoleDTO updateRole(Long roleId, RoleDTO roleDTO);
    void deleteRole(Long roleId);

}
