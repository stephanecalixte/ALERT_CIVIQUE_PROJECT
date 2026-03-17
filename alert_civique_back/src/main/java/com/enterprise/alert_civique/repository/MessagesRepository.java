package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.Messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessagesRepository extends JpaRepository<Messages,Long> {
}
