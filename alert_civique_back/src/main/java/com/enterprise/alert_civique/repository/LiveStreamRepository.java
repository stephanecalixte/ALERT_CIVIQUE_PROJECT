package com.enterprise.alert_civique.repository;


import com.enterprise.alert_civique.entity.LiveStream;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveStreamRepository extends JpaRepository<LiveStream,Long> {
}
