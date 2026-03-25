package com.enterprise.alert_civique.email;



import java.util.Map;

import com.enterprise.alert_civique.entity.Users;

public class AccountCreatedEmailStrategy extends AbstractEmailStragy {

    private final String activationUrl;
    public AccountCreatedEmailStrategy(Users user, String activationUrl) {
        super(user);
        this.activationUrl = activationUrl;
    }

    @Override
    public String getSubject() {
        return "Confirmez votre inscription";
    }

    @Override
    public Map<String, Object> getContext() {
        return Map.of(
                "firstname", user.getFirstname(),
                "activationUrl", activationUrl
        );
    }
}
