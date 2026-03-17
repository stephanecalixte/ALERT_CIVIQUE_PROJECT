package com.enterprise.alert_civique.entity;


import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="report_message")
public class ReportMessage {
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long reportMessageId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable=false)
    private Users user; 


    @ManyToOne
    @JoinColumn(name = "message_id", nullable=false)
    private Messages messages;

    @ManyToOne
    @JoinColumn(name = "report_id", nullable=false)
    private Reports report;



    @Column(name = "reason", nullable = false)
    private String reason;

    @Column (name="created_at", nullable=false)
    private String createdAt=LocalDate.now().toString();

}
