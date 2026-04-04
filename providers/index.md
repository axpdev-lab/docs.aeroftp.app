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
| FileLu | API | [Setup guide](/providers/filelu) |
| OpenDrive | API | [Setup guide](/providers/opendrive) |
| Yandex Disk | OAuth | [Setup guide](/providers/yandex) |
| 4shared | OAuth | [Setup guide](/providers/4shared) |

## S3-Compatible Object Storage

| Provider | Notes | Guide |
| --- | --- | --- |
| AWS S3 | The original S3 implementation | [S3 reference](/protocols/s3) |
| MEGA S4 | MEGA's S3-compatible object storage | [S3 reference](/protocols/s3) |
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
| Yandex Object Storage | S3-compatible, Russia | [S3 reference](/protocols/s3) |
| FileLu S3 | FileLu via S3 endpoint | [Setup guide](/providers/filelu) |
| Quotaless S3 | Quotaless via S3 endpoint | [Setup guide](/providers/quotaless) |

## WebDAV

| Provider | Notes | Guide |
| --- | --- | --- |
| WebDAV Server | Any WebDAV-compatible server | [WebDAV reference](/protocols/webdav) |
| Nextcloud | Self-hosted, OCS API | [Setup guide](/providers/nextcloud) |
| Felicloud | Hosted Nextcloud, EU/GDPR | [Setup guide](/providers/felicloud) |
| Koofr | EU-based, 10 GB free | [Setup guide](/providers/koofr) |
| CloudMe | Swedish cloud, 3 GB free | WebDAV preset |
| DriveHQ | Enterprise file sharing | WebDAV preset |
| Jianguoyun | Chinese cloud, 3 GB free | WebDAV preset |
| InfiniCLOUD | Japanese cloud, 25 GB free | WebDAV preset |
| Seafile | Open-source, self-hosted | WebDAV preset |
| Quotaless | ownCloud-based WebDAV | [Setup guide](/providers/quotaless) |
| FileLu WebDAV | FileLu via WebDAV | [Setup guide](/providers/filelu) |

## SFTP Presets

| Provider | Notes | Guide |
| --- | --- | --- |
| Hetzner Storage Box | Backup storage, port 23 | [Setup guide](/providers/hetzner-storage-box) |

## Developer

| Provider | Notes | Guide |
| --- | --- | --- |
| GitHub | Repository file system (OAuth, PAT, App .pem) | [Setup guide](/providers/github) |
| GitLab | Repository browser (REST API v4) | Setup guide coming soon |
| SourceForge | Project file releases (SFTP) | [Setup guide](/providers/sourceforge) |

## How These Guides Work

Each guide follows the same structure:

- What AeroFTP supports for that provider
- Exact connection values (endpoint, port, path)
- Step-by-step setup walkthrough
- Recommended defaults
- Troubleshooting tips

Use a **setup guide** when connecting to a known service. Use a [technical reference](/protocols/overview) page when working with a custom or self-hosted service.
