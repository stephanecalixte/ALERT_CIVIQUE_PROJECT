package com.enterprise.alert_civique.repository;


import org.springframework.data.jpa.repository.JpaRepository;


import com.enterprise.alert_civique.entity.ActivationToken;


public interface IActivationRepository extends JpaRepository<ActivationToken ,Long> {
    ActivationToken findByTokenHash(String tokenHash);
}
