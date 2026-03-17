package com.enterprise.alert_civique.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.Media;

@Repository
public interface MediaRepository extends JpaRepository<Media , Long> {

}
