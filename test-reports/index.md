---
layout: page
sidebar: false
aside: false
outline: false
title: AeroFTP Test Reports
description: Public record of AeroFTP integration tests, capability matrices, and community performance benchmarks
---

<div class="test-reports">

# AeroFTP Test Reports

Public record of AeroFTP tests across two distinct workflows: integration / capability runs (does it work, on which provider, with which command) and community performance benchmarks (how fast does it work, with statistical aggregates).

## Purpose

- **Operational evidence**: for each area, a matrix showing what works on which provider with which command.
- **Reproducibility**: exact commands and Docker environments documented so anyone can re-run.
- **Transparency**: we publish every passing test, every environment, and every methodology.

This section is not user-facing documentation. For usage guides see [Getting Started](/getting-started/installation).

## Capability and integration

Binary checks: a feature works on a provider, or it does not. Driven by Docker harnesses and provider-by-provider matrices.

| Document | Scope |
|----------|-------|
| [Provider Coverage Matrix](./providers/) | Coverage class and score for supported providers |
| [S3-compatible providers](./providers/s3-compatible) | AWS, Backblaze, Storj, Wasabi, Cloudflare R2 |
| [WebDAV providers](./providers/webdav) | Koofr, FeliCloud, InfiniCloud JP, DriveHQ |
| [Docker matrix 2026-04-18](./docker-matrix/2026-04-18) | FTP, SFTP, WebDAV, S3/MinIO on local containers |
| [AeroAgent capability matrix](./aeroagent/capability-matrix) | 25 AeroAgent capabilities tested with Gemini and Cohere |

## Performance and benchmarks

Statistical numbers: how many Mbps, what p50, p95, latency. Driven by `aeroftp-cli benchmark` runs against real provider accounts, sanitized JSON reports submitted by the community.

| Document | Scope |
|----------|-------|
| [Community Benchmark](./community-benchmark/) | Performance rounds, contributed by the community via [issue #177](https://github.com/axpdev-lab/aeroftp/issues/177) |
| [2026-05-07 baseline](./community-benchmark/2026-05-07) | Maintainer reference run, 35 sanitized reports, 5 fixes shipped |

## Methodology

- [How to reproduce a run](./methodology)
- [Docker harness](./methodology#docker-harness)

</div>
