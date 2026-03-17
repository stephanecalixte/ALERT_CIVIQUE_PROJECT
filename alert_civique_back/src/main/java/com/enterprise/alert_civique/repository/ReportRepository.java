package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.enum1.DecisionLevel;
import com.enterprise.alert_civique.enum1.ReportsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.alert_civique.entity.Reports;

import java.util.List;

@Repository
public interface ReportRepository  extends JpaRepository<Reports,Long>{
    List<Reports> findByUserId(Long userId);
    List<Reports> findByStatus(ReportsStatus status);
    List<Reports> findByPriority(DecisionLevel priority);
    List<Reports> findByUserIdAndStatus(Long userId, ReportsStatus status);

}
