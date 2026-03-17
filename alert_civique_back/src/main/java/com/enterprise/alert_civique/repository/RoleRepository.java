package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.Roles;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Roles,Long> {
     Optional<Roles> findByName(String name);
}
