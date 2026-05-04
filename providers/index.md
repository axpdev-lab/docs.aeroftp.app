---
title: Integrations
description: Provider-specific setup guides with endpoints, credentials, ports, and step-by-step instructions for all supported cloud storage and developer services.
---

# Integrations

AeroFTP connects to 53+ cloud storage providers, developer platforms, and self-hosted services. Each guide covers provider-specific setup with exact endpoints, credential paths, and recommended defaults.

For protocol-level technical reference, see [Technical Reference](/protocols/overview).

## Photo & Media

| | Provider | Type | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/immich.png" width="20" /> | Immich | API | [Setup guide](/providers/immich) |
| <img src="/icons/providers/pixelunion.png" width="20" /> | PixelUnion | API | [Setup guide](/providers/pixelunion) |

## Cloud Storage (OAuth & API)

| | Provider | Type | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/Google_Drive.png" width="20" /> | Google Drive | OAuth | [Setup guide](/providers/google-drive) |
| <img src="/icons/providers/onedrive.png" width="20" /> | OneDrive | OAuth | [Setup guide](/providers/onedrive) |
| <img src="/icons/providers/dropbox.png" width="20" /> | Dropbox | OAuth | [Setup guide](/providers/dropbox) |
| <img src="/icons/providers/mega.png" width="20" /> | MEGA | E2E | [Setup guide](/providers/mega) |
| <img src="/icons/providers/box.png" width="20" /> | Box | OAuth | [Setup guide](/providers/box) |
| <img src="/icons/providers/pcloud.png" width="20" /> | pCloud | OAuth | [Setup guide](/providers/pcloud) |
| <img src="/icons/providers/filen.png" width="20" /> | Filen | E2E | [Setup guide](/providers/filen) |
| <img src="/icons/providers/internxt.png" width="20" /> | Internxt | E2E | [Setup guide](/providers/internxt) |
| <img src="/icons/providers/ZohoWorkDrive.png" width="20" /> | Zoho WorkDrive | OAuth | [Setup guide](/providers/zoho) |
| <img src="/icons/providers/kdrive.png" width="20" /> | kDrive | API | [Setup guide](/providers/kdrive) |
| <img src="/icons/providers/jottacloud.png" width="20" /> | Jottacloud | API | [Setup guide](/providers/jottacloud) |
| <img src="/icons/providers/drime.png" width="20" /> | Drime Cloud | API | [Setup guide](/providers/drime) |
| <img src="/icons/providers/Koofr.png" width="20" /> | Koofr | API | [Setup guide](/providers/koofr) |
| <img src="/icons/providers/filelu.png" width="20" /> | FileLu | API | [Setup guide](/providers/filelu) |
| <img src="/icons/providers/opendrive.png" width="20" /> | OpenDrive | API | [Setup guide](/providers/opendrive) |
| <img src="/icons/providers/YandexDisk.png" width="20" /> | Yandex Disk | OAuth | [Setup guide](/providers/yandex) |
| <img src="/icons/providers/4shared.png" width="20" /> | 4shared | OAuth | [Setup guide](/providers/4shared) |

## S3-Compatible Object Storage

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/Amazon_Web_Services.png" width="20" /> | AWS S3 | The original S3 implementation | [Setup guide](/providers/aws-s3) |
| <img src="/icons/providers/googlecloud.png" width="20" /> | Google Cloud Storage | HMAC interop, multi-region | [Setup guide](/providers/google-cloud-storage) |
| <img src="/icons/providers/mega.png" width="20" /> | MEGA S4 | MEGA's S3-compatible object storage | [Setup guide](/providers/mega-s4) |
| <img src="/icons/providers/backblaze.png" width="20" /> | Backblaze B2 | Affordable, S3-compatible | [Setup guide](/providers/backblaze-b2) |
| <img src="/icons/providers/cloudfare.png" width="20" /> | Cloudflare R2 | Zero egress fees | [Setup guide](/providers/cloudflare-r2) |
| <img src="/icons/providers/storj.png" width="20" /> | Storj | Decentralized S3 gateways | [Setup guide](/providers/storj) |
| <img src="/icons/providers/idrive_e2.png" width="20" /> | IDrive e2 | 10 GB free hot storage | [Setup guide](/providers/idrive-e2) |
| <img src="/icons/providers/wasabi.png" width="20" /> | Wasabi | No egress fees | [Setup guide](/providers/wasabi) |
| <img src="/icons/providers/digitalocean.png" width="20" /> | DigitalOcean Spaces | Region-based endpoints | [Setup guide](/providers/digitalocean-spaces) |
| <img src="/icons/providers/oracle_cloud.png" width="20" /> | Oracle Cloud | Namespace-based endpoints | [Setup guide](/providers/oracle-cloud) |
| <img src="/icons/providers/minio.png" width="20" /> | MinIO | Self-hosted S3 | [Setup guide](/providers/minio) |
| <img src="/icons/providers/alibabacloud.png" width="20" /> | Alibaba Cloud OSS | China & global regions | [Setup guide](/providers/alibaba-cloud-oss) |
| <img src="/icons/providers/tencent.png" width="20" /> | Tencent Cloud COS | APPID-style bucket naming | [Setup guide](/providers/tencent-cloud-cos) |
| <img src="/icons/providers/yandexcloud.png" width="20" /> | Yandex Object Storage | S3-compatible, Russia | [Setup guide](/providers/yandex-object-storage) |
| <img src="/icons/providers/filelu.png" width="20" /> | FileLu S3 | FileLu via S3 endpoint | [Setup guide](/providers/filelu) |
| <img src="/icons/providers/quotaless.png" width="20" /> | Quotaless S3 | Quotaless via S3 endpoint | [Setup guide](/providers/quotaless) |
| <img src="/icons/providers/s3drive.png" width="20" /> | S3Drive | Storj-backed, 12 GB free | [Setup guide](/providers/s3drive) |

## WebDAV

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/webdav.png" width="20" /> | WebDAV Server | Any WebDAV-compatible server | [WebDAV reference](/protocols/webdav) |
| <img src="/icons/providers/nextcloud.png" width="20" /> | Nextcloud | Self-hosted, OCS API | [Setup guide](/providers/nextcloud) |
| <img src="/icons/providers/felicloud.png" width="20" /> | Felicloud | Hosted Nextcloud, EU/GDPR | [Setup guide](/providers/felicloud) |
| <img src="/icons/providers/Koofr.png" width="20" /> | Koofr | EU-based, 10 GB free | [Setup guide](/providers/koofr) |
| <img src="/icons/providers/cloudme.png" width="20" /> | CloudMe | Swedish cloud, 3 GB free | [Setup guide](/providers/cloudme) |
| <img src="/icons/providers/drivehq.png" width="20" /> | DriveHQ | Enterprise file sharing | [Setup guide](/providers/drivehq) |
| <img src="/icons/providers/jianguoyun.png" width="20" /> | Jianguoyun | Chinese cloud, 3 GB free | [Setup guide](/providers/jianguoyun) |
| <img src="/icons/providers/infiniCloud.png" width="20" /> | InfiniCLOUD | Japanese cloud, 25 GB free | [Setup guide](/providers/infinicloud) |
| <img src="/icons/providers/seafile.png" width="20" /> | Seafile | Open-source, self-hosted | [Setup guide](/providers/seafile) |
| <img src="/icons/providers/quotaless.png" width="20" /> | Quotaless | ownCloud-based WebDAV | [Setup guide](/providers/quotaless) |
| <img src="/icons/providers/filelu.png" width="20" /> | FileLu WebDAV | FileLu via WebDAV | [Setup guide](/providers/filelu) |

## SFTP Presets

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/hetzner.png" width="20" /> | Hetzner Storage Box | Backup storage, port 23 | [Setup guide](/providers/hetzner-storage-box) |

## Local Bridges (v3.7.1)

These presets connect AeroFTP to a desktop daemon running on the same machine. They are perfect for piggybacking on an existing authenticated session without re-authenticating from AeroFTP.

| | Preset | Bridge | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/filen.png" width="20" /> | Filen Desktop (local WebDAV) | `local.webdav.filen.io:1900` | [Setup guide](/providers/filen-desktop) |
| <img src="/icons/providers/filen.png" width="20" /> | Filen Desktop (local S3) | `local.s3.filen.io:1700` | [Setup guide](/providers/filen-desktop) |
| <img src="/icons/providers/mega.png" width="20" /> | MEGAcmd (local WebDAV) | `127.0.0.1:4443` | [Setup guide](/providers/megacmd) |

## Developer

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/github.png" width="20" /> | GitHub | Repository file system (OAuth, PAT, App .pem) | [Setup guide](/providers/github) |
| <img src="/icons/providers/gitlab.png" width="20" /> | GitLab | Repository browser (REST API v4) | [Setup guide](/providers/gitlab) |
| <img src="/icons/providers/sourceforge.png" width="20" /> | SourceForge | Project file releases (SFTP) | [Setup guide](/providers/sourceforge) |

## How These Guides Work

Each guide follows the same structure:

- What AeroFTP supports for that provider
- Exact connection values (endpoint, port, path)
- Step-by-step setup walkthrough
- Recommended defaults
- Troubleshooting tips

Use a **setup guide** when connecting to a known service. Use a [technical reference](/protocols/overview) page when working with a custom or self-hosted service.
