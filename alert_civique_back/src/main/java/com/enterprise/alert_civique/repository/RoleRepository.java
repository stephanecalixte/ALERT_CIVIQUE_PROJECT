package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.Roles;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Roles,Long> {
     boolean existsByName(String name);
     Optional<Roles> findFirstByName(String name);
}
