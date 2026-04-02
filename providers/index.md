---
title: AeroFTP Provider Guides
description: Provider-specific setup guides for AeroFTP, including Quotaless, Cloudflare R2, Backblaze B2, Nextcloud, Hetzner Storage Box, SourceForge, and more.
---

AeroFTP supports a broad mix of storage providers, cloud drives, object storage platforms, WebDAV services, and developer-facing backends. This section focuses on **provider-specific setup** rather than protocol theory.

If you want the general protocol reference, start with:

- [S3-Compatible Storage](/protocols/s3)
- [WebDAV](/protocols/webdav)
- [SFTP](/protocols/sftp)
- [SourceForge](/protocols/sourceforge)

If you want the fastest path to a working connection for a specific brand or service, start here.

## Featured Provider Guides

| Provider | Best For | Connection Modes | Guide |
| --- | --- | --- | --- |
| Quotaless | Managed storage with both object and file-style access | S3, WebDAV | [Open guide](/providers/quotaless) |
| Hetzner Storage Box | Backup storage and simple remote file access | SFTP | [Open guide](/providers/hetzner-storage-box) |
| Backblaze B2 | Low-cost object storage and backup workflows | S3-compatible | [Open guide](/providers/backblaze-b2) |
| Cloudflare R2 | Object storage with zero egress fees | S3-compatible | [Open guide](/providers/cloudflare-r2) |
| Nextcloud | Self-hosted collaboration and file sync | WebDAV | [Open guide](/providers/nextcloud) |
| SourceForge | Release uploads for open source projects | SFTP | [Open guide](/providers/sourceforge) |
| IDrive e2 | Affordable S3-compatible hot storage | S3-compatible | [Open guide](/providers/idrive-e2) |
| Wasabi | High-performance object storage with simple pricing | S3-compatible | [Open guide](/providers/wasabi) |
| FileLu | Multi-protocol storage with S3, WebDAV, API, FTP, and FTPS | S3, WebDAV, API, FTP, FTPS | [Open guide](/providers/filelu) |
| MinIO | Self-hosted S3-compatible storage | S3-compatible | [Open guide](/providers/minio) |
| DigitalOcean Spaces | Managed object storage with region-based endpoints | S3-compatible | [Open guide](/providers/digitalocean-spaces) |

## How These Guides Work

Each provider page is built around the same structure:

- what AeroFTP supports for that provider
- exact connection values to prepare
- a step-by-step setup path
- recommended defaults
- common troubleshooting notes

That means you can use these pages as a practical setup reference, not just as a product overview.

## Which Page Should You Use?

Use a **provider page** when:

- you are connecting to a known service such as Quotaless, Backblaze, or Nextcloud
- you want exact endpoint or path values
- you want a shorter setup guide with fewer generic details

Use a **protocol page** when:

- you are connecting to a custom or self-hosted service
- you want to understand how the protocol behaves in AeroFTP
- you are comparing multiple services that use the same protocol

## More Provider Guides

This section starts with the highest-value setup pages and will expand over time to cover more S3, WebDAV, and cloud-drive providers already supported by AeroFTP.

For the full protocol-level support matrix, see [Provider Reference](/advanced/provider-reference).
