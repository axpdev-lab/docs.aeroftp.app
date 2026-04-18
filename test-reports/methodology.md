---
layout: page
sidebar: false
aside: false
outline: false
title: Test Methodology
description: How AeroFTP integration tests are reproduced
---

<div class="test-reports">

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

## Coverage Class and scoring

The [Provider Coverage Matrix](./providers/) assigns each provider a **Coverage Class** (A, B, C, D) and a numeric score out of 100 derived from a deterministic, speed-independent rubric.

| Class | Label | Score | Meaning |
|-------|-------|-------|---------|
| **A** | Primary | 90-100 | Full matrix green, ready for critical workloads |
| **B** | Extended | 70-89 | Core operations solid, minor gaps on advanced features |
| **C** | Compatible | 50-69 | Base works, known non-blocking limitations |
| **D** | Observer | < 50 | Partially covered, not recommended for production |

Rubric (100 pt total):

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Core Operations | 30 | connect, ls, put, get, stat, mkdir, rm, mv |
| Data Integrity | 20 | SHA-256 end-to-end + hashsum parity |
| Navigation & Discovery | 15 | tree, find, head, cat, recursive stat |
| Advanced Features | 15 | share links, trash/restore, versions, server-side copy, quota |
| Encoding Robustness | 10 | unicode, spaces, special characters in file names |
| Reconciliation | 10 | check, sync-doctor, reconcile post-sync matches |

Throughput is deliberately excluded from scoring: it depends on distance from the provider endpoint and local network conditions, not on the client implementation.

## Matrix conventions

Symbols used in tables:

- ✅ passes completely with verified integrity
- ⚠️ passes with caveat (noted below the table)
- ⏳ pending benchmark (dimension not yet consolidated for this provider)
- ❌ fails
- "-" not applicable / not tested

Matrices are plain HTML tables without custom styling. The `test-reports` section uses a full-width layout to host them even when the grid is dense.

## What this suite is not

This suite is **not**:

- a rigorous performance benchmark (that requires standardized hardware and non-loopback network)
- a security certification (that lives in [Security](/security/))
- an API contract (that lives in [CLI](/cli/overview) and [MCP](/mcp/overview))

It's an operational regression-testing log, published for transparency.

</div>
