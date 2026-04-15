package com.enterprise.alert_civique.config;

import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.entity.Users;
import com.enterprise.alert_civique.repository.RoleRepository;
import com.enterprise.alert_civique.repository.UserRepository;
import com.enterprise.alert_civique.security.IPasswordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final IPasswordService passwordService;

    @Value("${app.init.admin-password:admin}")
    private String initialAdminPassword;

    @PersistenceContext
    private EntityManager entityManager;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           IPasswordService passwordService) {
        this.roleRepository  = roleRepository;
        this.userRepository  = userRepository;
        this.passwordService = passwordService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {

        // ── 0. S'assurer que message_id est nullable (peut être NOT NULL si table créée avant le patch) ──
        try {
            entityManager.createNativeQuery(
                "ALTER TABLE report_message MODIFY COLUMN message_id BIGINT NULL"
            ).executeUpdate();
            log.info("Colonne report_message.message_id rendue nullable.");
        } catch (Exception e) {
            log.debug("ALTER TABLE report_message ignoré : {}", e.getMessage());
        }

        // ── 1. Initialiser les rôles ──────────────────────────────────────────
        for (String roleName : List.of("ROLE_CLIENT", "ROLE_ADMIN", "ROLE_MODERATOR")) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(Roles.builder().name(roleName).build());
                log.info("Rôle '{}' créé.", roleName);
            }
        }

        // ── 2. Recréer les users seulement si les comptes par défaut n'existent pas déjà
        boolean adminExists = userRepository.existsByEmail("stephanecalixte@gmail.com");
        if (adminExists) {
            log.info("Utilisateurs déjà présents — initialisation ignorée.");
            return;
        }

        // Nettoyer uniquement les tables users (pas les alertes/reports !)
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM user_roles").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM trusted_contact").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM history").executeUpdate();
        entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
        entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();
        entityManager.flush();
        log.info("Tables utilisateurs nettoyées.");

        // ── 3. Récupérer les rôles ────────────────────────────────────────────
        Roles roleAdmin  = roleRepository.findFirstByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN introuvable"));
        Roles roleClient = roleRepository.findFirstByName("ROLE_CLIENT")
                .orElseThrow(() -> new RuntimeException("ROLE_CLIENT introuvable"));

        String hash = passwordService.hash("admin");

        // ── 4. Créer l'administrateur ─────────────────────────────────────────
        Users admin = Users.builder()
                .firstname("Stéphane")
                .lastname("Calixte")
                .name("stephanecalixte")
                .email("stephanecalixte@gmail.com")
                .phone("0758968407")
                .password(hash)
                .active(true)
                .registrationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .roles(new HashSet<>(Set.of(roleAdmin)))
                .build();
        admin = userRepository.save(admin);
        log.info("Admin créé  → id={}, email={}, hash={}", admin.getUserId(), admin.getEmail(), hash.substring(0, 20) + "...");

        // ── 5. Créer l'utilisateur de confiance ───────────────────────────────
        Users trusted = Users.builder()
                .firstname("Personne")
                .lastname("Confiance")
                .name("personneconfiance")
                .email("confiance@stephanecalixte.fr")
                .phone("0758968407")
                .password(hash)
                .active(true)
                .registrationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .roles(new HashSet<>(Set.of(roleClient)))
                .build();
        trusted = userRepository.save(trusted);
        log.info("Utilisateur de confiance créé → id={}, email={}", trusted.getUserId(), trusted.getEmail());

        log.info("=== Initialisation terminée : 2 utilisateurs créés ===");
    }
}
