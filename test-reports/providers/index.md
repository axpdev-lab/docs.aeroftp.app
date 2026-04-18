---
layout: page
sidebar: false
aside: false
outline: false
title: Provider Coverage Matrix
description: AeroFTP provider coverage with Coverage Class and scoring rubric
---

<div class="test-reports">

# Provider Coverage Matrix

AeroFTP classifies each supported provider with a **Coverage Class** (A, B, C, D) and a numeric **score** out of 100. The rubric is deterministic, speed-independent, and designed to reflect the end-to-end experience of running production workloads on AeroFTP + provider.

## Coverage Class

| Class | Label | Score | Meaning |
|-------|-------|-------|---------|
| **A** | Primary | 90-100 | Full matrix green, ready for critical workloads |
| **B** | Extended | 70-89 | Core operations solid, minor gaps on advanced features |
| **C** | Compatible | 50-69 | Base works, known non-blocking limitations |
| **D** | Observer | < 50 | Partially covered, not recommended for production |

## Scoring rubric (100 pt)

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| **Core Operations** | 30 | connect, ls, put, get, stat, mkdir, rm, mv |
| **Data Integrity** | 20 | SHA-256 end-to-end + hashsum parity |
| **Navigation & Discovery** | 15 | tree, find, head, cat, recursive stat |
| **Advanced Features** | 15 | share links, trash/restore, versions, server-side copy, quota detail |
| **Encoding Robustness** | 10 | unicode, spaces, special characters in file names |
| **Reconciliation** | 10 | check, sync-doctor, reconcile post-sync matches |

Speed is deliberately excluded: throughput depends on distance from the provider endpoint and on local network conditions, not on the client implementation.

## Stable Core

The providers below have passed connect / listing / round-trip / integrity checks. Scoring is conservative: gaps on advanced features or on reconciliation reduce the score even when core operations are green.

| Provider | Protocol | Class | Score | Integrity | Navigation | Advanced | Encoding | Reconcile |
|----------|----------|:-----:|:-----:|:---------:|:----------:|:--------:|:--------:|:---------:|
| <img class="provider-logo" src="/icons/providers/Amazon_Web_Services.png" alt=""> [AWS S3](./s3-compatible#aws-s3) | S3 | **B** | 89 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/dropbox.png" alt=""> [Dropbox](./#dropbox) | Dropbox API | **A** | 92 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/YandexDisk.png" alt=""> [Yandex Disk](./#yandex-disk) | Native API | **B** | 89 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/kdrive.png" alt=""> [kDrive](./#kdrive) | Infomaniak API | **A** | 90 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/filelu.png" alt=""> [FileLu API](./#filelu) | Native API | **A** | 90 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/felicloud.png" alt=""> [FeliCloud](./webdav#felicloud) | WebDAV (Nextcloud) | **A** | 90 | ✅ | ✅ | ✅ | ⏳ | ✅ |
| <img class="provider-logo" src="/icons/providers/Koofr.png" alt=""> [Koofr](./webdav#koofr-webdav) | WebDAV | **B** | 88 | ✅ | ✅ | ✅ | ⏳ | ✅ |
| <img class="provider-logo" src="/icons/protocols.svg" alt=""> [SSH MyCloud HD](./#ssh-mycloud) | SFTP (NAS) | **A** | 90 | ✅ | ✅ | ✅ | ✅ | ✅ |
| <img class="provider-logo" src="/icons/providers/backblaze.png" alt=""> [Backblaze B2](./s3-compatible#backblaze-b2) | S3 | **B** | 87 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/storj.png" alt=""> [Storj](./s3-compatible#storj) | S3 Gateway | **B** | 87 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/wasabi.png" alt=""> [Wasabi](./s3-compatible#wasabi) | S3 | **B** | 87 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/cloudfare.png" alt=""> [Cloudflare R2](./s3-compatible#cloudflare-r2) | S3 | **B** | 87 | ✅ | ✅ | ✅ | ⏳ | ⚠️ |
| <img class="provider-logo" src="/icons/providers/infiniCloud.png" alt=""> [InfiniCloud JP](./webdav#infinicloud) | WebDAV | **C** | 68 | ⏳ | ⏳ | ✅ | ⏳ | ✅ |
| <img class="provider-logo" src="/icons/providers/drivehq.png" alt=""> [DriveHQ](./webdav#drivehq) | WebDAV | **C** | 68 | ⏳ | ⏳ | ✅ | ⏳ | ✅ |

Legend: ✅ full pass · ⚠️ partial pass · ⏳ pending benchmark · ❌ fail · — not applicable

### Notes on score dimensions

- **Encoding Robustness** is currently marked ⏳ for live providers: the dimension is fully benchmarked only on Docker runs ([2026-04-18](../docker-matrix/2026-04-18)) so far. Live provider scoring for this dimension is conservative (preliminary value 7/10) until dedicated runs consolidate.
- **Reconciliation ⚠️** on object-storage and cloud APIs means post-sync check requires explicit path configuration; integrity of the transferred data is not affected.
- **InfiniCloud JP** and **DriveHQ** are marked Class C because mini-completion is clean but the full matrix has not yet been covered.

## Detail pages

- [S3-compatible providers](./s3-compatible) — AWS, Backblaze, Storj, Wasabi, Cloudflare R2
- [WebDAV providers](./webdav) — Koofr, FeliCloud, InfiniCloud JP, DriveHQ

## Providers not yet in the public matrix

Several additional providers (pCloud, Filen, Internxt, MEGA, 4shared, Zoho WorkDrive, Drime, FileLu WebDAV) are covered in internal test runs with mixed status. They will enter the public matrix once their scoring stabilizes across the full rubric.

## Update policy

The matrix is revisited after every significant test run consolidation. Scores may change when:

- New rubric dimensions are benchmarked on previously-untested providers (e.g. encoding robustness for live S3)
- Provider-side changes affect an operation class
- Rubric weights are re-balanced (only in major revisions of the methodology)

See [methodology](../methodology) for the reproducibility protocol.

</div>
