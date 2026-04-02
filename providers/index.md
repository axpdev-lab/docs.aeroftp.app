---
title: AeroFTP Provider Guides
description: Provider-specific AeroFTP setup guides with exact endpoints, bucket formats, ports, and login paths for Quotaless, R2, Storj, Oracle Cloud, Nextcloud, FileLu, and more.
---

AeroFTP supports a broad mix of storage providers, cloud drives, object storage platforms, WebDAV services, and developer-facing backends. This section focuses on **provider-specific setup** rather than protocol theory.

These guides are designed for search-driven setup tasks such as finding the right **endpoint URL**, **bucket naming rule**, **port number**, **WebDAV path**, or **recommended preset** for a specific provider.

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
| Storj | Decentralized object storage through S3 gateways | S3-compatible | [Open guide](/providers/storj) |
| Alibaba Cloud OSS | S3-compatible object storage for China and global regions | S3-compatible | [Open guide](/providers/alibaba-cloud-oss) |
| Tencent Cloud COS | S3-compatible object storage with APPID-style bucket naming | S3-compatible | [Open guide](/providers/tencent-cloud-cos) |
| Oracle Cloud | S3-compatible object storage with namespace-based endpoints | S3-compatible | [Open guide](/providers/oracle-cloud) |
| Nextcloud | Self-hosted collaboration and file sync | WebDAV | [Open guide](/providers/nextcloud) |
| Felicloud | Hosted Nextcloud-style storage with EU/GDPR positioning | WebDAV | [Open guide](/providers/felicloud) |
| SourceForge | Release uploads for open source projects | SFTP | [Open guide](/providers/sourceforge) |
| IDrive e2 | Affordable S3-compatible hot storage | S3-compatible | [Open guide](/providers/idrive-e2) |
| Wasabi | High-performance object storage with simple pricing | S3-compatible | [Open guide](/providers/wasabi) |
| FileLu | Multi-protocol storage with S3, WebDAV, API, FTP, and FTPS | S3, WebDAV, API, FTP, FTPS | [Open guide](/providers/filelu) |
| MinIO | Self-hosted S3-compatible storage | S3-compatible | [Open guide](/providers/minio) |
| DigitalOcean Spaces | Managed object storage with region-based endpoints | S3-compatible | [Open guide](/providers/digitalocean-spaces) |

## Browse by Connection Type

If you already know the protocol family, start here:

- **S3-compatible providers**: [Quotaless](/providers/quotaless), [Backblaze B2](/providers/backblaze-b2), [Cloudflare R2](/providers/cloudflare-r2), [Storj](/providers/storj), [Alibaba Cloud OSS](/providers/alibaba-cloud-oss), [Tencent Cloud COS](/providers/tencent-cloud-cos), [Oracle Cloud](/providers/oracle-cloud), [IDrive e2](/providers/idrive-e2), [Wasabi](/providers/wasabi), [FileLu](/providers/filelu), [MinIO](/providers/minio), [DigitalOcean Spaces](/providers/digitalocean-spaces)
- **WebDAV providers**: [Quotaless](/providers/quotaless), [Nextcloud](/providers/nextcloud), [Felicloud](/providers/felicloud), [FileLu](/providers/filelu)
- **SFTP providers**: [Hetzner Storage Box](/providers/hetzner-storage-box), [SourceForge](/providers/sourceforge)

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
