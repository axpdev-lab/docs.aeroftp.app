---
title: Integrations
description: Provider-specific setup guides with endpoints, credentials, ports, and step-by-step instructions for all supported cloud storage and developer services.
---

# Integrations

AeroFTP connects to 55+ cloud storage providers, developer platforms, and self-hosted services. Each guide covers provider-specific setup with exact endpoints, credential paths, and recommended defaults.

For protocol-level technical reference, see [Technical Reference](/protocols/overview).

Each provider guide now starts with a **Plan snapshot** that separates storage quota from traffic, operations, trial windows, and pay-as-you-go triggers:

| Badge | Meaning |
| --- | --- |
| `FREE` | A usable no-cost plan or monthly free allowance exists. |
| `TRIAL` | No-cost use is time-limited or credit-limited. |
| `PAY` | Paid plan or pay-as-you-go billing applies. |
| `CARD` | Billing/payment setup is normally required before or during use. |
| `SELF-HOST` / `BYO` / `LOCAL` | Capacity depends on your own server, external provider, or local bridge. |

## Pricing Snapshot (May 2026)

This comparative table complements the individual setup guides. It centralizes the current free tier / trial / paid-entry picture for the main cloud, S3-compatible, and WebDAV providers exposed by AeroFTP. Self-hosted and local bridges remain grouped when the commercial model depends on your own infrastructure rather than on AeroFTP itself.

| Provider | Category | Free Tier | Trial | Paid Starting Price | Card Required | Notes / Main Limits |
| --- | --- | --- | --- | --- | --- | --- |
| Google Drive | Cloud / OAuth | 15 GB shared with Gmail / Photos | N/A | USD 1.99/month (100 GB) | No for free | Shared quota. Referral and promo boosts are occasional. |
| OneDrive | Cloud / OAuth | 5 GB | 1 month with Microsoft 365 | ~USD 1.99/month (100 GB) or USD 6.99/month (1 TB + Office) | Yes for paid | Free tier was reduced years ago. Strong Microsoft integration. |
| Dropbox | Cloud / OAuth | 2 GB | 30 days | ~USD 9.99-11.99/month (2 TB+) | Yes | Free tier is small. Strong sharing ecosystem. |
| MEGA | Cloud / E2E + S4 | 20 GB, expandable with achievements / referral | N/A | ~EUR 4.99-10/month (Pro) | Yes | One of the most generous free tiers. Strong client-side encryption. |
| Box | Cloud / OAuth | 10 GB (Personal) | Yes on Business plans | ~USD 5-15/user/month (Business) | Yes | Strong enterprise collaboration focus. |
| pCloud | Cloud / OAuth | 10 GB (2 GB base + bonuses) | N/A | USD 4.99/month (500 GB) or lifetime from ~USD 199 | Yes | Lifetime plans remain a major differentiator. Swiss privacy positioning. |
| Filen | Cloud / E2E + Local S3/WebDAV | 10 GB permanent | N/A | EUR 1.99/month (200 GiB) | No for free | Zero-knowledge E2E. Very aggressive entry pricing. |
| Internxt | Cloud / E2E | 1 GB | N/A | Lifetime deals are frequent (1-20 TB) | Yes | Open-source and privacy-first. |
| Koofr | Cloud / API + WebDAV | 10 GB forever | N/A | ~EUR 2/month (100 GB+) or lifetime promos | Yes | EU-based. Can aggregate other clouds. |
| kDrive (Infomaniak) | Cloud / OAuth | 15 GB | 30 days | EUR 4.99/month (3 TB) | Yes | Swiss / EU positioning with strong privacy messaging. |
| FileLu | Cloud + S3 + WebDAV | 1 GB at signup (+ bonus storage via tasks / referral / dev program) | N/A | ~USD 6 or lifetime from ~USD 120 (1 TB) | Yes | Free plan is constrained: slower speeds and practical download limits. |
| Zoho WorkDrive | Cloud / OAuth | 5 GB (Individual) | Yes on Team plans | ~USD 2.50/user/month | Yes | Best fit when already inside the Zoho suite. |
| Drime Cloud | Cloud / API | 20 GB | Risk-free paid trial language | ~EUR 2.39-2.99/month (500 GB) | Yes | EU positioning, collaboration, and privacy messaging. |
| Jottacloud | Cloud / API | 5 GB | N/A | ~USD 6.99/month (1 TB) | Yes | Norwegian provider with backup-heavy positioning. |
| 4shared | Cloud / OAuth | 15 GB | N/A | ~USD 9.95/month (100 GB+) | Yes | Sharing-oriented service. WebDAV endpoint also exists. |
| OpenDrive | Cloud / API + WebDAV | 5 GB with bandwidth / speed limits | N/A | ~USD 12.95/month (Unlimited) | Yes | Free plan has aggressive throughput limits. |
| Yandex Disk | Cloud / OAuth + Object + WebDAV | 5 GB | N/A | ~USD 2/month (200 GB+) | Yes | Russia-based service; geo and compliance considerations may matter. |
| Backblaze B2 | Native + S3-compatible | 10 GB permanent | N/A | USD 6/TB/month | Yes beyond free use | Very low cost. Free egress up to 3x stored data. |
| Amazon S3 | S3 | 5 GB for 12 months on new AWS accounts + free ops allowance | 12 months | ~USD 0.023/GB/month pay-as-you-go | Yes | Egress pricing can dominate the bill. |
| Cloudflare R2 | S3-compatible | 10 GB-month/month + 1M Class A + 10M Class B | N/A | USD 0.015/GB-month beyond free allowance | Yes for billing setup | Zero egress fee. Strong fit for public assets and edge-heavy workloads. |
| Google Cloud Storage | S3-compatible | 5 GB-month always free in select US regions + ops allowance | USD 300 credit | Pay-as-you-go | Yes | Always-free scope is region-limited. |
| IDrive e2 | S3-compatible | 10 GB permanent | N/A | ~USD 0.004/GB/month | Yes | Very aggressive pricing. Egress is free up to 3x stored data. |
| Wasabi | S3-compatible | No permanent free tier | Yes | ~USD 6.99/TB/month | Yes | No egress or API fees, but 90-day minimum retention applies. |
| Storj | S3-compatible | No permanent free tier | N/A | ~USD 6-15/TB/month + minimum fees | Yes | Decentralized storage economics differ from classic S3 vendors. |
| Alibaba Cloud OSS | S3-compatible | ~5 GB always free + 500 GB trial | 1 month | Pay-as-you-go | Yes | Stronger fit for Asia-centric deployments. |
| DigitalOcean Spaces | S3-compatible | No permanent free tier; trial credits are common | Yes | ~USD 5/month (250 GB) + overage | Yes | Simple pricing and good developer ergonomics. |
| Oracle Cloud | S3-compatible | 20 GB Always Free object storage | USD 300 credit for 30 days | Pay-as-you-go | Yes | Signup normally requires a credit or debit card even for the free tier. |
| S3Drive | S3-compatible | 12 GB free | N/A | EUR 1.49/month billed annually (Ultimate) | Yes for paid | Built on Storj. AeroFTP can transfer normally, but the S3 API does not expose quota back to the status bar. |
| MinIO / Quotaless S3 / Filen Desktop (local S3) | Self-hosted / Local | Unlimited locally or BYO backend | N/A | N/A or backend-specific | No for self-hosted | Economics depend on your own storage or the external backend you attach. |
| WebDAV Server (generic) | WebDAV | Provider-dependent | Provider-dependent | Provider-dependent | Provider-dependent | Uses the underlying provider account and quota model. |
| Nextcloud | WebDAV / Self-hosted | Unlimited when self-hosted | N/A | Hosting cost only | No | Full control, but you own the hosting, backups, and maintenance. |
| Seafile | WebDAV / Self-hosted or hosted | Self-hosted: BYO. Hosted Seafile Plus trial observed at 1 GB total for up to 3 users | 30-day hosted trial observed | Hosting cost or vendor-specific plan | No for self-hosted / no card seen in observed hosted trial | Observed hosted trial also showed 300 GB monthly traffic and 6 AI credits. Per-user quota is admin-configurable and excluded from the pricing comparison. |
| Tab.digital | WebDAV / Hosted Nextcloud | 8 GB | N/A | EUR 7.44/month (128 GB) | Yes for paid | Hosted Nextcloud with OCS / WebDAV, EU-hosted, privacy-first positioning. |
| CloudMe | WebDAV / Cloud | 3 GB | N/A | EUR 1.99/month (50 GB, billed annually) | Yes for paid | One of the few remaining simple consumer WebDAV services. |
| InfiniCLOUD | WebDAV / Cloud | 20 GB | N/A | USD 8.99/month (+300 GB) or USD 87.99/year | Yes for paid | Personal WebDAV URL per account. Long-term bonus increases storage over time on paid plans. |
| Jianguoyun / DriveHQ / other hosted WebDAV vendors | WebDAV / Cloud | Usually low single-digit to mid-tier free quotas | Varies | Vendor-specific | Usually yes | Hosted WebDAV providers change packaging often; verify the current commercial plan on the vendor page before publishing card-level pricing. |

### Best Fit Tags

- **Zero egress**: Cloudflare R2, Backblaze B2 (especially behind CDN), Wasabi.
- **Privacy / E2EE**: MEGA, Filen, Internxt, pCloud, Drime, Koofr Vault.
- **Lowest-cost S3**: IDrive e2, Backblaze B2, Cloudflare R2.
- **Lifetime plans**: pCloud, Internxt, Koofr (promo-dependent), Filen.
- **Referral / achievement boosts**: MEGA, FileLu, pCloud.

### Family Notes

- **S3-compatible presets**: if a provider is not broken out separately in the AeroCloud wizard, it still inherits the same sync behavior as the S3 family.
- **WebDAV presets**: hosted Nextcloud variants and similar providers inherit the same sync behavior as the WebDAV family unless their guide documents a provider-specific exception.
- **API / OAuth providers**: these are the ones where pricing and sync behavior diverge more often, so their rows are intentionally kept separate.

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
| <img src="/icons/providers/Koofr.png" width="20" /> | Koofr | API | [Setup guide](/providers/koofr) |
| <img src="/icons/providers/kdrive.png" width="20" /> | kDrive | API | [Setup guide](/providers/kdrive) |
| <img src="/icons/providers/jottacloud.png" width="20" /> | Jottacloud | API | [Setup guide](/providers/jottacloud) |
| <img src="/icons/providers/drime.png" width="20" /> | Drime Cloud | API | [Setup guide](/providers/drime) |
| <img src="/icons/providers/filelu.png" width="20" /> | FileLu | API | [Setup guide](/providers/filelu) |
| <img src="/icons/providers/opendrive.png" width="20" /> | OpenDrive | API | [Setup guide](/providers/opendrive) |
| <img src="/icons/providers/YandexDisk.png" width="20" /> | Yandex Disk | OAuth | [Setup guide](/providers/yandex) |
| <img src="/icons/providers/4shared.png" width="20" /> | 4shared | OAuth | [Setup guide](/providers/4shared) |
| <img src="/icons/providers/backblaze.png" width="20" /> | Backblaze B2 (native) | API | [Setup guide](/providers/backblaze-b2) |

## S3-Compatible Object Storage

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/Amazon_Web_Services.png" width="20" /> | AWS S3 | The original S3 implementation | [Setup guide](/providers/aws-s3) |
| <img src="/icons/providers/googlecloud.png" width="20" /> | Google Cloud Storage | HMAC interop, multi-region | [Setup guide](/providers/google-cloud-storage) |
| <img src="/icons/providers/azure.png" width="20" /> | Azure Blob | Microsoft cloud, HMAC SAS tokens | [Azure reference](/protocols/azure) |
| <img src="/icons/providers/wasabi.png" width="20" /> | Wasabi | No egress fees | [Setup guide](/providers/wasabi) |
| <img src="/icons/providers/cloudfare.png" width="20" /> | Cloudflare R2 | Zero egress fees | [Setup guide](/providers/cloudflare-r2) |
| <img src="/icons/providers/digitalocean.png" width="20" /> | DigitalOcean Spaces | Region-based endpoints | [Setup guide](/providers/digitalocean-spaces) |
| <img src="/icons/providers/tencent.png" width="20" /> | Tencent Cloud COS | APPID-style bucket naming | [Setup guide](/providers/tencent-cloud-cos) |
| <img src="/icons/providers/alibabacloud.png" width="20" /> | Alibaba Cloud OSS | China & global regions | [Setup guide](/providers/alibaba-cloud-oss) |
| <img src="/icons/providers/oracle_cloud.png" width="20" /> | Oracle Cloud | Namespace-based endpoints, 20 GB free | [Setup guide](/providers/oracle-cloud) |
| <img src="/icons/providers/storj.png" width="20" /> | Storj | Decentralized S3 gateways | [Setup guide](/providers/storj) |
| <img src="/icons/providers/idrive_e2.png" width="20" /> | IDrive e2 | 10 GB free hot storage | [Setup guide](/providers/idrive-e2) |
| <img src="/icons/providers/minio.png" width="20" /> | MinIO | Self-hosted S3 | [Setup guide](/providers/minio) |
| <img src="/icons/providers/yandexcloud.png" width="20" /> | Yandex Object Storage | S3-compatible, Russia | [Setup guide](/providers/yandex-object-storage) |
| <img src="/icons/providers/mega.png" width="20" /> | MEGA S4 | MEGA's S3-compatible object storage | [Setup guide](/providers/mega-s4) |
| <img src="/icons/providers/filelu.png" width="20" /> | FileLu S3 | FileLu via S3 endpoint | [Setup guide](/providers/filelu) |
| <img src="/icons/providers/quotaless.png" width="20" /> | Quotaless S3 | Quotaless via S3 endpoint | [Setup guide](/providers/quotaless) |
| <img src="/icons/providers/s3drive.png" width="20" /> | S3Drive | Storj-backed, 12 GB free | [Setup guide](/providers/s3drive) |

## WebDAV (Nextcloud-as-a-Service & friends)

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/webdav.png" width="20" /> | WebDAV Server | Any WebDAV-compatible server | [WebDAV reference](/protocols/webdav) |
| <img src="/icons/providers/nextcloud.png" width="20" /> | Nextcloud | Self-hosted, OCS API | [Setup guide](/providers/nextcloud) |
| <img src="/icons/providers/felicloud.png" width="20" /> | Felicloud | Hosted Nextcloud, EU/GDPR | [Setup guide](/providers/felicloud) |
| <img src="/icons/providers/tabdigital.png" width="20" /> | Tab.digital | Hosted Nextcloud-as-a-Service, EU/GDPR, 8 GB free | [Setup guide](/providers/tabdigital) |
| <img src="/icons/providers/cloudme.png" width="20" /> | CloudMe | Swedish cloud, 3 GB free | [Setup guide](/providers/cloudme) |
| <img src="/icons/providers/infiniCloud.png" width="20" /> | InfiniCLOUD | Japanese cloud, 20 GB free | [Setup guide](/providers/infinicloud) |
| <img src="/icons/providers/jianguoyun.png" width="20" /> | Jianguoyun | Chinese cloud, 3 GB free | [Setup guide](/providers/jianguoyun) |
| <img src="/icons/providers/seafile.png" width="20" /> | Seafile | Open-source, self-hosted or hosted | [Setup guide](/providers/seafile) |
| <img src="/icons/providers/drivehq.png" width="20" /> | DriveHQ | Enterprise file sharing | [Setup guide](/providers/drivehq) |
| <img src="/icons/providers/Koofr.png" width="20" /> | Koofr (WebDAV) | EU-based, 10 GB free | [Setup guide](/providers/koofr) |
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

## Developer Forges

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/github.png" width="20" /> | GitHub | Repository file system (OAuth, PAT, App .pem) | [Setup guide](/providers/github) |
| <img src="/icons/providers/gitlab.png" width="20" /> | GitLab | Repository browser (REST API v4) | [Setup guide](/providers/gitlab) |
| <img src="/icons/providers/sourceforge.png" width="20" /> | SourceForge | Project file releases (SFTP) | [Setup guide](/providers/sourceforge) |

## Photo & Media

| | Provider | Notes | Guide |
| --- | --- | --- | --- |
| <img src="/icons/providers/immich.png" width="20" /> | Immich | Self-hosted photo management (open source) | [Setup guide](/providers/immich) |
| <img src="/icons/providers/pixelunion.png" width="20" /> | PixelUnion | EU-hosted Immich, 16 GB free | [Setup guide](/providers/pixelunion) |
| <img src="/icons/providers/imagekit.png" width="20" /> | ImageKit | Media CDN, 3 GB DAM + 20 GB/month bandwidth free | [Setup guide](/providers/imagekit) |
| <img src="/icons/providers/uploadcare.png" width="20" /> | Uploadcare | EU media management, 1 GB free storage | [Setup guide](/providers/uploadcare) |
| <img src="/icons/providers/cloudinary.png" width="20" /> | Cloudinary | Media management CDN with AI services, 25 GB free | [Setup guide](/providers/cloudinary) |

> Google Photos: standby. Google removed the `photoslibrary.readonly` scope on 2025-03-31. Browse / download is no longer possible. Re-enable when Google ships a REST replacement or Picker API integration.

## How These Guides Work

Each guide follows the same structure:

- What AeroFTP supports for that provider
- Exact connection values (endpoint, port, path)
- Step-by-step setup walkthrough
- Recommended defaults
- Troubleshooting tips

Use a **setup guide** when connecting to a known service. Use a [technical reference](/protocols/overview) page when working with a custom or self-hosted service.
