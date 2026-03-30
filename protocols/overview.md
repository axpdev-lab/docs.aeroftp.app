# Protocol Overview

> Last updated: 2026-03-30

AeroFTP supports **25 protocols** and cloud storage providers natively. Each protocol is implemented in Rust with full streaming support, credential encryption via the OS keyring, and integration with AeroSync, AeroAgent, and the CLI.

## Protocol Comparison

### Server Protocols (6)

| # | Protocol | Auth Method | Encryption | Free Storage |
|---|----------|-------------|------------|-------------|
| 1 | [FTP](ftp.md) | Password | None | N/A (self-hosted) |
| 2 | [FTPS](ftp.md) | Password | TLS/SSL (Explicit/Implicit) | N/A (self-hosted) |
| 3 | [SFTP](sftp.md) | Password / SSH Key | SSH | N/A (self-hosted) |
| 4 | [WebDAV](webdav.md) | Password (Basic + Digest) | HTTPS | Varies by provider |
| 5 | [S3-Compatible](s3.md) | Access Key + Secret | HTTPS + SSE | Varies by provider |
| 6 | OpenStack Swift | Username + Password (Keystone v3) | HTTPS | Varies by provider |

### OAuth Cloud Providers (7)

| # | Protocol | Auth Method | Encryption | Free Storage |
|---|----------|-------------|------------|-------------|
| 7 | [Google Drive](google-drive.md) | OAuth2 PKCE | HTTPS + at-rest | 15 GB |
| 8 | [Dropbox](dropbox.md) | OAuth2 PKCE | HTTPS + at-rest | 2 GB |
| 9 | [OneDrive](onedrive.md) | OAuth2 PKCE | HTTPS + at-rest | 5 GB |
| 10 | [Box](box.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| 11 | [pCloud](pcloud.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| 12 | [Zoho WorkDrive](zoho.md) | OAuth2 PKCE | HTTPS + at-rest | Team plan |
| 13 | [Koofr](koofr.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |

### Direct Auth Cloud Providers (11)

| # | Protocol | Auth Method | Encryption | Free Storage |
|---|----------|-------------|------------|-------------|
| 14 | [MEGA](mega.md) | Password | Client-side AES | 20 GB |
| 15 | [Azure Blob](azure.md) | HMAC / SAS Token | HTTPS + SSE | Pay-as-you-go |
| 16 | [4shared](4shared.md) | OAuth 1.0 (HMAC-SHA1) | HTTPS | 15 GB |
| 17 | [Filen](filen.md) | Password (PBKDF2) + optional 2FA | Client-side AES-256-GCM | 10 GB |
| 18 | [Internxt](internxt.md) | Password (PBKDF2 + BIP39) | Client-side AES-256-CTR | 1 GB |
| 19 | [kDrive](kdrive.md) | API Token | HTTPS | 15 GB |
| 20 | [Jottacloud](jottacloud.md) | Personal Login Token | HTTPS | 5 GB |
| 21 | Drime Cloud | API Token (Bearer) | HTTPS | 20 GB |
| 22 | [FileLu](filelu.md) | API Key | HTTPS | 1 GB |
| 23 | [Yandex Disk](yandex.md) | OAuth2 Token | HTTPS | 5 GB |
| 24 | [OpenDrive](opendrive.md) | Session Auth (user/pass) | HTTPS | 5 GB |

### Developer Platform (1)

| # | Protocol | Auth Method | Encryption | Free Storage |
|---|----------|-------------|------------|-------------|
| 25 | [GitHub](github.md) | OAuth2 / PAT / App .pem | HTTPS | Unlimited repos |

## Protocol Categories

### Server Protocols (Self-Hosted)

These connect to servers you control. You provide the hostname, port, and credentials.

- **FTP** -- Traditional unencrypted file transfer. Suitable for legacy servers and shared hosting on trusted networks.
- **FTPS** -- FTP secured with TLS/SSL. Supports both Explicit (STARTTLS on port 21) and Implicit (port 990) modes. AeroFTP detects TLS downgrade attempts and warns the user.
- **SFTP** -- Secure file transfer over SSH. The recommended choice for self-hosted servers. Supports password and SSH key authentication with TOFU host key verification.
- **WebDAV** -- HTTP-based file access over HTTPS. Used by Nextcloud, Seafile, and many NAS devices. Supports Basic and Digest authentication.
- **S3-Compatible** -- Object storage using the S3 API. Works with AWS, Wasabi, Backblaze B2, and any S3-compatible endpoint.
- **OpenStack Swift** -- Object storage using the OpenStack Swift API. Works with Blomp, OVH, Rackspace, and any Swift-compatible endpoint. Authenticates via Keystone v3 or TempAuth.

### OAuth Cloud Providers

These authenticate through the provider's OAuth2 PKCE flow. AeroFTP opens a browser window for authorization and stores tokens securely in the vault.

- **Google Drive**, **Dropbox**, **OneDrive**, **Box**, **pCloud**, **Zoho WorkDrive**, **Koofr**

### Direct Auth Cloud Providers

These use API keys, email/password, session tokens, or personal access tokens directly. No browser-based OAuth flow is required.

- **MEGA** -- Zero-knowledge E2E encryption with client-side AES.
- **Azure Blob** -- Enterprise object storage with HMAC signing or SAS tokens.
- **4shared** -- OAuth 1.0 with HMAC-SHA1 signing (RFC 5849).
- **Filen** -- E2E encrypted with PBKDF2 key derivation and AES-256-GCM. Optional 2FA.
- **Internxt** -- E2E encrypted with PBKDF2 + BIP39 mnemonic and AES-256-CTR.
- **kDrive** -- Infomaniak cloud storage with API token authentication.
- **Jottacloud** -- Norwegian cloud with Personal Login Token authentication.
- **Drime Cloud** -- 20 GB secure cloud storage (Bedrive platform) with API token authentication. Supports file versioning, server-side copy, and share links.
- **FileLu** -- API key authentication with file password protection and privacy controls.
- **Yandex Disk** -- OAuth2 token-based access to Yandex cloud storage.
- **OpenDrive** -- Session-based authentication with MD5 checksums and zlib compression.

### Developer Platform

- **GitHub** -- Repository file browser and manager. Supports OAuth2, Personal Access Tokens (PAT), and GitHub App `.pem` key authentication. Browse, download, upload, and delete files across unlimited repositories.

## WebDAV Presets

AeroFTP includes pre-configured WebDAV presets for popular services:

| Service | Endpoint | Default Port | Free Storage | Notes |
|---------|----------|-------------|-------------|-------|
| Nextcloud | `your-server.com/remote.php/dav/files/USERNAME/` | 443 | Varies (self-hosted) | Most popular self-hosted cloud |
| Seafile | `your-server.com/seafdav` | 443 | Varies (self-hosted) | Via SeafDAV extension |
| CloudMe | `webdav.cloudme.com` | 443 | 3 GB | Swedish cloud storage |
| Jianguoyun | `dav.jianguoyun.com/dav` | 443 | 2 GB | Chinese market (Nutstore) |
| InfiniCLOUD | `webdav.teracloud.jp/dav/` | 443 | 20 GB | Japanese cloud by InfiniCloud |

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

## Feature Matrix

### Trash Management

Not all providers expose a trash/recycle bin API. The following table shows which protocols support trash operations in AeroFTP:

| Protocol | List Trash | Restore | Permanent Delete | Empty Trash |
|----------|-----------|---------|-----------------|-------------|
| Google Drive | Yes | Yes | Yes | No |
| Dropbox | Yes | Yes | Yes | No |
| OneDrive | Yes | Yes | Yes | No |
| Box | Yes | Yes | Yes | No |
| pCloud | Yes | Yes | Yes | Yes |
| Zoho WorkDrive | Yes | Yes | Yes | No |
| Koofr | Yes | Yes | No | Yes |
| MEGA | Yes | Yes | Yes | No |
| kDrive | Yes | Yes | Yes | Yes |
| Jottacloud | Yes | Yes | Yes | No |
| Internxt | Yes | No | No | No |
| FileLu | Yes | Yes | Yes | No |
| Yandex Disk | Yes | Yes | Yes | Yes |
| OpenDrive | Yes | Yes | Yes | Yes |
| All others | No | No | No | No |

### File Versioning

| Protocol | List Versions | Download Version | Restore Version |
|----------|--------------|-----------------|-----------------|
| Google Drive | Yes | Yes | Yes |
| Dropbox | Yes | Yes | Yes |
| OneDrive | Yes | Yes | Yes |
| Box | Yes | Yes | Yes |
| pCloud | Yes | Yes | Yes |
| Zoho WorkDrive | Yes | Yes | Yes |
| Koofr | Yes | Yes | Yes |
| kDrive | Yes | Yes | Yes |
| Drime Cloud | Yes | Yes | Yes |
| S3-Compatible | Yes (if bucket versioning enabled) | Yes | Yes |
| All others | No | No | No |

### Share Links

| Protocol | Create Share Link | Expiring Links | Password-Protected |
|----------|------------------|----------------|-------------------|
| Google Drive | Yes | No | No |
| Dropbox | Yes | Yes (Pro) | Yes (Pro) |
| OneDrive | Yes | Yes | Yes |
| Box | Yes | Yes | Yes |
| pCloud | Yes | No | No |
| Zoho WorkDrive | Yes | No | No |
| Koofr | Yes | No | No |
| Filen | Yes | No | No |
| kDrive | Yes | No | No |
| Jottacloud | Yes | No | No |
| Drime Cloud | Yes | No | No |
| FileLu | Yes | No | Yes |
| Yandex Disk | Yes | No | No |
| OpenDrive | Yes | Yes (expiring) | No |
| S3-Compatible | Pre-signed URLs | Yes (time-limited) | No |
| Azure Blob | SAS tokens | Yes (time-limited) | No |
| MEGA | Yes | No | No |
| WebDAV (Nextcloud) | Yes | No | No |
| GitHub | Permalink URLs | No | No |
| All others | No | No | No |

### Tags and Labels

| Protocol | Add Tags | Remove Tags | List Tags |
|----------|---------|------------|-----------|
| Box | Yes | Yes | Yes |
| Dropbox | Yes | Yes | Yes |
| Zoho WorkDrive | Yes (team labels) | Yes | Yes |
| Google Drive | Yes (properties) | Yes | Yes |
| All others | No | No | No |

## Integration Compatibility

### AeroSync

AeroSync supports bidirectional synchronization across all protocols. AeroCloud background sync classifies protocols by reliability: 11 stable, 8 beta, 2 alpha -- with maturity badges visible in the setup wizard.

AeroSync features available across all protocols:

- Bidirectional and unidirectional sync
- Conflict resolution (keep local, keep remote, keep newer, skip)
- Sync profiles (Mirror, Two-way, Backup, Pull, Remote Backup)
- Transfer journal with checkpoint/resume
- Post-transfer verification (size, mtime, SHA-256)
- Configurable retry with exponential backoff
- Bandwidth throttling
- Dry-run mode with export

### CLI Support

All 25 protocols are accessible from the `aeroftp-cli` command-line tool using URL-based connections:

```bash
aeroftp-cli ls sftp://user@myserver.com/path/
aeroftp-cli get s3://mybucket/file.txt
aeroftp-cli put ftp://user@host/upload/ ./local-file.txt
aeroftp-cli sync ftp://user@host/ ./local-dir/
aeroftp-cli tree webdav://user@nextcloud.example.com/remote.php/dav/files/user/
```

The CLI supports 31 commands (`connect`, `ls`, `get`, `put`, `mkdir`, `rm`, `mv`, `cp`, `link`, `edit`, `cat`, `head`, `tail`, `touch`, `hashsum`, `check`, `stat`, `find`, `df`, `about`, `dedupe`, `sync`, `tree`, `batch`, `rcat`, `alias`, `agent`, `completions`, `profiles`, `ai-models`, `agent-info`), batch scripting via `.aeroftp` files, glob pattern transfers, and `--json` output for automation.

### AeroAgent server_exec

AeroAgent can execute file operations on saved servers through the `server_exec` tool. This tool resolves credentials from the vault in Rust and never exposes passwords to the AI model.

| Category | Protocols | server_exec Support |
|----------|-----------|-------------------|
| Server Protocols | FTP, FTPS, SFTP, WebDAV, S3, Swift | Yes |
| Direct Auth Cloud | MEGA, Azure, 4shared, Filen, Internxt, kDrive, Jottacloud, Drime Cloud, FileLu, Yandex Disk, OpenDrive | Yes |
| OAuth Cloud | Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Koofr | Blocked (requires browser OAuth) |
| Developer | GitHub | Blocked (requires browser OAuth or manual PAT) |

The `server_exec` tool supports 10 operations: `ls`, `cat`, `get`, `put`, `mkdir`, `rm`, `mv`, `stat`, `find`, and `df`. Server names are matched with fuzzy matching against saved server profiles.

---

> Last updated: 2026-03-30
