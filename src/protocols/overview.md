# Protocol Overview

AeroFTP supports **22 protocols** and cloud storage providers natively. Each protocol is implemented in Rust with full streaming support, credential encryption via the OS keyring, and integration with AeroSync, AeroAgent, and the CLI.

## Comparison Table

| Protocol | Auth | Encryption | Free Storage | Trash | Versions | Share Links |
|----------|------|------------|-------------|-------|----------|-------------|
| [FTP](ftp.md) | Username/Password | None | N/A (self-hosted) | No | No | No |
| [FTPS](ftp.md) | Username/Password | TLS (Explicit/Implicit) | N/A (self-hosted) | No | No | No |
| [SFTP](sftp.md) | Password / SSH Key | SSH (AES, ChaCha20) | N/A (self-hosted) | No | No | No |
| [WebDAV](webdav.md) | Username/Password | TLS (HTTPS) | Varies by provider | No | No | No |
| [S3-Compatible](s3.md) | Access Key / Secret Key | TLS + SSE | Varies by provider | No | Yes | Pre-signed URLs |
| [Google Drive](google-drive.md) | OAuth2 | TLS + at-rest | 15 GB | Yes | Yes | Yes |
| [Dropbox](dropbox.md) | OAuth2 PKCE | TLS + at-rest | 2 GB | Yes | Yes | Yes |
| [OneDrive](onedrive.md) | OAuth2 | TLS + at-rest | 5 GB | Yes | Yes | Yes |
| [MEGA](mega.md) | Email/Password | E2E (AES-128) | 20 GB | No | No | Yes |
| [Box](box.md) | OAuth2 | TLS + at-rest | 10 GB | Yes | Yes | Yes |
| [pCloud](pcloud.md) | OAuth2 | TLS + at-rest | 10 GB | Yes | Yes | Yes |
| [Azure Blob](azure.md) | Access Key | TLS + SSE | Pay-as-you-go | No | Yes | SAS tokens |
| [4shared](4shared.md) | OAuth 1.0 (HMAC-SHA1) | TLS | 15 GB | No | No | Yes |
| [Filen](filen.md) | Email/Password + 2FA | E2E (AES-256) | 10 GB | No | No | No |
| [Zoho WorkDrive](zoho.md) | OAuth2 | TLS + at-rest | 5 GB (team) | Yes | Yes | Yes |
| [Internxt](internxt.md) | OAuth2 PKCE | E2E (AES-256) | 10 GB | No | No | No |
| [kDrive](kdrive.md) | OAuth2 | TLS + at-rest | 15 GB | Yes | Yes | Yes |
| [Koofr](koofr.md) | OAuth2 PKCE | TLS + at-rest | 10 GB | Yes | No | Yes |
| [FileLu](filelu.md) | API Key | TLS | 10 GB | Yes | No | Yes |
| [Yandex Disk](yandex.md) | OAuth2 | TLS + at-rest | 5 GB | Yes | No | Yes |
| [OpenDrive](opendrive.md) | Session (user/pass) | TLS | 5 GB | Yes | No | Yes (expiring) |
| [Jottacloud](jottacloud.md) | Username/Password | TLS + at-rest | 5 GB | No | No | No |

## Protocol Categories

### Server Protocols (Self-Hosted)

These connect to servers you control. You provide the hostname, port, and credentials.

- **FTP / FTPS** -- Traditional file transfer. Best for legacy servers and shared hosting.
- **SFTP** -- Secure file transfer over SSH. The recommended choice for self-hosted servers.
- **WebDAV** -- HTTP-based file access. Used by Nextcloud, Seafile, and many NAS devices.

### Cloud Providers (OAuth)

These authenticate through the provider's OAuth flow. AeroFTP opens a browser window for authorization.

- **Google Drive**, **Dropbox**, **OneDrive**, **Box**, **pCloud**, **Zoho WorkDrive**, **Internxt**, **kDrive**, **Koofr**, **Yandex Disk**

### Cloud Providers (Direct Auth)

These use API keys, email/password, or session tokens directly.

- **MEGA**, **4shared**, **Filen**, **FileLu**, **OpenDrive**, **Jottacloud**

### Object Storage

These use access key / secret key pairs with an S3-compatible or proprietary API.

- **Amazon S3**, **Azure Blob Storage**, and all S3-compatible presets

## WebDAV Presets

AeroFTP includes pre-configured WebDAV presets for popular services:

| Service | Endpoint | Default Port | Notes |
|---------|----------|-------------|-------|
| Nextcloud | `your-server.com/remote.php/dav/files/USERNAME/` | 443 | Self-hosted or managed |
| Seafile | `your-server.com/seafdav` | 443 | Via SeafDAV extension |
| CloudMe | `webdav.cloudme.com` | 443 | 3 GB free |

When using a WebDAV preset, AeroFTP automatically configures the endpoint path. You only need to provide your server hostname and credentials.

## S3-Compatible Presets

AeroFTP supports any S3-compatible service. Built-in presets auto-configure the endpoint and region:

| Service | Endpoint Template | Free Tier | Notes |
|---------|-------------------|-----------|-------|
| AWS S3 | `s3.{region}.amazonaws.com` | Pay-as-you-go | The original S3 |
| Wasabi | `s3.{region}.wasabisys.com` | Pay-as-you-go | No egress fees |
| Backblaze B2 | `s3.{region}.backblazeb2.com` | 10 GB | S3-compatible API |
| DigitalOcean Spaces | `{region}.digitaloceanspaces.com` | Pay-as-you-go | CDN included |
| Cloudflare R2 | `{accountId}.r2.cloudflarestorage.com` | 10 GB | No egress fees, requires Account ID |
| Storj | `gateway.storjshare.io` | 25 GB | Decentralized storage |
| Alibaba OSS | `oss-{region}.aliyuncs.com` | Pay-as-you-go | Asia-optimized |
| Tencent COS | `cos.{region}.myqcloud.com` | Pay-as-you-go | China regions |
| MinIO | Custom endpoint | N/A | Self-hosted S3 |
| Yandex Object Storage | `storage.yandexcloud.net` | Pay-as-you-go | Russia region |

For Cloudflare R2, a dedicated **Account ID** field is shown in the connection form. The endpoint is computed automatically from the account ID.

## AeroSync Compatibility

All 22 protocols are supported by AeroSync for bidirectional synchronization. Server protocols (FTP, SFTP, WebDAV) and cloud providers can be used as sync targets via the AeroCloud background sync engine.

## CLI Compatibility

All 22 protocols are accessible from the `aeroftp-cli` command-line tool using URL-based connections:

```bash
aeroftp ls sftp://user@myserver.com/path/
aeroftp get s3://mybucket/file.txt
aeroftp sync ftp://user@host/ ./local-dir/
```
