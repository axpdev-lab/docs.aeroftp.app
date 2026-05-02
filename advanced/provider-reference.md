# Provider Reference

Technical reference for all 22 storage protocols supported by AeroFTP. Protocols are grouped by connection type.

## Server Protocols

Direct server connections using standard protocols.

| Protocol | Rust Crate | Auth Method | Default Port | TLS |
|----------|-----------|-------------|-------------|-----|
| FTP | suppaftp 8 | Username/Password | 21 | Optional (FTPS) |
| FTPS | suppaftp 8 | Username/Password | 21 / 990 | Explicit / Implicit |
| SFTP | russh 0.57 | Password / Key / Agent | 22 | SSH (built-in) |
| WebDAV | reqwest 0.13 | Username/Password | 443 | HTTPS |
| S3-Compatible | reqwest 0.13 | Access Key + Secret (HMAC-SHA256) | 443 | HTTPS |

### FTP / FTPS

| Feature | Details |
|---------|---------|
| API | RFC 959 (FTP), RFC 4217 (FTPS) |
| Commands | MLSD, MLST, FEAT, PASV, EPSV |
| TLS modes | None, Explicit (STARTTLS), Implicit, ExplicitIfAvailable |
| Upload | Streaming via `STOR` |
| Special | TLS downgrade detection with security warning |

### SFTP

| Feature | Details |
|---------|---------|
| API | SSH File Transfer Protocol v3 |
| Auth | Password, private key (RSA/Ed25519/ECDSA), SSH agent |
| Upload | Streaming |
| Special | TOFU host key verification (PuTTY-style dialog), symlink directory detection |

### WebDAV

| Feature | Details |
|---------|---------|
| API | RFC 4918 |
| XML parser | quick-xml 0.39 (event-based) |
| Upload | Streaming `PUT` |
| Presets | Nextcloud, Seafile, CloudMe, custom |
| Special | Root boundary enforcement (`initial_path`) |

### S3-Compatible

| Feature | Details |
|---------|---------|
| API | AWS S3 REST API |
| Auth | AWS Signature v4 (HMAC-SHA256) |
| Upload | Multipart (5 MB parts) |
| Pagination | `continuation-token` loop |
| Presets | AWS, Wasabi, DigitalOcean Spaces, Backblaze B2, Cloudflare R2, Storj, Alibaba OSS, Tencent COS, Yandex Object Storage, MinIO, custom |
| Special | R2 Account ID field with auto-computed endpoint |

## OAuth Cloud Providers

Cloud storage services using OAuth2 for authentication.

| Provider | Auth | Free Tier | API Base URL |
|----------|------|-----------|-------------|
| Google Drive | OAuth2 PKCE | 15 GB | `https://www.googleapis.com/drive/v3` |
| Dropbox | OAuth2 PKCE | 2 GB | `https://api.dropboxapi.com/2` |
| OneDrive | OAuth2 PKCE | 5 GB | `https://graph.microsoft.com/v1.0` |
| Box | OAuth2 PKCE | 10 GB | `https://api.box.com/2.0` |
| pCloud | OAuth2 PKCE | 10 GB | `https://api.pcloud.com` / `https://eapi.pcloud.com` |
| Zoho WorkDrive | OAuth2 | 5 GB | `https://www.zohoapis.{region}/workdrive/api/v1` |
| kDrive | OAuth2 | 15 GB | `https://api.infomaniak.com/3/drive/{drive_id}` |
| Koofr | OAuth2 PKCE | 10 GB | `https://app.koofr.net/api/v2` |
| Yandex Disk | OAuth2 | 10 GB | `https://cloud-api.yandex.net/v1/disk` |

### Google Drive

| Feature | Details |
|---------|---------|
| Upload | Resumable (multipart for small files) |
| Trash | Full lifecycle (list, restore, permanent delete) |
| Versions | List, download, restore |
| Share links | Viewer/editor permissions |
| Special | Starring, comments, custom properties, description |
| Rate limit | 12,000 queries / 100 seconds |

### Dropbox

| Feature | Details |
|---------|---------|
| Upload | Chunked sessions for files >150 MB |
| Trash | List, restore, permanent delete |
| Special | Tags (full CRUD), content hash |
| Rate limit | App-based, burst-friendly |

### OneDrive

| Feature | Details |
|---------|---------|
| Upload | Resumable for files >4 MB (auto-threshold) |
| Trash | Recycle bin with restore and permanent delete |
| Versions | List, download, restore |
| Share links | View/edit, expiry date |
| Rate limit | Throttled via `Retry-After` header |

### Box

| Feature | Details |
|---------|---------|
| Upload | Chunked for files >50 MB |
| Trash | Full lifecycle |
| Special | Comments, collaborations, tags (inline chips), watermark (Enterprise), folder locks (Enterprise), PRO badge system |
| Rate limit | 1,000 API calls / minute |

### pCloud

| Feature | Details |
|---------|---------|
| Upload | Multipart |
| Regions | US (`api.pcloud.com`) and EU (`eapi.pcloud.com`) |
| Share links | Download links with optional expiry |
| Quota | Storage quota reporting |

### Zoho WorkDrive

| Feature | Details |
|---------|---------|
| Regions | US, EU, IN, AU, JP, UK, CA, SA (8 endpoints) |
| Upload | Multipart |
| Trash | Restore and permanent delete |
| Labels | Team-level color labels, applied per-file |
| Versions | List, download, restore/promote |
| Special | Team ID auto-detection |

### kDrive

| Feature | Details |
|---------|---------|
| Upload | Multipart |
| Pagination | Cursor-based |
| Special | Drive ID required, Infomaniak account |

### Koofr

| Feature | Details |
|---------|---------|
| Upload | Multipart |
| Auth | OAuth2 PKCE |
| Trash | List, restore, empty |
| Special | EU-based (Slovenia), 10 GB free |

### Yandex Disk

| Feature | Details |
|---------|---------|
| Upload | URL-based (get upload URL, then PUT) |
| Trash | List, restore, permanent delete, empty |
| Share links | Public links |
| Special | OAuth client ID/Secret configurable in Settings |

## API Key / Token Providers

Cloud storage services using API keys, bearer tokens, or session-based authentication.

| Provider | Auth | Free Tier | API Base URL |
|----------|------|-----------|-------------|
| MEGA | Email/Password (AES-ECB) | 20 GB | `https://g.api.mega.co.nz` |
| 4shared | OAuth 1.0 (HMAC-SHA1) | 15 GB | `https://api.4shared.com/v1_2` |
| Filen | Email/Password | 10 GB | `https://gateway.filen.io` |
| Internxt | OAuth2 PKCE | 1 GB | `https://drive.internxt.com` |
| FileLu | API Key | 10 GB | `https://filelu.com/api` |
| OpenDrive | Session (login) | 5 GB | `https://dev.opendrive.com/api/v1` |
| Jottacloud | Username/Password | 5 GB | `https://jottacloud.com/jfs` |

### MEGA

| Feature | Details |
|---------|---------|
| Auth | Email + password-derived AES key (AES-128-ECB) |
| Upload | Direct encrypted upload |
| Encryption | Client-side E2E encryption |
| Special | Obfuscated file/folder IDs |

### 4shared

| Feature | Details |
|---------|---------|
| Auth | OAuth 1.0 (HMAC-SHA1, RFC 5849) |
| Rust module | `oauth1.rs` (reusable) |
| Upload | Multipart |
| Pagination | ID-based |
| Special | Custom `string_or_i64` deserializer for Long IDs |

### Filen

| Feature | Details |
|---------|---------|
| Auth | Email/Password + optional 2FA |
| Encryption | Client-side E2E encryption |
| Upload | Chunked encrypted upload |
| 2FA | Always sends `twoFactorCode` field (`"XXXXXX"` default when not set) |

### Internxt

| Feature | Details |
|---------|---------|
| Auth | OAuth2 PKCE |
| Encryption | Zero-knowledge E2E |
| Upload | Encrypted chunks |
| Special | ~800 lines Rust implementation |

### FileLu

| Feature | Details |
|---------|---------|
| Auth | API Key |
| Upload | Multipart |
| Trash | List deleted, restore file/folder, permanent delete |
| Special | 10 extra commands: `set_file_password`, `set_file_privacy`, `clone_file`, `set_folder_password`, `set_folder_settings`, `list_deleted_files`, `restore_deleted_file`, `restore_deleted_folder`, `permanent_delete_file`, `remote_url_upload` |
| Presets | Also accessible via FTP, FTPS, WebDAV, S3 |

### OpenDrive

| Feature | Details |
|---------|---------|
| Auth | Session-based (login endpoint) |
| Upload | Direct upload |
| Trash | List, restore, permanent delete |
| Checksums | MD5 |
| Compression | zlib |
| Share links | Expiring public links |
| Special | ~1562 lines Rust implementation |

### Jottacloud

| Feature | Details |
|---------|---------|
| Auth | Username/Password |
| Upload | Multipart XML-based |
| Special | Norwegian provider, XML API |

## Special Protocols

| Provider | Auth | API Base URL | Purpose |
|----------|------|-------------|---------|
| Azure Blob | SAS Token / Connection String | `https://{account}.blob.core.windows.net` | Enterprise blob storage |
| GitHub | Personal Access Token | `https://api.github.com` | Repository file access |

### Azure Blob Storage

| Feature | Details |
|---------|---------|
| Auth | Shared Access Signature (SAS) or Connection String |
| XML parser | quick-xml 0.39 (event-based) |
| Upload | Block blobs (PUT) |
| Pagination | `NextMarker` loop |
| Special | Container-level access |

### GitHub

| Feature | Details |
|---------|---------|
| Auth | Personal Access Token (PAT) |
| API | GitHub REST API v3 |
| Upload | Base64-encoded content via Contents API |
| Special | Repository and branch selection, commit-based versioning |

## StorageProvider Trait

All protocols implement a unified `StorageProvider` trait with 18 methods:

| Method | Description |
|--------|-------------|
| `connect()` | Establish connection |
| `disconnect()` | Close connection |
| `list()` | List directory contents |
| `cd()` / `cd_up()` | Navigate directories |
| `mkdir()` | Create directory |
| `delete()` | Delete file or directory |
| `rename()` | Rename entry |
| `download_file()` | Download with progress |
| `upload_file()` | Upload with progress |
| `stat()` | Get file metadata |
| `search()` | Search for files |
| `move_file()` | Move file to different path |
| `list_trash()` | List trash contents |
| `restore_from_trash()` | Restore trashed item |
| `permanent_delete()` | Permanently delete from trash |
| `create_share_link()` | Generate sharing link |
| `get_storage_quota()` | Query storage usage |
| `list_versions()` / `download_version()` / `restore_version()` | Version management |

## Dependency Summary

| Crate | Version | Used By |
|-------|---------|---------|
| suppaftp | 8.0.3 (pinned) | FTP, FTPS |
| russh | 0.57 | SFTP |
| ssh2 | 0.9 (vendored OpenSSL) | SFTP upload backend (some embedded servers) |
| reqwest | 0.13 | All HTTP-based protocols |
| quick-xml | 0.39 | WebDAV, Azure Blob, S3 |
| tokio-util | 0.7 | Streaming I/O |
| secrecy | 0.8 | All credential handling |

::: warning suppaftp Pin
`suppaftp` is pinned to `=8.0.3` (the latest 8.0.x line). The Windows-breaking `std::os::fd::AsFd` reference is still present upstream but is feature-gated behind `tokio-async-native-tls`, which AeroFTP does not enable (we use `tokio-rustls-aws-lc-rs`). The pin keeps the FTP layer stable across Linux, macOS, and Windows while picking up the 14 upstream fixes between 8.0.1 and 8.0.3 (UB in TLS, panics on EPSV/SIZE/MDTM, infinite loops in async `feat()` and `read_response_in()`, MLSX `cdir`/`pdir`, EPRT for IPv6).
:::
