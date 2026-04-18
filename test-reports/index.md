---
layout: page
sidebar: false
aside: false
outline: false
title: AeroFTP Test Reports
description: Public record of AeroFTP integration test runs and capability matrices
---

<div class="test-reports">

# AeroFTP Test Reports

Public record of AeroFTP tests: protocol integration, AeroAgent capabilities, provider matrix. Every run is reproducible, every environment documented.

## Purpose

- **Operational evidence**: for each area, a matrix showing what works, on which provider, with which command
- **Reproducibility**: exact commands and Docker environments documented so anyone can re-run
- **Transparency**: we publish the results of tests that pass, the environments, and the methodologies

This section is not user-facing documentation. For usage guides see [Getting Started](/getting-started/installation).

## Sections

### Protocols & providers

| Document | Scope |
|----------|-------|
| [Provider Coverage Matrix](./providers/) | Coverage Class and score for supported providers |
| [S3-compatible providers](./providers/s3-compatible) | AWS, Backblaze, Storj, Wasabi, Cloudflare R2 |
| [WebDAV providers](./providers/webdav) | Koofr, FeliCloud, InfiniCloud JP, DriveHQ |
| [Docker matrix 2026-04-18](./docker-matrix/2026-04-18) | FTP, SFTP, WebDAV, S3/MinIO on local containers |

### AeroAgent

| Document | Scope |
|----------|-------|
| [Capability matrix](./aeroagent/capability-matrix) | 25 AeroAgent capabilities tested with Gemini and Cohere |

### Methodology

- [How to reproduce a run](./methodology)
- [Docker harness](./methodology#docker-harness)

</div>
