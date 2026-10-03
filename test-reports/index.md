---
layout: page
sidebar: false
aside: false
outline: false
title: AeroFTP Test Reports
description: "Public record of AeroFTP integration tests, capability matrices, comparative benchmarks against other clients, and community performance rounds"
---

<div class="test-reports">

# AeroFTP Test Reports

Public record of AeroFTP tests across two distinct workflows: integration / capability runs (does it work, on which provider, with which command) and performance benchmarks (how fast does it work, measured against other clients on the same link or contributed by the community).

## Purpose

- **Operational evidence**: for each area, a matrix showing what works on which provider with which command.
- **Reproducibility**: exact commands and Docker environments documented so anyone can re-run.
- **Transparency**: we publish passing and failing results, the environment and the method, and we say what was left out and why.

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

How fast it works. Two kinds of record: comparative batteries, where AeroFTP and other clients run the same cells on the same link with integrity checks on every download, and community rounds of `aeroftp-cli benchmark` against real provider accounts.

| Document | Scope |
|----------|-------|
| [Comparative battery 2026-10-03](./comparison/2026-10-03) | AeroFTP 4.2.1 against rclone and Cyberduck CLI on SFTP, FTP with TLS, WebDAV and S3, two passes |
| [DAG engine review, September 2026](./dag-review/2026-09) | Before and after measurements of the transfer fixes that shipped in 4.2.0, rclone as the control on every row |
| [Community Benchmark](./community-benchmark/) | Performance rounds contributed by the community through the benchmark issue template |
| [2026-05-07 baseline](./community-benchmark/2026-05-07) | Historical: maintainer reference run on v3.7.3 / v3.7.4, 35 sanitized reports, fixes shipped in 5 commits. Later releases changed several of these numbers |

## Methodology

- [How to reproduce a run](./methodology)
- [Docker harness](./methodology#docker-harness)
- [Comparative benchmarks: pairs, controls, integrity](./methodology#comparative-benchmarks)

</div>
