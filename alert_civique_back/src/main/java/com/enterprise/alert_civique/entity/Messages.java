package com.enterprise.alert_civique.entity;

import java.time.LocalDateTime;

import com.enterprise.alert_civique.enum1.MessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "messages")
public class Messages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @ManyToOne(optional = true)
    @JoinColumn(name = "report_id", nullable = true)
    private Reports report;

    @ManyToOne(optional = true)
    @JoinColumn(name = "alert_id", nullable = true)
    private EmergenciesAlert emergenciesAlert;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String senderEmail;

    private Boolean isRead = false;

    private LocalDateTime createdAt;
}