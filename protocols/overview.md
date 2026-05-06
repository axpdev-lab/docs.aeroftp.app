# Protocol Overview

> Last updated: 2026-05-06 (v3.7.2)

AeroFTP organizes integrations on three tiers, so what you see in the catalog is precise rather than vague:

1. **7 transport protocols** - FTP, FTPS, SFTP, WebDAV, S3, Azure Blob, OpenStack Swift. Native wire-level support, implemented in Rust with full streaming.
2. **22+ native provider integrations** - dedicated OAuth2 / API key / SDK code paths per provider (Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, Filen, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud, FileLu, Yandex Disk, OpenDrive, 4shared, Drime Cloud, Google Photos, GitHub, GitLab, Immich, ImageKit, Uploadcare). Each provider's specific features (sharing, native delta sync, server-side copy, large-file chunking) are first-class instead of best-effort.
3. **40+ pre-configured presets** - server URL, port, base path, password-generation deep-link auto-filled for compatible services on top of the protocols above. Visible in the Discover catalog (S3-compatible endpoints, WebDAV-compatible servers, SourceForge, etc.).

All credentials are encrypted in the AeroFTP Universal Vault (AES-256-GCM + Argon2id). Every integration plugs into AeroSync, AeroAgent, the CLI and the MCP server through the same `StorageProvider` trait.

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

### Native Provider Integrations (OAuth2 PKCE)

Authenticated through the provider's OAuth2 PKCE flow. AeroFTP opens a browser window for authorization and stores tokens securely in the encrypted vault.

| Provider | Auth Method | Encryption | Free Storage |
|----------|-------------|------------|-------------|
| [Google Drive](google-drive.md) | OAuth2 PKCE | HTTPS + at-rest | 15 GB |
| [Dropbox](dropbox.md) | OAuth2 PKCE | HTTPS + at-rest | 2 GB |
| [OneDrive](onedrive.md) | OAuth2 PKCE | HTTPS + at-rest | 5 GB |
| [Box](box.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [pCloud](pcloud.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [Zoho WorkDrive](zoho.md) | OAuth2 PKCE (8 regional endpoints) | HTTPS + at-rest | Team plan |
| [Koofr](koofr.md) | OAuth2 PKCE | HTTPS + at-rest | 10 GB |
| [Yandex Disk](yandex.md) | OAuth2 Token | HTTPS | 5 GB |
| [Internxt](internxt.md) | OAuth2 PKCE + zero-knowledge | Client-side AES-256-CTR | 1 GB |
| [4shared](4shared.md) | OAuth 1.0 (HMAC-SHA1) | HTTPS | 15 GB |

### Native Provider Integrations (API Key / Token / Session)

Direct authentication via API keys, session tokens, or personal access tokens. No browser-based OAuth flow required.

| Provider | Auth Method | Encryption | Free Storage |
|----------|-------------|------------|-------------|
| [MEGA](mega.md) | Password (Native API or MEGAcmd) | Client-side AES | 20 GB |
| [Filen](filen.md) | Password (PBKDF2) + optional 2FA | Client-side AES-256-GCM | 10 GB |
| [kDrive](kdrive.md) | API Token (Bearer) | HTTPS | 15 GB |
| [Jottacloud](jottacloud.md) | Personal Login Token (auto-refresh 60s pre-expiry) | HTTPS | 5 GB |
| [Drime Cloud](/providers/drime) | API Token (Bearer) | HTTPS | 20 GB |
| [FileLu](filelu.md) | API Key | HTTPS | 1 GB |
| [OpenDrive](opendrive.md) | Session Auth (user/pass) | HTTPS | 5 GB |

### Native Provider Integrations (Developer Platforms)

| Provider | Auth Method | Encryption | Notes |
|----------|-------------|------------|-------|
| [GitHub](github.md) | OAuth2 / PAT / App `.pem` (vaulted, AES-256-GCM) | HTTPS | Repository as filesystem; every upload/delete is a real Git commit |
| [GitLab](/providers/gitlab) | PAT | HTTPS | Repository as filesystem |
| [Immich](/providers/immich) | API Key (`x-api-key`) | HTTPS | Self-hosted photo library; media-only writes |

## Protocol Categories

### Transport Protocols (Self-Hosted)

These connect to servers or buckets you control. You provide the hostname, port, and credentials.

- **FTP** - Traditional unencrypted file transfer. Suitable for legacy servers and shared hosting on trusted networks.
- **FTPS** - FTP secured with TLS/SSL. Supports both Explicit (STARTTLS on port 21) and Implicit (port 990) modes. AeroFTP detects TLS downgrade attempts and warns the user.
- **SFTP** - Secure file transfer over SSH. The recommended choice for self-hosted servers. Supports password and SSH key authentication with TOFU host key verification. Eligible for **delta sync** via [AeroRsync](/features/aerorsync) when key-auth + remote `rsync` are present.
- **WebDAV** - HTTP-based file access over HTTPS. Used by Nextcloud, Seafile, and many NAS devices. Supports Basic and Digest authentication.
- **S3** - Object storage using the S3 API. Works with AWS, Wasabi, Backblaze B2, and any S3-compatible endpoint.
- **Azure Blob** - Enterprise object storage with HMAC signing or SAS tokens.
- **OpenStack Swift** - Object storage using the OpenStack Swift API. Works with Blomp, OVH, Rackspace, and any Swift-compatible endpoint. Authenticates via Keystone v3 or TempAuth.

### Native Provider Integrations

Each native provider has its own dedicated code path so its specific features (sharing, native delta sync, server-side copy, large-file chunking, trash management, versioning, labels) are first-class instead of best-effort.

**OAuth2 PKCE flow:** Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Koofr, Yandex Disk, Internxt.
**OAuth 1.0 (HMAC-SHA1):** 4shared (RFC 5849).
**Direct auth (API key / token / session):** MEGA, Filen, kDrive, Jottacloud, Drime Cloud, FileLu, OpenDrive.
**Developer platforms:** GitHub, GitLab, Immich, SourceForge.

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

### CLI Support

All 7 transport protocols and 20+ native provider integrations are accessible from the `aeroftp-cli` command-line tool using either direct URL connections or saved vault profiles:

```bash
aeroftp-cli ls sftp://user@myserver.com/path/
aeroftp-cli get s3://mybucket/file.txt
aeroftp-cli put ftp://user@host/upload/ ./local-file.txt
aeroftp-cli sync ftp://user@host/ ./local-dir/
aeroftp-cli tree webdav://user@nextcloud.example.com/remote.php/dav/files/user/
aeroftp-cli ls --profile "My Google Drive" /     # OAuth provider via vault profile
```

The CLI ships **49+ subcommands** including: connection (`connect`, `ls`, `get`, `put`, `pget`, `mkdir`, `rm`, `mv`, `cp`, `cat`, `head`, `tail`, `touch`, `hashsum`, `check`, `stat`, `find`, `df`, `about`, `tree`, `link`, `edit`, `rcat`), sync (`sync`, `sync --watch`, `reconcile`, `sync-doctor`, `dedupe`, `cleanup`), cross-profile (`transfer`, `transfer-doctor`), benchmarking (`speed`, `speed-compare`), local servers (`serve http/webdav/ftp/sftp`), filesystem (`mount`, `ncdu`, `crypt`), automation (`batch`, `daemon`, `jobs`, `alias`, `completions`), import (`import rclone/winscp/filezilla`), agent surface (`agent`, `mcp`, `agent-bootstrap`, `agent-connect`, `agent-info`, `ai-models`, `profiles`).

Batch scripting via `.aeroftp` files, glob pattern transfers, structured `--json` output, semantic exit codes (0&ndash;11), and `NO_COLOR` compliance. See **[CLI Commands](/cli/commands)** for the full reference.

### AeroAgent server_exec

AeroAgent can execute file operations on saved servers through the `server_exec` tool. This tool resolves credentials from the vault in Rust and never exposes passwords to the AI model.

| Category | Protocols | server_exec Support |
|----------|-----------|-------------------|
| Server Protocols | FTP, FTPS, SFTP, WebDAV, S3, Swift | Yes |
| Direct Auth Cloud | MEGA, Azure, 4shared, Filen, Internxt, kDrive, Jottacloud, Drime Cloud, FileLu, Yandex Disk, OpenDrive | Yes |
| OAuth Cloud | Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Koofr | Blocked (requires browser OAuth) |
| Developer | GitHub, SourceForge | GitHub: Blocked (requires browser OAuth or manual PAT). SourceForge: Yes (via SFTP) |

The `server_exec` tool supports 10 operations: `ls`, `cat`, `get`, `put`, `mkdir`, `rm`, `mv`, `stat`, `find`, and `df`. Server names are matched with fuzzy matching against saved server profiles.

---

> Last updated: 2026-05-06 - AeroFTP v3.7.2
