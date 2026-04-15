# CWE-321 Vulnerability Remediation Report

## Executive Summary
**Severity:** HIGH  
**Vulnerability Type:** CWE-321 (Use of Hard-coded Cryptographic Key)  
**Status:** IN PROGRESS  
**Date:** April 15, 2026

## Vulnerabilities Identified

### 1. Hard-coded JWT Secrets (CRITICAL)
- **Location:** `alert_civique_back/src/main/resources/application.properties` (Lines 62-63)
- **Issue:** 
  - `jws.secret=MiCléTrèsSecrèteMinimum32CaractèresPourHS256`
  - `jwt.secret=MiCléTrèsSecrèteMinimum32CaractèresPourHS256`
- **Impact:** Anyone with source code access can forge JWT tokens
- **Severity:** CRITICAL

### 2. Hard-coded Activation Secret (CRITICAL)
- **Location:** `alert_civique_back/src/main/resources/application.properties` (Line 64)
- **Issue:** `app.jwt.activation-secret=QWxlcnRDaXZpcXVlQWN0aXZhdGlvblNlY3JldEtleTIwMjQ=`
- **Impact:** Account activation tokens can be forged
- **Severity:** CRITICAL

### 3. Hard-coded Mail Credentials (HIGH)
- **Location:** `alert_civique_back/src/main/resources/application.properties` (Lines 76-77)
- **Issue:** 
  - `spring.mail.username=ton.email@gmail.com`
  - `spring.mail.password=ton_mot_de_passe_application_google`
- **Impact:** Email account compromise, unauthorized mail sending
- **Severity:** HIGH

### 4. Test File Secrets (MEDIUM)
- **Location:** `alert_civique_back/src/test/resources/application.properties`
- **Issue:** Same hard-coded secrets in test configuration
- **Impact:** Secrets exposed during testing
- **Severity:** MEDIUM

## Remediation Strategy

### Phase 1: Environment Variable Migration
- [ ] Replace `jws.secret` with `${JWS_SECRET:}` (fallback to environment)
- [ ] Replace `jwt.secret` with `${JWT_SECRET:}`
- [ ] Replace `app.jwt.activation-secret` with `${JWT_ACTIVATION_SECRET:}`
- [ ] Replace email credentials with `${MAIL_USERNAME:}` and `${MAIL_PASSWORD:}`

### Phase 2: Configuration Management
- [ ] Update test application.properties with sanitized values
- [ ] Create application-local.properties.template 
- [ ] Add application-local.properties to .gitignore
- [ ] Document environment variable setup

### Phase 3: Validation
- [ ] Verify application starts with environment variables
- [ ] Run unit tests with environment variables
- [ ] Build project successfully
- [ ] Verify no secrets in compiled artifacts

## Remediation Progress
- [ ] Task 1: Version Control Setup
- [ ] Task 2: .gitignore Configuration
- [ ] Task 3-5: Secret Replacement
- [ ] Task 6-7: Documentation
- [ ] Task 8-9: Validation & Report

## Recommended Actions
1. Set environment variables immediately after this fix
2. Rotate all cryptographic keys and secrets
3. Audit application logs for token forgery attempts
4. Implement secret management system (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
