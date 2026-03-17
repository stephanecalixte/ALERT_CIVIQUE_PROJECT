package com.enterprise.alert_civique.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.ReportMessage;

import java.util.Optional;


@Repository
public interface ReportMessageRepository extends JpaRepository<ReportMessage, Long> {


    Optional<ReportMessage> findByUser_UserId(Long userId);
}
