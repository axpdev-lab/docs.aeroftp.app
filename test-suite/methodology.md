---
layout: page
sidebar: false
aside: false
outline: false
title: Test Methodology
description: How AeroFTP integration tests are reproduced
---

<div class="test-suite">

# Metodologia di test

## Principi

1. **Reproducible before report**: un test che non si può rieseguire non entra nel record pubblico
2. **Ground truth esterna**: per ogni protocollo verifichiamo anche con un client terzo (`curl`, `mc`, `ssh`, `openssl`) per distinguere regressioni AeroFTP da misconfig server
3. **Integrity check**: ogni upload/download pesante viene verificato con SHA-256
4. **Exit code first**: ogni comando deve terminare con exit code corretto; l'output testuale è secondario

## Docker harness

Ambiente locale completo, containers esposti su localhost:

| Servizio | Porta host | Protocollo | Credenziali |
|----------|-----------|------------|-------------|
| `aeroftp-test-ftps` | 2121 | FTP (vsftpd) | `ftpuser` / `password123` |
| `aeroftp-test-sftp` | 2223 | SFTP (OpenSSH) | `user_key` con key, `user_pwd` con password |
| `aeroftp-test-webdav` | 8080 | WebDAV (bytemark/webdav) | `webdavuser` / `password123` |
| `aeroftp-test-minio` | 9000 / 9001 | S3 (MinIO) | `admin` / `password123` |

Start rapido:

```bash
docker compose up -d
```

### Bucket S3 iniziale

```bash
mc alias set test http://127.0.0.1:9000 admin password123
mc mb --ignore-existing test/aeroftp-test
```

## Convenzioni per le matrici

Simboli nelle tabelle:

- ✅ passa completo con integrità verificata
- ⚠️ passa con caveat (nota in nota a piè di tabella)
- ❌ fallisce
- — non applicabile / non testato

Le matrici sono HTML table senza styling custom. La sezione `test-suite` usa un layout a tutta larghezza per ospitarle anche quando la griglia è fitta.

## Cosa non è questa suite

Questa suite **non** è:

- un benchmark performance rigoroso (per quello servono hardware standardizzato e rete non-loopback)
- una certificazione di sicurezza (quella è in [Security](/security/))
- un API contract (quello è in [CLI](/cli/overview) e [MCP](/mcp/overview))

È un log operativo di regression testing, pubblicato per trasparenza.

</div>
