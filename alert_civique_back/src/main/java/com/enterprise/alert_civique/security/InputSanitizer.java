package com.enterprise.alert_civique.security;

import org.owasp.encoder.Encode;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    public String sanitize(String input){
        if (input == null) {
            return null;
        }
        return Encode.forHtml(input.trim());
    }

}
