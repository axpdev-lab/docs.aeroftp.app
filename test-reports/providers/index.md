---
layout: page
sidebar: false
aside: false
outline: false
title: Provider Coverage Matrix
description: AeroFTP provider coverage with Coverage Class and scoring rubric
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">Providers</span></li>
</ul>

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

Scores below reflect a full encoding sweep completed 2026-04-18 on live accounts for each provider, with SHA-256 end-to-end verification on 1 MB round-trip.

| Provider | Protocol | Class | Score | Integrity | Navigation | Advanced | Encoding | Reconcile |
|----------|----------|:-----:|:-----:|:---------:|:----------:|:--------:|:--------:|:---------:|
| <img class="provider-logo" src="/icons/providers/dropbox.png" alt=""> [Dropbox](./#dropbox) | Dropbox API | **A** | 95 | ✅ | ✅ | ✅ | ✅ 10/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/kdrive.png" alt=""> [kDrive](./#kdrive) | Infomaniak API | **A** | 93 | ✅ | ✅ | ✅ | ✅ 10/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/YandexDisk.png" alt=""> [Yandex Disk](./#yandex-disk) | Native API | **A** | 92 | ✅ | ✅ | ✅ | ✅ 10/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/filelu.png" alt=""> [FileLu API](./#filelu) | Native API | **A** | 92 | ✅ | ✅ | ✅ | ✅ 9/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/felicloud.png" alt=""> [FeliCloud](./webdav#felicloud) | WebDAV (Nextcloud) | **A** | 90 | ✅ | ✅ | ✅ | ⚠️ 7/10 | ✅ |
| <img class="provider-logo" src="/icons/protocols.svg" alt=""> [SSH MyCloud HD](./#ssh-mycloud) | SFTP (NAS) | **A** | 90 | ✅ | ✅ | ✅ | ✅ | ✅ |
| <img class="provider-logo" src="/icons/providers/Amazon_Web_Services.png" alt=""> [AWS S3](./s3-compatible#aws-s3) | S3 | **B** | 87 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/googlecloud.png" alt=""> [Google Cloud Storage](./s3-compatible#google-cloud) | S3 | **B** | 87 | ✅ | ✅ | ✅ | ⚠️ 7/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/idrive_e2.png" alt=""> [iDrive e2](./s3-compatible#idrive-e2) | S3 | **B** | 86 | ✅ | ✅ | ✅ | ⚠️ 6/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/mega.png" alt=""> [MEGA S4](./s3-compatible#mega-s4) | S3 | **B** | 86 | ✅ | ✅ | ✅ | ⚠️ 6/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/storj.png" alt=""> [Storj](./s3-compatible#storj) | S3 Gateway | **B** | 86 | ✅ | ✅ | ✅ | ⚠️ 6/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/wasabi.png" alt=""> [Wasabi](./s3-compatible#wasabi) | S3 | **B** | 86 | ✅ | ✅ | ✅ | ⚠️ 6/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/Koofr.png" alt=""> [Koofr](./webdav#koofr-webdav) | WebDAV | **B** | 86 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ✅ |
| <img class="provider-logo" src="/icons/providers/backblaze.png" alt=""> [Backblaze B2](./s3-compatible#backblaze-b2) | S3 | **B** | 85 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/cloudfare.png" alt=""> [Cloudflare R2](./s3-compatible#cloudflare-r2) | S3 | **B** | 85 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/filelu.png" alt=""> [FileLu S3](./s3-compatible#filelu-s3) | S3 (S5) | **B** | 85 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/tencent.png" alt=""> [Tencent COS](./s3-compatible#tencent-cos) | S3 | **B** | 85 | ✅ | ✅ | ✅ | ⚠️ 5/10 | ⚠️ |
| <img class="provider-logo" src="/icons/providers/drivehq.png" alt=""> [DriveHQ](./webdav#drivehq) | WebDAV | **B** | 81 | ✅ | ⏳ | ✅ | ⚠️ 8/10 | ✅ |
| <img class="provider-logo" src="/icons/providers/infiniCloud.png" alt=""> [InfiniCloud JP](./webdav#infinicloud) | WebDAV | **B** | 80 | ✅ | ⏳ | ✅ | ⚠️ 7/10 | ✅ |
| <img class="provider-logo" src="/icons/providers/alibabacloud.png" alt=""> [Alibaba OSS](./s3-compatible#alibaba-oss) | S3 | **C** | 69 | ✅ | ⚠️ | ✅ | ⚠️ 4/10 | ⚠️ |

Legend: ✅ full pass · ⚠️ partial pass · ⏳ pending benchmark · ❌ fail · - not applicable

### Notes on score dimensions

- **Encoding Robustness** is now measured on live accounts for all providers in this matrix. The sweep covers 10 file names including unicode, emoji, spaces, and the ASCII special set `& ' # % ( ) +`.
- **Native / API providers** (Dropbox, kDrive, Yandex, FileLu) handle all 10 names cleanly. FileLu is at 9/10 because emoji is stored correctly but rendered as `????` in the listing (server-side transliteration).
- **S3-compatible providers** consistently trip on the same set (`%` signature mismatch, `+` reject, `&` / `'` XML split in listing, `#` URL fragment truncation). These are AeroFTP client issues, not provider issues, and are tracked for fix.
- **Reconciliation ⚠️** on object-storage and cloud APIs means post-sync check currently requires explicit path configuration; integrity of the transferred data is never affected.
- **InfiniCloud JP** and **DriveHQ** were promoted from Class C after integrity and encoding measurement consolidated.
- **Alibaba OSS** is currently Class C: uploads and downloads succeed but the listing path is fragile when keys contain emoji or other multibyte characters. The underlying AeroFTP client issue is tracked for fix; score will lift once resolved.

## Detail pages

- [S3-compatible providers](./s3-compatible) - AWS, Backblaze, Storj, Wasabi, Cloudflare R2
- [WebDAV providers](./webdav) - Koofr, FeliCloud, InfiniCloud JP, DriveHQ

## Providers not yet in the public matrix

Several additional providers (pCloud, Filen, Internxt, MEGA, 4shared, Zoho WorkDrive, Drime, FileLu WebDAV) are covered in internal test runs with mixed status. They will enter the public matrix once their scoring stabilizes across the full rubric.

## Update policy

The matrix is revisited after every significant test run consolidation. Scores may change when:

- New rubric dimensions are benchmarked on previously-untested providers
- Provider-side changes affect an operation class
- Rubric weights are re-balanced (only in major revisions of the methodology)

See [methodology](../methodology) for the reproducibility protocol.

</div>
