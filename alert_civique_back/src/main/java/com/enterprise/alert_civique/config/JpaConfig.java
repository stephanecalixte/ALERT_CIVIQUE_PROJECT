package com.enterprise.alert_civique.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.enterprise.alert_civique.repository")
public class JpaConfig {
}
