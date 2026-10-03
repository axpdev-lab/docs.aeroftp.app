---
layout: page
sidebar: false
aside: false
outline: false
title: Test Methodology
description: "How AeroFTP integration tests and comparative benchmarks are run and reproduced"
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">Methodology</span></li>
</ul>

# Test Methodology

## Principles

1. **Reproducible before report**: a test that can't be re-run doesn't enter the public record
2. **External ground truth**: for each protocol we also verify with a third-party client (`curl`, `mc`, `ssh`, `openssl`) to distinguish AeroFTP regressions from server misconfig
3. **Integrity check**: every heavy upload/download is verified with SHA-256
4. **Exit code first**: every command must terminate with the correct exit code; textual output is secondary

## Docker harness

Full local environment, containers exposed on localhost only. The files are published in the docs repository under [`public/test-reports/docker-harness`](https://github.com/axpdev-lab/docs.aeroftp.app/tree/main/public/test-reports/docker-harness): the compose file, the SFTP image and `setup.sh`, which generates the SSH test keys on your machine. No key is committed, and the credentials below are for these local containers only.

| Service | Host port | Protocol | Credentials |
|---------|-----------|----------|-------------|
| `aeroftp-test-ftps` | 2121 | FTP (vsftpd) | `ftpuser` / `password123` |
| `aeroftp-test-sftp` | 2223 | SFTP (OpenSSH) | `user_key` with key, `user_pwd` with password, `user_mixed` with key and password |
| `aeroftp-test-webdav` | 8080 | WebDAV (bytemark/webdav) | `webdavuser` / `password123` |
| `aeroftp-test-minio` | 9000 / 9001 | S3 (MinIO) | `admin` / `password123` |

Quick start, from the `docker-harness` directory:

```bash
./setup.sh
docker compose up -d --build
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

## Comparative benchmarks

The [DAG engine review](./dag-review/2026-09) and the [comparative battery](./comparison/2026-10-03) measure AeroFTP against other clients on the same link. They follow these rules:

1. **The same cell, the same window.** Each tool runs the same payload against the same server back to back, with the other tools in the same operation. The tool order is reversed between passes, so a drift over time does not always land on the same tool.
2. **A control on every row.** rclone runs every cell. When AeroFTP moves between two builds and rclone does not, the change belongs to the build; when both move, it belongs to the link or the station.
3. **Integrity before speed.** Every download is compared with the source by SHA-256, file by file for trees. A timing without that check is not published: a failed or truncated transfer can look fast. Exit codes are recorded but not trusted alone, since a client can exit 0 after a partial transfer.
4. **Pairs, not single numbers.** Rows show each run or the spread. A single run is labelled as one run. The noise floor is measured per target and per tool, using the tool that does not change between arms.
5. **Ratios, not absolute speed.** Ratios are the other tool's seconds over AeroFTP's seconds. The link is the bottleneck for every tool, so a ratio travels better than a throughput figure.
6. **Pinned binaries.** Each AeroFTP build is named by commit and sha256, and checked by probing its behaviour, not by the directory it came from. The versions of the other tools are recorded with each session.
7. **One configuration source.** The rclone and Cyberduck configurations are exported from the same AeroFTP vault with `aeroftp-cli export rclone` and `aeroftp-cli export cyberduck`, so every tool talks to the same endpoint with the same credentials and TLS mode.
8. **Asymmetric cells are labelled or dropped.** TLS against cleartext, different stream counts or different payloads make a row incomparable; such rows carry the clause or are left out.
9. **Anomalies are repeated before they are reported.** A finding that does not survive repetition with the control is left out, and the page says what was left out and why.

What these measurements do not establish: a ranking of clients in general. They describe one station, one link and one set of servers.

The comparative harness itself is a maintainer script bound to the lab profiles and is not published. The rules above, the commands listed on each page and `aeroftp-cli export` are enough to rebuild an equivalent battery against your own servers.

## What this suite is not

This suite is **not**:

- a rigorous performance benchmark across networks (the comparative pages above measure one link, with the method described in [Comparative benchmarks](#comparative-benchmarks))
- a security certification (that lives in [Security](/security/overview))
- an API contract (that lives in [CLI](/cli/commands) and [MCP](/mcp/overview))

It's an operational regression-testing log, published for transparency.

</div>
