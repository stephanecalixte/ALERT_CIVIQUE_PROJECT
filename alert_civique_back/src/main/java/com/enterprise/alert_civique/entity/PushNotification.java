package com.enterprise.alert_civique.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Entity
public class PushNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "push_notification_id")
    private Long pushNotificationId;

    @Column(name = "message")
    private String message;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    // ✅ Relation vers Users
    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;

    // ✅ Relation vers Reports
    @ManyToOne
    @JoinColumn(name = "report_id")
    private Reports report;
}