---
layout: page
sidebar: false
aside: false
outline: false
title: Test Methodology
description: How AeroFTP integration tests are reproduced
---

<div class="test-suite">

# Test Methodology

## Principles

1. **Reproducible before report**: a test that can't be re-run doesn't enter the public record
2. **External ground truth**: for each protocol we also verify with a third-party client (`curl`, `mc`, `ssh`, `openssl`) to distinguish AeroFTP regressions from server misconfig
3. **Integrity check**: every heavy upload/download is verified with SHA-256
4. **Exit code first**: every command must terminate with the correct exit code; textual output is secondary

## Docker harness

Full local environment, containers exposed on localhost:

| Service | Host port | Protocol | Credentials |
|---------|-----------|----------|-------------|
| `aeroftp-test-ftps` | 2121 | FTP (vsftpd) | `ftpuser` / `password123` |
| `aeroftp-test-sftp` | 2223 | SFTP (OpenSSH) | `user_key` with key, `user_pwd` with password |
| `aeroftp-test-webdav` | 8080 | WebDAV (bytemark/webdav) | `webdavuser` / `password123` |
| `aeroftp-test-minio` | 9000 / 9001 | S3 (MinIO) | `admin` / `password123` |

Quick start:

```bash
docker compose up -d
```

### Initial S3 bucket

```bash
mc alias set test http://127.0.0.1:9000 admin password123
mc mb --ignore-existing test/aeroftp-test
```

## Matrix conventions

Symbols used in tables:

- ✅ passes completely with verified integrity
- ⚠️ passes with caveat (noted below the table)
- ❌ fails
- "-" not applicable / not tested

Matrices are plain HTML tables without custom styling. The `test-suite` section uses a full-width layout to host them even when the grid is dense.

## What this suite is not

This suite is **not**:

- a rigorous performance benchmark (that requires standardized hardware and non-loopback network)
- a security certification (that lives in [Security](/security/))
- an API contract (that lives in [CLI](/cli/overview) and [MCP](/mcp/overview))

It's an operational regression-testing log, published for transparency.

</div>
