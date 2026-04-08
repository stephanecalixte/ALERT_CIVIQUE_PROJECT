package com.enterprise.alert_civique.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.TrustedContact;

@Repository
public interface TrustedcontactRepository extends JpaRepository<TrustedContact, Long> {

    List<TrustedContact> findByUserId(Long userId);

}
