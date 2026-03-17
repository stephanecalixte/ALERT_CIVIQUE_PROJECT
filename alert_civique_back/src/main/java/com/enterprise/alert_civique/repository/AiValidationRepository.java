package com.enterprise.alert_civique.repository;

import com.enterprise.alert_civique.entity.AiValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiValidationRepository extends JpaRepository<AiValidation, Long> {

    // rechercher par score
    List<AiValidation> findByScoreGreaterThan(Double score);

    // rechercher par niveau de décision
    List<AiValidation> findByDecisionLevel(String decisionLevel);
}
