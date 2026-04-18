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
| <img class="provider-logo" src="/icons/providers/drivehq.png" alt=""> [DriveHQ](#drivehq) | `webdav.drivehq.com` | **B** | 85 | 30/30 | 20/20 | 15/15 | 6/15 | 8/10 | 10/10 |
| <img class="provider-logo" src="/icons/providers/infiniCloud.png" alt=""> [InfiniCloud JP](#infinicloud) | `wajima.infini-cloud.net/dav` | **B** | 83 | 30/30 | 20/20 | 15/15 | 6/15 | 7/10 | 10/10 |
| <img class="provider-logo" src="/icons/providers/seafile.png" alt=""> [Seafile](#seafile) | `plus.seafile.com/seafdav` | **B** | 78 | 30/30 | 20/20 | 15/15 | ⏳ | ⏳ | 10/10 |
| <img class="provider-logo" src="/icons/providers/jianguoyun.png" alt=""> [Jianguoyun](#jianguoyun) | `dav.jianguoyun.com/dav` | **B** | 77 | 30/30 | 20/20 | 15/15 | ⏳ | ⏳ | 10/10 |
| <img class="provider-logo" src="/icons/providers/cloudme.png" alt=""> [CloudMe](#cloudme) | `webdav.cloudme.com/{user}/` | **B** | 76 | 30/30 | 20/20 | 15/15 | ⏳ | ⏳ | 10/10 |

Encoding measured 2026-04-18 on live accounts with a 10-file special-name sweep. Integrity verified via SHA-256 round-trip on 1 MB payload. Navigation benchmark (2026-04-19) completed on all 7 providers via `aeroftp-cli tree --depth 2` + `find` against live accounts - all returned the expected tree structure, promoting Navigation to 15/15 for the five providers that were previously `⏳ pending`.

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
| share link (via WebDAV) | - use Koofr native API for share links |
| reconcile post-sync | ✅ |

## InfiniCloud

**Class B · 83/100**

Japanese WebDAV host at `wajima.infini-cloud.net/dav`, mini-completion clean under `/Cloud`. Navigation benchmark completed 2026-04-19: `tree --depth 2 /` and `find / "*.txt"` returned the expected results on a mixed tree of 6 files + 1 subdirectory.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| tree, find | ✅ |
| hashsum | ✅ |
| reconcile | ✅ |

## DriveHQ

**Class B · 85/100**

DriveHQ WebDAV at `webdav.drivehq.com`, mini-completion clean under `/MyCloud`. Navigation benchmark completed 2026-04-19: `tree --depth 2 /MyCloud` and `find` returned the expected tree on a mixed set of PDFs, renamed files, and a nested sweep directory.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| tree, find | ✅ |
| hashsum | ✅ |
| reconcile | ✅ |

## Seafile

**Class B · 78/100**

Seafile at `plus.seafile.com/seafdav`. Navigation benchmark completed 2026-04-19: `tree --depth 2 /` and `find / "*"` returned the expected structure across `Documenti/` and `root_folder/`. Advanced features and encoding sweep still pending a dedicated run.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| tree, find | ✅ |
| hashsum | ✅ |
| advanced (share, versions, trash) | ⏳ pending full sweep |
| encoding sweep | ⏳ pending full sweep |
| reconcile | ✅ |

## Jianguoyun

**Class B · 77/100**

Chinese provider at `dav.jianguoyun.com/dav`. Navigation benchmark completed 2026-04-19: `tree` + `find` returned a rich mixed tree of PDFs, renamed files, and 3 subdirectories with SHA-256 hash test artefacts. Advanced features and encoding sweep still pending.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| tree, find | ✅ |
| hashsum | ✅ |
| advanced (share, versions, trash) | ⏳ pending full sweep |
| encoding sweep | ⏳ pending full sweep |
| reconcile | ✅ |

## CloudMe

**Class B · 76/100**

CloudMe at `webdav.cloudme.com/{user}/`. Navigation benchmark completed 2026-04-19: `tree --depth 2 /` returned 3 root folders (`CloudDrive`, `Following`, `Shared`) plus nested `Desktop/Documents/Trashcan/codex-recovery-*`. Advanced features and encoding sweep still pending.

| Operation | Status |
|-----------|:------:|
| connect, ls, mkdir, put, get, stat | ✅ |
| rm, mv | ✅ |
| tree, find | ✅ |
| hashsum | ✅ |
| advanced (share, versions, trash) | ⏳ pending full sweep |
| encoding sweep | ⏳ pending full sweep |
| reconcile | ✅ |

## Pending WebDAV sweep

Several providers that also expose a WebDAV surface are not yet scored on the public matrix because the native API is the recommended transport, but the DAV endpoint has been confirmed reachable. They will enter the matrix once a dedicated live sweep is scored:

| Provider | WebDAV endpoint | Recommended transport | Status |
|----------|------------------|------------------------|:------:|
| Nextcloud (generic) | `remote.php/dav/files/{user}/` | WebDAV | ⏳ scoring |
| Box | `dav.box.com/dav` | Box native API | ⏳ deprioritised |
| pCloud | `webdav.pcloud.com` | pCloud native API | ⏳ deprioritised |
| Yandex Disk | `webdav.yandex.com` | Yandex native API | ⏳ deprioritised |
| Jottacloud | `app.jottacloud.com/jfs` | Jotta native API | ⏳ deprioritised |

## Notes

- **Nextcloud-family endpoints** (FeliCloud and similar) expose `remote.php/dav/files/{user}/`. AeroFTP auto-detects this path shape and falls back correctly when the base URL points to the site root.
- **Digest authentication** is supported in addition to Basic. The server's `WWW-Authenticate` header drives the selection automatically.
- **Reconcile on WebDAV** matches without path transformation because DAV responses return paths relative to the request URL.

## Back to

- [Providers hub](./)
- [Test Reports](../)

</div>
