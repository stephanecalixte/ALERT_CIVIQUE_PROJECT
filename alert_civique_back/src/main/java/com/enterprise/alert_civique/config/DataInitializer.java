package com.enterprise.alert_civique.config;

import com.enterprise.alert_civique.entity.Roles;
import com.enterprise.alert_civique.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) {
        List<String> roles = List.of("ROLE_CLIENT", "ROLE_ADMIN", "ROLE_MODERATOR");
        for (String roleName : roles) {
            if (!roleRepository.existsByName(roleName)) {
                roleRepository.save(Roles.builder().name(roleName).build());
                log.info("Rôle '{}' créé en base de données", roleName);
            }
        }
    }
}
