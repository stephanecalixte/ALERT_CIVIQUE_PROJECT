package com.enterprise.alert_civique.repository;

import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;


import com.enterprise.alert_civique.entity.Users;


public interface UserRepository extends JpaRepository <Users,Long> {

          // Recherche par name à la place de username
        //   boolean existingByEmail(String email);
        Optional<Users> findByName(String name);
        boolean existsByEmail(String email);  
        Optional<Users> findByEmail(String email);
}
