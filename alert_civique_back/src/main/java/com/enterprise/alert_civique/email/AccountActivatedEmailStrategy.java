package com.enterprise.alert_civique.email;



import java.util.Map;

import com.enterprise.alert_civique.entity.Users;

public class AccountActivatedEmailStrategy extends AbstractEmailStragy{

    private final String loginUrl;

    public AccountActivatedEmailStrategy(Users user, String loginUrl) {
        super(user);
        this.loginUrl = loginUrl;
    }

    @Override
    public String getSubject() {
        return "Votre compte est maintenant activé";
    }

    @Override
    public Map<String, Object> getContext() {
        return Map.of(
                "firstname", user.getFirstname(),
                "loginUrl", loginUrl
        );
    }
}
