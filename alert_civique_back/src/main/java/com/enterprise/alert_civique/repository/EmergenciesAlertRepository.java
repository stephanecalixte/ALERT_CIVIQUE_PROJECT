package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.EmergenciesAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;




import java.util.List;

@Repository
public interface EmergenciesAlertRepository extends JpaRepository<EmergenciesAlert, Long> {
    List<EmergenciesAlert> findByEmail(String email);
    List<EmergenciesAlert> findByEmailContaining(String email);
}