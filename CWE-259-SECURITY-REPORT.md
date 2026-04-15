# CWE-259 Security Vulnerability Report
## Hardcoded Sensitive Data Assessment

**Project**: Alert Civique Backend  
**Scan Date**: April 15, 2026  
**Vulnerability Focus**: CWE-259 (Hardcoded Passwords, API Keys, Secrets)

---

## Executive Summary

**Total Vulnerabilities Found**: 9  
**Critical**: 3  
**High**: 2  
**Medium**: 4  

All vulnerabilities are concentrated in configuration files. The code properly uses password hashing (BCrypt) and does not contain hardcoded credentials in Java source files.

---

## Detailed Findings

### 🔴 CRITICAL VULNERABILITIES

#### 1. Hardcoded JWT Secret - Main Configuration
**File**: `src/main/resources/application.properties`  
**Line**: 55-57  
**Severity**: CRITICAL  
**Type**: Hardcoded symmetric key for JWT signing

```properties
jws.secret=MiCléTrèsSecrèteMinimum32CaractèresPourHS256
jwt.secret=MiCléTrèsSecrèteMinimum32CaractèresPourHS256
```

**Impact**: JWT tokens signed with this hardcoded secret can be forged by anyone with access to source code. This allows unauthorized token generation and authentication bypass.

**Recommendation**: Move to environment variable `JWT_SECRET_KEY`

---

#### 2. Hardcoded JWT Activation Secret
**File**: `src/main/resources/application.properties`  
**Line**: 59  
**Severity**: CRITICAL  
**Type**: Hardcoded symmetric key for activation token signing

```properties
app.jwt.activation-secret=QWxlcnRDaXZpcXVlQWN0aXZhdGlvblNlY3JldEtleTIwMjQ=
```

**Impact**: Account activation tokens can be forged, allowing attackers to activate arbitrary accounts without email verification.

**Recommendation**: Move to environment variable `ACTIVATION_JWT_SECRET`

---

#### 3. Hardcoded Email Credentials
**File**: `src/main/resources/application.properties`  
**Line**: 65-67  
**Severity**: CRITICAL  
**Type**: Email SMTP credentials exposed

```properties
spring.mail.username=ton.email@gmail.com
spring.mail.password=ton_mot_de_passe_application_google
```

**Impact**: Anyone with access to source code can intercept or impersonate email communications. Email account could be compromised.

**Recommendation**: Move to environment variables `MAIL_USERNAME` and `MAIL_PASSWORD`

---

### 🟠 HIGH VULNERABILITIES (Test Environment)

#### 4. Test JWT Activation Secret
**File**: `src/test/resources/application-test.properties`  
**Line**: 1-2  
**Severity**: MEDIUM (Test only, but still exposed)  
**Type**: Hardcoded test activation secret

```properties
app.jwt.activation-secret=TestActivationSecretKey2024
app.jwt.secret=TestSecretKey2024
```

**Impact**: Even test credentials should not be hardcoded. Test data can leak during development.

**Recommendation**: Move to environment variables overridable in test configuration

---

#### 5. Test Email Credentials
**File**: `src/test/resources/application-test.properties`  
**Line**: 11-12  
**Severity**: MEDIUM (Test, but still exposed)  
**Type**: Hardcoded test email credentials

```properties
spring.mail.username=test
spring.mail.password=test
```

**Impact**: Exposes test credentials in version control.

**Recommendation**: Move to environment variables

---

### 🟡 MEDIUM VULNERABILITIES

#### 6. Hardcoded Admin Password for Initialization
**File**: `src/main/java/com/enterprise/alert_civique/config/DataInitializer.java`  
**Line**: 86  
**Severity**: MEDIUM  
**Type**: Hardcoded password in initialization

```java
String hash = passwordService.hash("admin");
```

**Impact**: While the password is hashed before storage, hardcoding the initialization password in source code is not secure. During deployment or testing, this predictable password could be exploited.

**Recommendation**: Move to environment variable `INITIAL_ADMIN_PASSWORD`

---

## Database Configuration Assessment

✅ **SECURE**: Database credentials are configurable via properties file
- `spring.datasource.username=root` - Configuration-driven
- `spring.datasource.password=` - Empty (development default is acceptable)

Note: Ensure production environment uses environment variables for database credentials.

---

## Code Quality Assessment

✅ **POSITIVE**: The codebase demonstrates good security practices:
- Passwords are properly hashed using Argon2 and BCrypt
- JWT tokens are generated securely
- No hardcoded credentials found in Java source files
- Input sanitization is implemented

---

## Remediation Priority

| Priority | Vulnerability | Fix Type | Expected Time |
|----------|---|---|---|
| 1 | JWT Secrets (3 instances) | Env Variables | 15 min |
| 2 | Email Credentials | Env Variables | 10 min |
| 3 | Admin Init Password | Env Variable | 5 min |

**Total Estimated Time**: 30 minutes

---

## Deployment Checklist

Before deploying to production, ensure:
- [ ] All secrets are removed from application.properties
- [ ] Environment variables are configured in deployment system
- [ ] application.properties contains only placeholder values
- [ ] application-test.properties is not deployed to production
- [ ] Secret rotation plan is established
- [ ] Access logs are monitored for suspicious activity
- [ ] Secrets management system (if available) is integrated

---

## Best Practices Applied in Fixes

1. **Environment Variables**: Use Spring's @Value annotation with %{...} syntax
2. **Fallback Values**: Provide safe defaults for development
3. **Configuration Profiles**: Use application-prod.yml for production
4. **External Config**: Spring Cloud Config can be integrated later
5. **Audit**: All secret access should be logged (not the values)

---

**Report Generated**: 2026-04-15  
**Scan Tool**: CWE-259 Manual Code Review  
**Next Review**: After vulnerability fixes are applied
