package com.enterprise.alert_civique.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.enterprise.alert_civique.entity.Users;


public interface UserRepository extends JpaRepository <Users,Long> {

        Optional<Users> findByName(String name);
        boolean existsByEmail(String email);
        Optional<Users> findByEmail(String email);

        @Query("SELECT u FROM Users u LEFT JOIN FETCH u.roles WHERE u.email = :email")
        Optional<Users> findByEmailWithRoles(@Param("email") String email);
}
