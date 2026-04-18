---
layout: page
sidebar: false
aside: false
outline: false
title: WebDAV Providers
description: Coverage scoring and matrix for WebDAV endpoints
---

<div class="test-reports">

<ul class="breadcrumb">
  <li class="breadcrumb-item"><a href="/test-reports/">Test Reports</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><a href="/test-reports/providers/">Providers</a></li>
  <li class="breadcrumb-sep">›</li>
  <li class="breadcrumb-item"><span class="current">WebDAV</span></li>
</ul>

# WebDAV Providers

AeroFTP speaks WebDAV over HTTP/1.1 with Basic and Digest authentication. Providers on this page include Nextcloud-family endpoints, generic WebDAV hosts, and managed services exposing a DAV surface.

## Comparative matrix

| Provider | Endpoint | Class | Score | Core | Integrity | Navigation | Advanced | Encoding | Reconcile |
|----------|----------|:-----:|:-----:|:----:|:---------:|:----------:|:--------:|:--------:|:---------:|
| <img class="provider-logo" src="/icons/providers/felicloud.png" alt=""> [FeliCloud](#felicloud) | Nextcloud WebDAV | **A** | 90 | 30/30 | 20/20 | 15/15 | 8/15 | 7/10 | 10/10 |
| <img class="provider-logo" src="/icons/providers/Koofr.png" alt=""> [Koofr](#koofr-webdav) | `app.koofr.net/dav` | **B** | 86 | 30/30 | 20/20 | 15/15 | 6/15 | 5/10 | 10/10 |
| <img class="provider-logo" src="/icons/providers/drivehq.png" alt=""> [DriveHQ](#drivehq) | `webdav.drivehq.com` | **B** | 81 | 30/30 | 20/20 | ⏳ 7 | 6/15 | 8/10 | 10/10 |
| <img class="provider-logo" src="/icons/providers/infiniCloud.png" alt=""> [InfiniCloud JP](#infinicloud) | `wajima.infini-cloud.net/dav` | **B** | 80 | 30/30 | 20/20 | ⏳ 7 | 6/15 | 7/10 | 10/10 |

Encoding measured 2026-04-18 on live accounts with a 10-file special-name sweep. Integrity verified via SHA-256 round-trip on 1 MB payload.

## FeliCloud

**Class A · 90/100**

Nextcloud-based European cloud at `cloud.felicloud.com`. Full DAV surface with trash and share, reconcile post-sync matches correctly.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| trash / restore | ✅ |
| share link | ✅ |
| server-side copy (`COPY`) | ✅ |
| reconcile post-sync | ✅ |

During the 2026-04-18 run the provider displayed a scheduled maintenance banner; operations completed successfully on recheck later the same day.

## Koofr WebDAV

**Class B · 88/100**

Koofr exposes WebDAV at `app.koofr.net/dav/Koofr`. Core and reconcile are solid; advanced feature surface is intentionally limited to DAV basics (no share link via WebDAV, use native API for that).

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat, rm, mv | ✅ |
| cat, head, tail | ✅ |
| hashsum | ✅ |
| tree, find | ✅ |
| server-side `COPY` | ✅ |
| share link (via WebDAV) | - use Koofr native API |
| reconcile post-sync | ✅ |

## InfiniCloud

**Class C · 68/100**

Japanese WebDAV host, mini-completion clean under `/Cloud`. Rated Class C because the full matrix has not yet been benchmarked end-to-end; preliminary rating.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| deeper matrix (find, tree, hashsum) | ⏳ pending |
| reconcile | ✅ (limited sample) |

## DriveHQ

**Class C · 68/100**

DriveHQ WebDAV at `webdav.drivehq.com`. Mini-completion clean under `/MyCloud`; preliminary rating pending full matrix coverage.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| deeper matrix | ⏳ pending |
| reconcile | ✅ (limited sample) |

## Notes

- **Nextcloud-family endpoints** (FeliCloud and similar) expose `remote.php/dav/files/{user}/`. AeroFTP auto-detects this path shape and falls back correctly when the base URL points to the site root.
- **Digest authentication** is supported in addition to Basic. The server's `WWW-Authenticate` header drives the selection automatically.
- **Reconcile on WebDAV** generally matches without path transformation because DAV responses return paths relative to the request URL.

## Back to

- [Providers hub](./)
- [Test Reports](../)

</div>
