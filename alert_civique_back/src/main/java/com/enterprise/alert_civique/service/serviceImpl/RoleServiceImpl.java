package com.enterprise.alert_civique.service.serviceImpl;

import com.enterprise.alert_civique.dto.RoleDTO;
import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.mapper.RoleMapperService;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.service.RoleService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoleServiceImpl implements RoleService {

    private RoleMapperService roleMapperService;
    private RoleRepository roleRepository;

    public RoleServiceImpl (
            RoleMapperService roleMapperService,
            RoleRepository roleRepository
    ){
        this.roleMapperService= roleMapperService;
        this.roleRepository=roleRepository;
    }

    @Override
    public RoleDTO createRole(RoleDTO roleDTO) {

        if (roleDTO == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }

        if (roleDTO.roleId() != null) {
            throw new IllegalArgumentException("Un nouveau rôle ne doit pas avoir d'ID");
        }
         
    roleRepository.findFirstByName(roleDTO.name())
        .ifPresent(r -> { 
            throw new RuntimeException("Un rôle avec le nom '" + roleDTO.name() + "' existe déjà"); 
        });

        Roles role = roleMapperService.toEntity(roleDTO);

        Roles saved = roleRepository.save(role);

        return roleMapperService.toDto(saved);
    }


    @Override
    public List<RoleDTO> getAllRoles() {

        return roleRepository.findAll()
                .stream()
                .map(roleMapperService::toDto)
                .toList();
    }


    @Override
    public Optional<RoleDTO> getRoleById(Long roleId) {

        if (roleId == null) {
            throw new IllegalArgumentException("L'id ne peut pas être null");
        }

        Roles role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Role non trouvé avec id : " + roleId));

        return Optional.ofNullable(roleMapperService.toDto(role));
    }


    @Override
    public RoleDTO updateRole(Long roleId, RoleDTO roleDTO) {

        if (roleDTO == null) {
            throw new IllegalArgumentException("Le DTO ne peut pas être null");
        }

        Roles existingRole = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Role non trouvé avec id : " + roleId));

        if (roleDTO.name() != null) {
            existingRole.setName(roleDTO.name());
        }

        Roles saved = roleRepository.save(existingRole);

        return roleMapperService.toDto(saved);
    }


    @Override
    public void deleteRole(Long roleId) {

        if (!roleRepository.existsById(roleId)) {
            throw new IllegalArgumentException("Role non trouvé avec id : " + roleId);
        }

        roleRepository.deleteById(roleId);
    }

}
