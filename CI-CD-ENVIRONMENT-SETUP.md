# Alert Civique - CI/CD Environment Setup Guide

## Overview
This guide explains how to securely configure the CI/CD environment for Alert Civique using the `docker-compose.ci.yml` file.

## ⚠️ Security Notice
Never commit actual credentials to version control. Use environment variables or external secrets management instead.

---

## Quick Start

### Step 1: Create .env.ci File
```bash
# Copy the template
cp .env.ci.template .env.ci

# Edit with your actual credentials
nano .env.ci  # or use your preferred editor
```

### Step 2: Verify .gitignore
Ensure `.env.ci` is in `.gitignore` to prevent accidental commits:
```bash
grep ".env.ci" alert_civique_back/.gitignore
# Should output: .env.ci
```

### Step 3: Start CI/CD Services
```bash
# Start with environment variables from .env.ci
docker-compose -f docker-compose.ci.yml --env-file .env.ci up -d

# Or with specific credentials
export POSTGRES_USER=sonar
export POSTGRES_PASSWORD=my-secure-password
export SONAR_JDBC_USERNAME=sonar
export SONAR_JDBC_PASSWORD=my-secure-password
docker-compose -f docker-compose.ci.yml up -d
```

### Step 4: Verify Services
```bash
# Check running services
docker ps | grep alert_civique

# Verify SonarQube is accessible
curl http://localhost:9000/api/system/health

# Verify Jenkins is accessible
curl http://localhost:8081
```

---

## Environment Variables

### Required Variables

#### PostgreSQL
| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_USER` | sonar | Database user for SonarQube |
| `POSTGRES_PASSWORD` | sonar | Database password for SonarQube |

#### SonarQube
| Variable | Default | Purpose |
|----------|---------|---------|
| `SONAR_JDBC_USERNAME` | sonar | JDBC username for database connection |
| `SONAR_JDBC_PASSWORD` | sonar | JDBC password for database connection |

### Optional Variables
For running integration tests in CI/CD:
```bash
JWS_SECRET=your-test-secret-key
JWT_SECRET=your-test-secret-key
JWT_ACTIVATION_SECRET=your-base64-encoded-test-secret
```

---

## Security Best Practices

### 1. Local Development (.env.ci)
```bash
# .env.ci (do NOT commit)
POSTGRES_USER=sonar
POSTGRES_PASSWORD=strong-dev-password-here
SONAR_JDBC_USERNAME=sonar
SONAR_JDBC_PASSWORD=strong-dev-password-here
```

### 2. GitHub Actions (if using)
Store credentials as GitHub Secrets:
```bash
Settings → Secrets and variables → Actions → New repository secret

POSTGRES_USER=sonar
POSTGRES_PASSWORD=***
SONAR_JDBC_USERNAME=sonar
SONAR_JDBC_PASSWORD=***
```

Reference in workflow:
```yaml
env:
  POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
  POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
  SONAR_JDBC_USERNAME: ${{ secrets.SONAR_JDBC_USERNAME }}
  SONAR_JDBC_PASSWORD: ${{ secrets.SONAR_JDBC_PASSWORD }}
```

### 3. GitLab CI/CD (if using)
```bash
Settings → CI/CD → Variables

POSTGRES_USER=sonar
POSTGRES_PASSWORD=***
SONAR_JDBC_USERNAME=sonar
SONAR_JDBC_PASSWORD=***
```

Reference in .gitlab-ci.yml:
```yaml
variables:
  POSTGRES_USER: $POSTGRES_USER
  POSTGRES_PASSWORD: $POSTGRES_PASSWORD
```

### 4. Jenkins (if using)
Manage credentials via Jenkins UI:
```
Manage Jenkins → Manage Credentials → System → Global credentials
→ Add Credentials → Username with password
```

Use in Jenkinsfile:
```groovy
withEnv([
  'POSTGRES_USER=${POSTGRES_USER}',
  'POSTGRES_PASSWORD=${POSTGRES_PASSWORD}'
]) {
  sh 'docker-compose -f docker-compose.ci.yml up -d'
}
```

---

## Docker Compose Override (Advanced)

For local testing with custom credentials without modifying docker-compose.ci.yml:

```yaml
# docker-compose.override.yml (do NOT commit - add to .gitignore)
version: '3.9'

services:
  sonarqube:
    environment:
      - SONAR_JDBC_USERNAME=my-custom-user
      - SONAR_JDBC_PASSWORD=my-custom-password

  postgres:
    environment:
      - POSTGRES_USER=my-custom-user
      - POSTGRES_PASSWORD=my-custom-password
```

Then run:
```bash
docker-compose -f docker-compose.ci.yml up -d
```

Docker will automatically merge override settings.

---

## Troubleshooting

### SonarQube Connection Errors
```bash
# Check PostgreSQL is running
docker logs alert_civique_postgres

# Verify password is correct
psql -h localhost -U sonar -d sonarqube

# Check SonarQube logs
docker logs alert_civique_sonarqube
```

### Database Permission Denied
```bash
# Ensure environment variables are set correctly
echo $POSTGRES_PASSWORD

# Restart with correct credentials
docker-compose -f docker-compose.ci.yml down -v
docker-compose -f docker-compose.ci.yml --env-file .env.ci up -d
```

### Port Already in Use
```bash
# Check what's using port 5432, 9000, 8081
lsof -i :5432
lsof -i :9000
lsof -i :8081

# Or use docker-compose override to change ports
```

---

## Advanced: Azure Key Vault Integration

For production environments, consider using Azure Key Vault:

```bash
# Set Key Vault secrets
az keyvault secret set \
  --vault-name your-vault \
  --name postgres-password \
  --value "your-secure-password"

# Retrieve in script
export POSTGRES_PASSWORD=$(az keyvault secret show \
  --vault-name your-vault \
  --name postgres-password \
  --query value -o tsv)

# Start services
docker-compose -f docker-compose.ci.yml up -d
```

---

## Files & Configuration

### Modified Files
- ✅ `docker-compose.ci.yml` - Now uses environment variables
- ✅ `alert_civique_back/.gitignore` - Added .env.ci

### Templates & Examples
- 📄 `.env.ci.template` - Template for environment configuration

### Documentation
- 📖 This file - CI/CD setup guide

---

## Security Checklist

- [ ] .env.ci file created from template
- [ ] .env.ci added to .gitignore locally
- [ ] Credentials changed from defaults
- [ ] docker-compose.ci.yml uses environment variables
- [ ] CI/CD platform (GitHub/GitLab/Jenkins) has secrets configured
- [ ] .gitignore includes .env.ci entry
- [ ] docker-compose.override.yml is in .gitignore
- [ ] Team members notified of changes

---

## Reference

### Docker Compose Environment Variables
- Official docs: https://docs.docker.com/compose/environment-variables/

### SonarQube Security
- Official docs: https://docs.sonarqube.org/latest/setup/security/

### PostgreSQL Security
- Official docs: https://www.postgresql.org/docs/

---

**Last Updated:** April 15, 2026  
**Maintainer:** Alert Civique Security Team
