package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.enum1.DecisionLevel;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.Reports;

import java.util.List;

@Repository
public interface ReportRepository  extends JpaRepository<Reports,Long>{
  
    // Sans double underscore — Spring Data résout automatiquement
    List<Reports> findByUserUserId(Long userId);

    List<Reports> findByStatus(ReportsStatus status);

    List<Reports> findByPriority(DecisionLevel priority);

    @Query("SELECT r FROM Reports r WHERE r.user.userId = :userId AND r.status = :status")
    List<Reports> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ReportsStatus status);
}

