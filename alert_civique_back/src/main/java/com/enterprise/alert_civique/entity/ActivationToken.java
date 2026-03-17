package com.enterprise.alert_civique.entity;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;



@Entity
@Table(name="activation_tokens",indexes={
    @Index(name="idx_activation_token_hash",columnList="tokenHash"),
        @Index(name="idx_activation_user",columnList="user_id")
})


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivationToken {
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true,nullable = false,length = 128)
    private String tokenHash;

    @Column(name="expiry_date" ,nullable=false)
    private LocalDateTime expiryDate;
    private boolean used;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private Users user;
}
