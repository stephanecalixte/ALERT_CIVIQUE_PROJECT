package com.enterprise.alert_civique.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
Long pushNotificationId;    
Long userId;
Long reportId;
String Message;
LocalDateTime sentAt;
}
