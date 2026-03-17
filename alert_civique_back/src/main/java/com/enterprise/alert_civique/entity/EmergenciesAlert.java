package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "emergencies_alert")
public class EmergenciesAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emergencies_alert_id")
    private Long emergenciesAlertId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @OneToMany(mappedBy = "emergenciesAlert")
    private List<Messages> messages;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }


}
