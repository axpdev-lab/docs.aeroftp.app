# Protocol Overview

> Verified against AeroFTP v4.2.5 source, 2026-10-26. Provider plan figures are snapshots; confirm current terms with the provider.

AeroFTP organizes integrations on three tiers, so what you see in the catalog is precise rather than vague:

1. **7 transport protocols** - FTP, FTPS, SFTP, WebDAV, S3, Azure Blob, OpenStack Swift. Native wire-level support, implemented in Rust with full streaming.
2. **26 native provider integrations** - dedicated OAuth2 / API key / SDK code paths per provider (Backblaze B2, Box, Cloudinary, Drime Cloud, Dropbox, FileLu, Filen, 4shared, GitHub, GitLab, Google Drive, ImageKit, Immich, Internxt, Jottacloud, kDrive, Koofr, MEGA, OneDrive, OpenDrive, pCloud, Proton Drive, Twake Drive, Uploadcare, Yandex Disk, Zoho WorkDrive). Available sharing, server-side copy, chunking and sync capabilities depend on the backend and selected connection mode.
3. **47 pre-configured presets** - server URL, port, base path, password-generation deep-link auto-filled for compatible services on top of the protocols above. Visible in the Discover catalog (S3-compatible endpoints, WebDAV-compatible servers, SourceForge, etc.).

AeroFTP-managed credentials are encrypted in the Universal Vault; its passphrase protection depends on the selected [key mode](/security/credentials). Externally managed sessions, including official Proton CLI sessions, remain in the external client's own credential storage. The GUI, CLI, AeroAgent and MCP reuse the `StorageProvider` abstraction. A shared trait does not make every provider feature available on every surface.

## Protocol Comparison

### Transport Protocols (7)

| # | Protocol | Auth Method | Encryption | Free Storage |
|---|----------|-------------|------------|-------------|
| 1 | [FTP](ftp.md) | Password | None | N/A (self-hosted) |
| 2 | [FTPS](ftp.md) | Password | TLS/SSL (Explicit/Implicit) | N/A (self-hosted) |
| 3 | [SFTP](sftp.md) | Password / SSH Key | SSH | N/A (self-hosted) |
| 4 | [WebDAV](webdav.md) | Password (Basic + Digest) | HTTPS | Varies by provider |
| 5 | [S3-Compatible](s3.md) | Access Key + Secret | HTTPS + SSE | Varies by provider |
| 6 | [Azure Blob](azure.md) | HMAC / SAS Token | HTTPS + SSE | Pay-as-you-go |
| 7 | OpenStack Swift | Username + Password (Keystone v3) | HTTPS | Varies by provider |

### Native Provider Integrations (Browser Authorization)

These integrations use provider authorization or an existing authorized token, as identified in each row. For browser-based flows, AeroFTP opens the provider's authorization page and stores the resulting credentials in the encrypted vault.

| Provider | Auth Method | Encryption | Free Storage |
|----------|-------------|------------|-------------|
| [Google Drive](/providers/google-drive) | OAuth2 PKCE | HTTPS + at-rest | 15 GB |
| [Dropbox](/providers/dropbox) | OAuth2 PKCE | HTTPS + at-rest | 2 GB |
| [OneDrive](/providers/onedrive) | OAuth2 PKCE | HTTPS + at-rest | 5 GB |
| [Box](/providers/box) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [pCloud Drive](/providers/pcloud) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [Zoho WorkDrive](/providers/zoho) | OAuth2 PKCE (8 regional endpoints) | HTTPS + at-rest | Team plan |
| [Koofr](/providers/koofr) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [Yandex Disk](/providers/yandex) | OAuth2 token; optional browser PKCE with your own client | HTTPS | 5 GB |
| [Internxt](/providers/internxt) | OAuth2 PKCE + zero-knowledge | Client-side AES-256-CTR | 1 GB |
| [4shared](/providers/4shared) | OAuth 1.0 (HMAC-SHA1) | HTTPS | 15 GB |
| [Twake Drive](/providers/twake) | OAuth2 PKCE on your own instance | HTTPS | Self-hosted |

### Native Provider Integrations (API Key / Token / Session)

Authentication via passwords, API keys, session tokens or personal access tokens, with provider-specific sign-in. Proton native mode uses browser sign-in; official CLI mode uses the session managed by that external client.

| Provider | Auth Method | Encryption | Free Storage |
|----------|-------------|------------|-------------|
| [Proton Drive](/providers/proton-drive) | Browser sign-in (native), or official CLI session | Client-side encryption | See provider page |
| [MEGA](/providers/mega) | Password (Native API or MEGAcmd) | Client-side AES | 20 GB |
| [Filen](/providers/filen) | Password (PBKDF2) + optional 2FA | Client-side AES-256-GCM | 10 GB |
| [kDrive](/providers/kdrive) | API Token (Bearer) | HTTPS | 15 GB |
| [Jottacloud](/providers/jottacloud) | Personal Login Token (auto-refresh 60s pre-expiry) | HTTPS | 5 GB |
| [Drime Cloud](/providers/drime) | API Token (Bearer) | HTTPS | 20 GB |
| [FileLu](/providers/filelu) | API Key | HTTPS | 1 GB |
| [OpenDrive](/providers/opendrive) | Session Auth (user/pass) | HTTPS | 5 GB |

### Native Provider Integrations (Developer Platforms)

| Provider | Auth Method | Encryption | Notes |
|----------|-------------|------------|-------|
| [GitHub](/providers/github) | OAuth2 / PAT / App `.pem` (vaulted, AES-256-GCM) | HTTPS | Repository as filesystem; every upload/delete is a real Git commit |
| [GitLab](/providers/gitlab) | PAT | HTTPS | Repository as filesystem |
| [Immich](/providers/immich) | API Key (`x-api-key`) | HTTPS | Self-hosted photo library; media-only writes |

## Protocol Categories

### Transport Protocols (Self-Hosted)

These connect to servers or buckets you control. You provide the hostname, port, and credentials.

- **FTP** - Traditional unencrypted file transfer. Suitable for legacy servers and shared hosting on trusted networks.
- **FTPS** - FTP secured with TLS/SSL. Supports both Explicit (STARTTLS on port 21) and Implicit (port 990) modes. AeroFTP detects TLS downgrade attempts and warns the user.
- **SFTP** - Secure file transfer over SSH. The recommended choice for self-hosted servers. Supports password and SSH key authentication with TOFU host key verification. Eligible for **delta sync** via [AeroRsync](/features/aerorsync) when key authentication or a saved password and remote `rsync` are available.
- **WebDAV** - HTTP-based file access over HTTPS. Used by Nextcloud, Seafile, and many NAS devices. Supports Basic and Digest authentication.
- **S3** - Object storage using the S3 API. Works with AWS, Wasabi, Backblaze B2, and any S3-compatible endpoint.
- **Azure Blob** - Enterprise object storage with HMAC signing or SAS tokens.
- **OpenStack Swift** - Object storage using the OpenStack Swift API. Works with Blomp, OVH, Rackspace, and any Swift-compatible endpoint, with one condition since v4.1.8: if authentication used HTTPS, a catalog that points object storage at a plain-HTTP host is refused rather than followed silently, because the storage endpoint carries the account's bearer token. Blomp connects because its preset declares that exception. Authenticates via Keystone v3 or TempAuth.

### Native Provider Integrations

Each native provider has a dedicated implementation. Consult its page and runtime capabilities for sharing, server-side copy, chunking, trash, versioning and labels. Delta via rsync is an SFTP capability, not a universal native-provider feature.

**OAuth2 PKCE flow:** Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Koofr, Yandex Disk, Internxt, Twake Drive.
**Yandex Disk:** accepts an OAuth access token; the optional browser flow uses the shared PKCE implementation with your configured client ID and secret.
**OAuth 1.0 (HMAC-SHA1):** 4shared (RFC 5849).
**Direct auth (API key / token / session):** MEGA, Filen, kDrive, Jottacloud, Drime Cloud, FileLu, OpenDrive.
**Developer platforms:** GitHub, GitLab, Immich.

**SourceForge** uses an existing FTP/SFTP transport preset rather than a native provider integration.

Highlights:

- **MEGA** - Zero-knowledge E2E encryption with client-side AES.
- **Filen** - E2E encrypted with PBKDF2 key derivation and AES-256-GCM. Optional 2FA.
- **Internxt** - E2E encrypted with PBKDF2 + BIP39 mnemonic and AES-256-CTR.
- **Drime Cloud** - 20 GB secure cloud storage with file versioning, server-side copy, and share links.
- **FileLu** - File/folder password protection, privacy controls, server-side clone, trash management, remote URL upload.
- **GitHub** - Repository as filesystem - every upload/delete is a real Git commit. PAT keys are encrypted (AES-256-GCM) in the vault on import. Token expiry badges and protected-branch PR creation.

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
| Alibaba OSS | `oss-{region}.aliyuncs.com` | 5 GB (China regions) | Asia-optimized |
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

AeroSync supports bidirectional synchronization across all 7 transport protocols and the 20+ native provider integrations. AeroCloud background sync classifies providers by reliability through maturity badges visible in the setup wizard.

AeroSync features available across the entire surface:

- Bidirectional and unidirectional sync (Mirror, Two-Way, Backup, Pull, Remote Backup)
- Conflict resolution (keep local, keep remote, keep newer, skip, rename)
- Transfer journal with checkpoint/resume
- Post-transfer verification (size, mtime, SHA-256)
- Configurable retry with exponential backoff
- Bandwidth throttling
- Dry-run mode with JSON / CSV export
- **Delta sync via [AeroRsync](/features/aerorsync)** - eligible SFTP sessions transfer only the bytes that differ; cross-OS first-class on Linux/macOS/Windows since v3.6.1

### CLI support

Saved profiles let the CLI resolve supported server and provider credentials internally:

```bash
aeroftp-cli profiles --json
aeroftp-cli ls --profile "My SFTP" /path/ --json
aeroftp-cli get --profile "My S3" /file.txt ./file.txt
aeroftp-cli put --profile "My FTPS" ./local-file.txt /upload/local-file.txt
aeroftp-cli sync --profile "My FTPS" ./local-dir/ /remote-dir/ --direction upload --dry-run --json
aeroftp-cli tree --profile "My Nextcloud" / -d 3
```

The command catalog, batch `.aeroftp-script` format, JSON output and semantic exit statuses are documented in [CLI Commands](/cli/commands) and [Batch scripting](/cli/batch-scripting). Run `aeroftp-cli agent-info --json` for discovery from the installed version.

### AeroAgent saved-server operations

`server_exec` resolves saved profiles in Rust and exposes the read operations `ls`, `cat`, `stat`, `find` and `df`. Saved browser-authorized providers can work once their supported session exists in the vault; browser authorization is not a blanket ban on using them headlessly afterward. Reauthorization can still need the human.

Use dedicated remote upload, download, rename, mkdir and delete tools for their supported mutations, and inspect the approval policy for that entry point. See [AeroAgent](/features/aeroagent), [Agent orchestration](/features/agent-orchestration) and [MCP](/mcp/overview).
