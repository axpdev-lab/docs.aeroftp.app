---
layout: page
sidebar: false
aside: false
outline: false
title: S3-Compatible Providers
description: Coverage scoring and matrix for AWS S3 and S3-compatible storage
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><a href="/test-reports/providers/">Providers</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">S3-Compatible</span></li>
</ul>

# S3-Compatible Providers

All providers on this page speak the S3 API. AeroFTP uses native Signature V4, multipart uploads above 4 MB, and streaming chunked download.

## Comparative matrix

| Provider | Endpoint | Class | Score | Core | Integrity | Navigation | Advanced | Encoding | Reconcile |
|----------|----------|:-----:|:-----:|:----:|:---------:|:----------:|:--------:|:--------:|:---------:|
| <img class="provider-logo" src="/icons/providers/Amazon_Web_Services.png" alt=""> [AWS S3](#aws-s3) | `s3.amazonaws.com` | **B** | 87 | 30/30 | 20/20 | 15/15 | 12/15 | 5/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/googlecloud.png" alt=""> [Google Cloud Storage](#google-cloud) | `storage.googleapis.com` | **B** | 87 | 30/30 | 20/20 | 15/15 | 10/15 | 7/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/idrive_e2.png" alt=""> [iDrive e2](#idrive-e2) | `s3.{region}.idrivee2.com` | **B** | 86 | 30/30 | 20/20 | 15/15 | 10/15 | 6/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/mega.png" alt=""> [MEGA S4](#mega-s4) | `s3.g.s4.mega.io` | **B** | 86 | 30/30 | 20/20 | 15/15 | 10/15 | 6/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/storj.png" alt=""> [Storj](#storj) | `gateway.storjshare.io` | **B** | 86 | 30/30 | 20/20 | 15/15 | 10/15 | 6/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/wasabi.png" alt=""> [Wasabi](#wasabi) | `s3.{region}.wasabisys.com` | **B** | 86 | 30/30 | 20/20 | 15/15 | 10/15 | 6/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/backblaze.png" alt=""> [Backblaze B2](#backblaze-b2) | `s3.{region}.backblazeb2.com` | **B** | 85 | 30/30 | 20/20 | 15/15 | 10/15 | 5/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/cloudfare.png" alt=""> [Cloudflare R2](#cloudflare-r2) | `{account}.r2.cloudflarestorage.com` | **B** | 85 | 30/30 | 20/20 | 15/15 | 10/15 | 5/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/filelu.png" alt=""> [FileLu S3](#filelu-s3) | `s5.filelu.com` | **B** | 85 | 30/30 | 20/20 | 15/15 | 10/15 | 5/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/tencent.png" alt=""> [Tencent COS](#tencent-cos) | `cos.{region}.myqcloud.com` | **B** | 85 | 30/30 | 20/20 | 15/15 | 10/15 | 5/10 | 5/10 |
| <img class="provider-logo" src="/icons/providers/alibabacloud.png" alt=""> [Alibaba OSS](#alibaba-oss) | `oss-{region}.aliyuncs.com` | **C** | 69 | 20/30 | 20/20 | ⚠️ 4/15 | 10/15 | 4/10 | 5/10 |

Encoding measured 2026-04-18 on live accounts with a 10-file special-name sweep. S3-compatible providers consistently fail on the same set (`%`, `+`, `&`, `'`, `#`); see [hub notes](./#notes-on-score-dimensions) for the AeroFTP client issues being tracked.

## AWS S3

**Class B · 89/100**

Reference implementation. Full round-trip verified on small and large objects, hashsum SHA-256 matches, tree and find recursive working, server-side copy and versioning supported.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum (SHA-256 parity) | ✅ |
| tree, find | ✅ |
| server-side copy | ✅ |
| versions (get/list/restore) | ✅ |
| share link (presigned URL) | ✅ |
| storage quota `df` | ⚠️ not exposed by API |
| reconcile post-sync | ⚠️ requires explicit path |

## Backblaze B2

**Class B · 87/100**

B2 S3-compatible endpoint. Operations pass end-to-end. Storage classes and server-side copy available.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| server-side copy | ✅ |
| versions | ✅ |
| share link | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## Cloudflare R2

**Class B · 87/100**

Account-scoped endpoint (`{account}.r2.cloudflarestorage.com`). Zero egress fees; good fit for public assets.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| server-side copy | ✅ |
| versions | ⚠️ limited in R2 API |
| share link | ✅ (via presigned) |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## Storj

**Class B · 87/100**

Distributed storage accessed via the Storj S3 gateway at `gateway.storjshare.io`. Use the S3-compatible backend, not the native Storj protocol, for AeroFTP.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| server-side copy | ✅ |
| versions | ⚠️ depends on bucket config |
| share link | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## Wasabi

**Class B · 87/100**

Hot cloud storage, S3 API. Full matrix green.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| server-side copy | ✅ |
| versions | ✅ |
| share link | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## iDrive e2

**Class B - 86/100**

iDrive e2 S3-compatible endpoint, deep-discount cold-storage positioning. Full matrix green.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| hashsum, tree, find | ✅ |
| server-side copy | ✅ |
| share link (presigned URL) | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## Google Cloud Storage

**Class B - 87/100**

Google Cloud Storage via its S3 interoperability layer. One of the best encoding scores in the S3 family thanks to how GCS preserves key characters in the XML ListBucket response.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| hashsum, tree, find | ✅ |
| server-side copy | ✅ |
| share link (presigned URL) | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## MEGA S4

**Class B - 86/100**

MEGA Object Storage S3-compatible frontend at `s3.g.s4.mega.io`. Standard S3 surface, same encoding gaps as other S3-compatible providers.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| hashsum, tree, find | ✅ |
| server-side copy | ✅ |
| versions / tagging / SSE | ⚠️ not supported by S4 |
| presigned URL (max 7 days) | ✅ |
| reconcile post-sync | ⚠️ requires explicit path |

## FileLu S3

**Class B - 85/100**

FileLu's S3 gateway (S5). Emoji characters in keys are stored correctly server-side but rendered as `????` in list responses (same transliteration as FileLu native API).

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| hashsum, tree, find | ✅ |
| emoji key rendering in listing | ⚠️ shown as `????` |
| reconcile post-sync | ⚠️ requires explicit path |

## Tencent COS

**Class B - 85/100**

Tencent Cloud Object Storage via S3 compatibility API. Same encoding gaps as the rest of the S3 family.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| hashsum, tree, find | ✅ |
| server-side copy | ✅ |
| storage quota `df` | ⚠️ not exposed |
| reconcile post-sync | ⚠️ requires explicit path |

## Alibaba OSS

**Class C - 69/100**

Alibaba OSS via S3-compatible endpoint. Uploads and downloads succeed; SHA-256 round-trip passes. The listing path is currently fragile when keys contain emoji or other multibyte characters positioned at a specific buffer boundary (AeroFTP client issue tracked for fix). Rated Class C pending resolution.

| Operation | Status |
|-----------|:------:|
| connect, mkdir, put, get, rm, mv | ✅ |
| ls (listing) | ⚠️ fragile on emoji keys |
| stat single file | ✅ |
| hashsum | ✅ |
| server-side copy | ✅ |
| reconcile post-sync | ⚠️ requires explicit path |

## Notes on S3 common items

- **`df` / storage quota**: most S3-compatible providers do not expose a standard "used space" endpoint. The `df` warning is structural, not a regression.
- **Reconcile post-sync**: `check` and `reconcile` on object storage currently benefit from explicit path configuration. Integrity of the transferred objects is never affected; only the matching step of the post-sync diff requires path normalization.

## Back to

- [Providers hub](./)
- [Test Reports](../)

</div>
