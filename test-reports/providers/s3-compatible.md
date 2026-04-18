---
layout: page
sidebar: false
aside: false
outline: false
title: S3-Compatible Providers
description: Coverage scoring and matrix for AWS S3 and S3-compatible storage
---

<div class="test-reports">

# S3-Compatible Providers

All providers on this page speak the S3 API. AeroFTP uses native Signature V4, multipart uploads above 4 MB, and streaming chunked download.

## Comparative matrix

| Provider | Endpoint | Class | Score | Core | Integrity | Navigation | Advanced | Encoding | Reconcile |
|----------|----------|:-----:|:-----:|:----:|:---------:|:----------:|:--------:|:--------:|:---------:|
| [AWS S3](#aws-s3) | `s3.amazonaws.com` | **B** | 89 | 30/30 | 20/20 | 15/15 | 12/15 | 7/10* | 5/10 |
| [Backblaze B2](#backblaze-b2) | `s3.{region}.backblazeb2.com` | **B** | 87 | 30/30 | 20/20 | 15/15 | 10/15 | 7/10* | 5/10 |
| [Cloudflare R2](#cloudflare-r2) | `{account}.r2.cloudflarestorage.com` | **B** | 87 | 30/30 | 20/20 | 15/15 | 10/15 | 7/10* | 5/10 |
| [Storj](#storj) | `gateway.storjshare.io` | **B** | 87 | 30/30 | 20/20 | 15/15 | 10/15 | 7/10* | 5/10 |
| [Wasabi](#wasabi) | `s3.{region}.wasabisys.com` | **B** | 87 | 30/30 | 20/20 | 15/15 | 10/15 | 7/10* | 5/10 |

*\* Encoding scored conservatively pending dedicated live-provider run; see [hub notes](./#notes-on-score-dimensions).*

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

## Notes on S3 common items

- **`df` / storage quota**: most S3-compatible providers do not expose a standard "used space" endpoint. The `df` warning is structural, not a regression.
- **Reconcile post-sync**: `check` and `reconcile` on object storage currently benefit from explicit path configuration. Integrity of the transferred objects is never affected; only the matching step of the post-sync diff requires path normalization.

## Back to

- [Providers hub](./)
- [Test Reports](../)

</div>
