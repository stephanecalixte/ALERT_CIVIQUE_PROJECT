package com.enterprise.alert_civique.email;

import java.util.Map;

public interface IEmailStrategy {

    String getSubject();
    Map<String, Object> getContext();
}
