package com.enterprise.alert_civique.config;

import com.enterprise.alert_civique.config.jackson.LocalDateTimeDeserializer;
import com.enterprise.alert_civique.config.jackson.LocalDateTimeSerializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class JacksonConfig {

    @Bean
    public SimpleModule alertCiviqueJacksonModule() {
        SimpleModule module = new SimpleModule("AlertCiviqueModule");
        module.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer());
        module.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer());
        return module;
    }
}
