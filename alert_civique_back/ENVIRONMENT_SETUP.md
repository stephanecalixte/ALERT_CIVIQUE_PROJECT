# ============================================================
# ⚠️  ENVIRONMENT VARIABLES SETUP GUIDE - CWE-321 REMEDIATION
# ============================================================
#
# This guide explains how to set up required environment 
# variables for the Alert Civique application.
#
# SECURITY: Hard-coded cryptographic keys (CWE-321) have been
# replaced with environment variable references.
# ============================================================

## 🔐 REQUIRED ENVIRONMENT VARIABLES

### 1. JWT Secrets (CRITICAL)
```
JWS_SECRET=your-strong-random-key-minimum-32-chars
JWT_SECRET=your-strong-random-key-minimum-32-chars
JWT_ACTIVATION_SECRET=your-base64-encoded-secret-key
```

**How to generate strong keys:**

#### Option A: Linux/Mac (openssl)
```bash
# Generate a base64 random key (32 bytes)
openssl rand -base64 32

# Save to environment
export JWS_SECRET=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_ACTIVATION_SECRET=$(openssl rand -base64 32)
```

#### Option B: Windows PowerShell
```powershell
$randomBytes = -join ((0..31) | ForEach-Object {[char]((Get-Random -Minimum 33 -Maximum 126))})
$base64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($randomBytes))
$env:JWS_SECRET = $base64
$env:JWT_SECRET = $base64
$env:JWT_ACTIVATION_SECRET = $base64
```

#### Option C: Online tool (not recommended for production)
- https://www.uuidgenerator.net/
- Create a base64 string of sufficient length

### 2. Mail Configuration (HIGH PRIORITY)
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

**For Gmail:**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" 
4. Use the 16-character password provided

**For other email providers:**
- Use application/app-specific passwords, not your main password
- Enable SMTP if required

---

## 🚀 SETTING ENVIRONMENT VARIABLES

### Linux/Mac (Bash)
```bash
# Method 1: Temporary (session only)
export JWS_SECRET="your-secret-here"
export JWT_SECRET="your-secret-here"
export JWT_ACTIVATION_SECRET="your-secret-here"
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-app-password"

# Method 2: Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export JWS_SECRET="your-secret-here"' >> ~/.bashrc
source ~/.bashrc

# Method 3: .env file (with direnv)
# Create .env file in project root with variables above
# Install direnv: https://direnv.net/
# echo "direnv allow" in project directory
```

### Windows (PowerShell)
```powershell
# Method 1: Temporary (session only)
$env:JWS_SECRET = "your-secret-here"
$env:JWT_SECRET = "your-secret-here"
$env:JWT_ACTIVATION_SECRET = "your-secret-here"
$env:MAIL_USERNAME = "your-email@gmail.com"
$env:MAIL_PASSWORD = "your-app-password"

# Method 2: Permanent (System Environment Variables)
[System.Environment]::SetEnvironmentVariable("JWS_SECRET", "your-secret-here", "User")
[System.Environment]::SetEnvironmentVariable("JWT_SECRET", "your-secret-here", "User")
# Restart PowerShell for changes to take effect

# Method 3: Using setx (CMD)
setx JWS_SECRET "your-secret-here"
setx JWT_SECRET "your-secret-here"
# Restart system for changes to take effect
```

### Windows (Command Prompt)
```cmd
:: Set in current session
set JWS_SECRET=your-secret-here
set JWT_SECRET=your-secret-here
set JWT_ACTIVATION_SECRET=your-secret-here
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-app-password

:: Set permanently (requires admin)
setx JWS_SECRET "your-secret-here"
setx JWT_SECRET "your-secret-here"
:: Note: Restart required for setx changes
```

### Docker/Container Deployment
```dockerfile
FROM openjdk:21-slim
# ... 
ENV JWS_SECRET=change-me-in-production
ENV JWT_SECRET=change-me-in-production
ENV JWT_ACTIVATION_SECRET=change-me-in-production
ENV MAIL_USERNAME=your-email@gmail.com
ENV MAIL_PASSWORD=your-app-password

CMD ["java", "-jar", "alert-civique.jar"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    image: alert-civique:latest
    environment:
      JWS_SECRET: ${JWS_SECRET}
      JWT_SECRET: ${JWT_SECRET}
      JWT_ACTIVATION_SECRET: ${JWT_ACTIVATION_SECRET}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
```

### CI/CD (GitHub Actions)
```yaml
env:
  JWS_SECRET: \${{ secrets.JWS_SECRET }}
  JWT_SECRET: \${{ secrets.JWT_SECRET }}
  JWT_ACTIVATION_SECRET: \${{ secrets.JWT_ACTIVATION_SECRET }}
  MAIL_USERNAME: \${{ secrets.MAIL_USERNAME }}
  MAIL_PASSWORD: \${{ secrets.MAIL_PASSWORD }}
```

---

## ✅ VERIFICATION

After setting environment variables, verify they're accessible:

### Linux/Mac
```bash
echo $JWS_SECRET
echo $JWT_SECRET
echo $JWT_ACTIVATION_SECRET
printenv | grep -E 'JWS_SECRET|JWT_SECRET|MAIL_'
```

### Windows PowerShell
```powershell
$env:JWS_SECRET
$env:JWT_SECRET
$env:JWT_ACTIVATION_SECRET
Get-ChildItem env: | Where-Object {$_.Name -match 'JWS_SECRET|JWT_SECRET|MAIL_'}
```

### Java Application
```bash
# Start application with debug
java -Xmx512m -Xms256m \
  -DJWS_SECRET=$JWS_SECRET \
  -DJWT_SECRET=$JWT_SECRET \
  -jar alert-civique*.jar

# Or use Maven
export JWS_SECRET=...
export JWT_SECRET=...
mvn spring-boot:run
```

---

## 🔍 TROUBLESHOOTING

### Error: "Property 'jws.secret' with value '${JWS_SECRET}' does not exist"
**Solution:** Environment variable not set. Ensure:
1. Variable is exported (not just set)
2. Application is restarted after setting variable
3. Spelling matches exactly (case-sensitive on Linux/Mac)

### Error: "No such property: JWS_SECRET"
**Solution:** Check variable is in correct scope:
```bash
# Verify it's set
echo $JWS_SECRET

# If empty, set it
export JWS_SECRET=$(openssl rand -base64 32)

# Then start application
java -jar alert-civique.jar
```

### Application starts but JWT validation fails
**Solution:** Ensure all three secrets are set:
```bash
# Verify all are set
env | grep -E 'JWS|JWT|MAIL'
```

---

## 📋 PRODUCTION CHECKLIST

- [ ] Generate new strong cryptographic keys (never reuse test keys)
- [ ] Set all environment variables in production environment
- [ ] Remove any .properties files containing secrets from deployment
- [ ] Rotate secrets every 90 days
- [ ] Monitor for unauthorized token generation attempts
- [ ] Enable audit logging in production
- [ ] Use secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- [ ] Document secret rotation procedure
- [ ] Train team on security policies

---

## 🆘 EMERGENCY PROCEDURES

If secrets are exposed:
1. **IMMEDIATELY rotate all cryptographic keys**
2. Invalidate all issued JWT tokens
3. Force users to re-authenticate
4. Audit all token usage in application logs
5. Implement rate limiting on auth endpoints
6. Review security logs for unauthorized access

