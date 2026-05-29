# GitHub Actions — Guía de Secrets y Variables

Este documento lista todos los **Secrets** y **Variables** que debes configurar en GitHub para que los workflows de CI/CD funcionen correctamente.

## Cómo añadir Secrets en GitHub

```
Repositorio → Settings → Secrets and variables → Actions → New repository secret
```

---

## 🔐 Secrets requeridos

### Supabase

| Nombre | Descripción | Dónde encontrarlo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) | Supabase → Project Settings → API |
| `SUPABASE_JWT_SECRET` | JWT Secret del proyecto | Supabase → Project Settings → API |

### Aplicación

| Nombre | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | URL pública de producción | `https://crosti.es` |
| `RESEND_API_KEY` | API Key de Resend para emails | `re_...` |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob Storage | `vercel_blob_rw_...` |

### Deploy SSH (solo para CD)

| Nombre | Descripción | Ejemplo |
|---|---|---|
| `DEPLOY_HOST` | IP o dominio del servidor | `123.456.78.90` |
| `DEPLOY_USER` | Usuario SSH del servidor | `ubuntu` |
| `DEPLOY_SSH_KEY` | Clave privada SSH (contenido completo) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PORT` | Puerto SSH (opcional, default 22) | `22` |
| `DEPLOY_PATH` | Ruta en el servidor donde está el proyecto | `/home/ubuntu/crosti` |

---

## 📋 Checklist de configuración inicial

```
[ ] Añadir NEXT_PUBLIC_SUPABASE_URL
[ ] Añadir NEXT_PUBLIC_SUPABASE_ANON_KEY
[ ] Añadir SUPABASE_SERVICE_ROLE_KEY
[ ] Añadir SUPABASE_JWT_SECRET
[ ] Añadir NEXT_PUBLIC_APP_URL
[ ] Añadir RESEND_API_KEY
[ ] Añadir BLOB_READ_WRITE_TOKEN
[ ] Añadir DEPLOY_HOST (para CD)
[ ] Añadir DEPLOY_USER (para CD)
[ ] Añadir DEPLOY_SSH_KEY (para CD)
[ ] Añadir DEPLOY_PATH (para CD)
[ ] Configurar el environment "production" en Settings → Environments
```

---

## 🌍 GitHub Environments

Crea un entorno llamado `production` en:
```
Settings → Environments → New environment → production
```

Configura **Protection rules**:
- ✅ Required reviewers (añade al menos 1 reviewer para aprobar deploys)
- ✅ Wait timer: 5 minutos (tiempo de gracia antes de desplegar)

---

## 🔑 Generar el par de claves SSH para deploy

```bash
# En tu máquina local:
ssh-keygen -t ed25519 -C "github-actions@crosti" -f ~/.ssh/crosti_deploy

# Copiar la clave PÚBLICA al servidor:
ssh-copy-id -i ~/.ssh/crosti_deploy.pub usuario@tu-servidor.com

# El contenido de la clave PRIVADA (crosti_deploy) va en el secret DEPLOY_SSH_KEY
cat ~/.ssh/crosti_deploy
```

---

## 📁 Estructura de workflows

```
.github/
└── workflows/
    ├── ci.yml        → Lint + TypeCheck + Jest + Build (push/PR a main y develop)
    ├── e2e.yml       → Playwright E2E + Newman/Postman (push/PR a main)
    ├── cd.yml        → Docker build → Deploy SSH → Smoke tests (push a main)
    └── security.yml  → Audit + CodeQL + Trivy + Gitleaks (semanal + PR)
```

## 🔄 Flujo completo

```
Push a main
    │
    ├─► CI (ci.yml)
    │   ├── Lint & TypeCheck
    │   ├── Jest Unit Tests (+ coverage artifact)
    │   └── Next.js Build
    │
    ├─► E2E (e2e.yml) [en paralelo]
    │   ├── Playwright E2E tests
    │   └── Newman API tests
    │
    └─► CD (cd.yml) [después de CI]
        ├── Build Docker image → push a GHCR
        ├── Deploy vía SSH al servidor
        ├── Health check automático
        └── Smoke tests post-deploy

Push a develop / feature/*
    │
    └─► CI (ci.yml) únicamente
```
