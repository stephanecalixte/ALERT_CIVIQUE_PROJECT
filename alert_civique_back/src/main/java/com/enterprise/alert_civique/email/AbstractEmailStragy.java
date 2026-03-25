
package com.enterprise.alert_civique.email;

import com.enterprise.alert_civique.entity.Users;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public abstract class AbstractEmailStragy implements IEmailStrategy {
    protected final Users user;
}
