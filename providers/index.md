---
title: AeroFTP Setup Guides
description: Provider-specific setup guides with endpoints, credentials, ports, and step-by-step instructions for 33 cloud storage and developer services.
---

AeroFTP supports 51 cloud storage providers, developer platforms, and self-hosted services. These guides cover **provider-specific setup** with exact endpoints, credential paths, and recommended defaults.

For protocol-level technical reference, see [Technical Reference](/protocols/overview).

## Cloud Storage (OAuth & API)

| Provider | Type | Guide |
| --- | --- | --- |
| Google Drive | OAuth | [Setup guide](/providers/google-drive) |
| OneDrive | OAuth | [Setup guide](/providers/onedrive) |
| Dropbox | OAuth | [Setup guide](/providers/dropbox) |
| MEGA | E2E | [Setup guide](/providers/mega) |
| Box | OAuth | [Setup guide](/providers/box) |
| pCloud | OAuth | [Setup guide](/providers/pcloud) |
| Filen | E2E | [Setup guide](/providers/filen) |
| Internxt | E2E | [Setup guide](/providers/internxt) |
| Zoho WorkDrive | OAuth | [Setup guide](/providers/zoho) |
| kDrive | API | [Setup guide](/providers/kdrive) |
| Jottacloud | API | [Setup guide](/providers/jottacloud) |
| Drime Cloud | API | [Setup guide](/providers/drime) |
| Koofr | API | [Setup guide](/providers/koofr) |
| OpenDrive | API | [Setup guide](/providers/opendrive) |
| Yandex Disk | OAuth | [Setup guide](/providers/yandex) |
| 4shared | OAuth | [Setup guide](/providers/4shared) |

## S3-Compatible Object Storage

| Provider | Notes | Guide |
| --- | --- | --- |
| Backblaze B2 | Affordable, S3-compatible | [Setup guide](/providers/backblaze-b2) |
| Cloudflare R2 | Zero egress fees | [Setup guide](/providers/cloudflare-r2) |
| Storj | Decentralized S3 gateways | [Setup guide](/providers/storj) |
| IDrive e2 | 10 GB free hot storage | [Setup guide](/providers/idrive-e2) |
| Wasabi | No egress fees | [Setup guide](/providers/wasabi) |
| DigitalOcean Spaces | Region-based endpoints | [Setup guide](/providers/digitalocean-spaces) |
| Oracle Cloud | Namespace-based endpoints | [Setup guide](/providers/oracle-cloud) |
| MinIO | Self-hosted S3 | [Setup guide](/providers/minio) |
| Alibaba Cloud OSS | China & global regions | [Setup guide](/providers/alibaba-cloud-oss) |
| Tencent Cloud COS | APPID-style bucket naming | [Setup guide](/providers/tencent-cloud-cos) |

## WebDAV & Self-hosted

| Provider | Notes | Guide |
| --- | --- | --- |
| Nextcloud | Self-hosted, OCS API | [Setup guide](/providers/nextcloud) |
| Felicloud | Hosted Nextcloud, EU/GDPR | [Setup guide](/providers/felicloud) |
| Quotaless | S3 + WebDAV dual access | [Setup guide](/providers/quotaless) |

## Multi-protocol

| Provider | Protocols | Guide |
| --- | --- | --- |
| FileLu | S3, WebDAV, API, FTP, FTPS | [Setup guide](/providers/filelu) |
| Hetzner Storage Box | SFTP (port 23) | [Setup guide](/providers/hetzner-storage-box) |
| SourceForge | SFTP | [Setup guide](/providers/sourceforge) |

## Developer

| Provider | Notes | Guide |
| --- | --- | --- |
| GitHub | Repository file system | [Setup guide](/providers/github) |

## How These Guides Work

Each guide follows the same structure:

- What AeroFTP supports for that provider
- Exact connection values (endpoint, port, path)
- Step-by-step setup walkthrough
- Recommended defaults
- Troubleshooting tips

Use a **setup guide** when connecting to a known service. Use a [technical reference](/protocols/overview) page when working with a custom or self-hosted service.
