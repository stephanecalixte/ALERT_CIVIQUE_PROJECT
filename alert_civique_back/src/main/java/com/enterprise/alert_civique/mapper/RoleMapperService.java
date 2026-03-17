package com.enterprise.alert_civique.mapper;


import com.enterprise.alert_civique.dto.RoleDTO;
import com.enterprise.alert_civique.entity.Roles;
import org.springframework.stereotype.Service;


@Service
public class RoleMapperService {
    // Entity to DTO
    public RoleDTO toDto(Roles entity){
        if (entity == null) {
            return null;
        }
        return new RoleDTO(
                entity.getRoleId(),
                entity.getName()
                // users removed 
        );
    }


    public Roles toEntity(RoleDTO dto){
        if (dto == null){
            throw new RuntimeException("DTO is null");
        }
        Roles rol =new Roles();
         rol.setRoleId(dto.roleId());
         rol.setName(dto.name());
        return rol;
    }
}

