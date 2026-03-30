# AeroCloud

AeroCloud turns any server into a private personal cloud. Reliable sync with 11 protocols out of the box, plus 10 additional protocols with known limitations. Background sync from the system tray, native file manager badges, selective sync, file versioning (.aeroversions/), .aeroignore patterns, and protocol maturity badges in the setup wizard.

## Supported Protocols

AeroCloud supports 21 protocols for sync (GitHub and DrimeCloud are excluded — conceptually incompatible with sync). Protocols are classified by sync reliability:

- **Stable (12)**: SFTP, S3, Azure, WebDAV, Google Drive, Dropbox, OneDrive, Jottacloud, kDrive, Koofr, OpenDrive, FeliCloud
- **Beta (8)**: FTP, FTPS, Box, pCloud, Zoho WorkDrive, Yandex Disk, MEGA, Filen, Internxt
- **Alpha (2)**: FileLu, 4shared

Protocols are grouped into four categories.

### Server Protocols

Direct server connections using standard file transfer protocols.

| Protocol | Auth | Encryption | Notes |
|----------|------|------------|-------|
| FTP | Username / Password | None | Classic file transfer |
| FTPS | Username / Password | TLS (Explicit / Implicit) | FTP over TLS |
| SFTP | Password / Key / Agent | SSH | Host key TOFU verification |
| WebDAV | Username / Password | HTTPS | Nextcloud, Seafile, ownCloud, CloudMe |
| S3-Compatible | Access Key / Secret | HTTPS | AWS, Wasabi, Backblaze, Cloudflare R2, MinIO, DigitalOcean Spaces, and more |

### OAuth Cloud Providers

Cloud services that authenticate via OAuth 2.0. AeroFTP handles the full authorization flow — click **Authorize**, sign in to the provider, and the token is stored securely in the vault.

| Provider | Free Tier | Auth | Special Features |
|----------|-----------|------|------------------|
| Google Drive | 15 GB | OAuth 2.0 PKCE | Starring, comments, custom properties |
| Dropbox | 2 GB | OAuth 2.0 PKCE | Tags, trash management |
| OneDrive | 5 GB | OAuth 2.0 PKCE | Trash management, resumable uploads > 4 MB |
| Box | 10 GB | OAuth 2.0 | Tags, comments, collaborations, folder locks |
| pCloud | 10 GB | OAuth 2.0 | EU data residency option |
| Zoho WorkDrive | 5 GB | OAuth 2.0 | 8 regional endpoints, team labels, versioning |
| kDrive | 15 GB | OAuth 2.0 | Infomaniak, cursor-based pagination |
| Koofr | 10 GB | OAuth 2.0 PKCE | EU-based (Slovenia), trash management |
| FeliCloud | 10 GB | WebDAV + OCS | EU/GDPR, Nextcloud-based, share links, trash |
| Yandex Disk | 10 GB | OAuth 2.0 | Trash management, public links |

### API / Token Providers

Cloud services that use API keys, passwords, or session-based authentication.

| Provider | Free Tier | Auth | Notes |
|----------|-----------|------|-------|
| MEGA | 20 GB | Email / Password | E2E encrypted |
| 4shared | 15 GB | OAuth 1.0 (HMAC-SHA1) | ID-based file system |
| Filen | 10 GB | Email / Password | E2E encrypted, 2FA passthrough |
| Internxt | 1 GB | OAuth 2.0 PKCE | Zero-knowledge E2E |
| FileLu | 10 GB | API Key | File privacy, password protection, clone |
| OpenDrive | 5 GB | Session Auth | MD5 checksums, zlib compression |
| Jottacloud | 5 GB | Username / Password | Norwegian provider |

### Special Protocols

| Protocol | Auth | Notes |
|----------|------|-------|
| Azure Blob Storage | Connection String / SAS | Enterprise object storage |
| GitHub | Personal Access Token | Repository file browsing |

## Background Sync

AeroCloud runs in the system tray and synchronizes files in the background. The cloud provider factory dispatches connections for all supported protocols — direct-auth, OAuth 2.0, and OAuth 1.0. Protocol maturity badges in the setup wizard indicate sync reliability per provider.

When background sync is active:

- The **tray icon** shows sync status (idle, syncing, error)
- **Sync intervals** are configurable per cloud connection
- **Transfer progress** is visible from the tray menu
- **Filesystem watcher** (inotify on Linux) detects local changes in real time
- All transfers use the same **circuit breaker** and **retry policies** as interactive transfers

## 4-Step Setup Wizard

The CloudPanel wizard guides you through connecting a new cloud provider in four steps.

### Step 1 — Select Protocol

A grid of protocol cards organized into three groups:

- **Servers** — FTP, FTPS, SFTP, WebDAV, S3
- **Cloud** — Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho, kDrive, Koofr, FeliCloud, Yandex, MEGA, 4shared, Filen, Internxt, FileLu, OpenDrive, Jottacloud
- **Special** — Azure Blob, GitHub

### Step 2 — Connection Fields

Dynamic form fields based on the selected protocol:

- **Server protocols**: Host, port, username, password, path, TLS mode
- **OAuth providers**: Client ID / Secret (optional for built-in apps), region selector (Zoho)
- **API providers**: API key, email, password, 2FA code (Filen)
- **S3**: Endpoint, region, bucket, access key, secret key, path style toggle

### Step 3 — Authorize (OAuth only)

For OAuth providers, click **Authorize** to open the browser-based consent flow. AeroFTP receives the callback, exchanges the code for tokens, and stores them in the encrypted vault.

### Step 4 — Sync Settings

Configure the sync behavior for this connection:

- **Local folder** to sync
- **Remote path** (root or subdirectory)
- **Sync direction** (push, pull, bidirectional)
- **Sync interval** (manual, 5 min, 15 min, 1 hour, etc.)

## Native OS File Manager Badges

AeroCloud provides native sync status badges in your operating system's file manager — the same green checkmarks and blue sync arrows you see with Dropbox or OneDrive.

### Badge States

| Badge | Meaning |
|-------|---------|
| **Green checkmark** | File is synced and up to date |
| **Blue arrows** | File is currently syncing |
| **Red X** | Sync error — check the sync log for details |

### Linux (Nautilus / Nemo / Caja)

AeroCloud communicates with GNOME-based file managers through the **GIO emblem** system. A Unix domain socket IPC server listens for status queries and responds with emblem names (`emblem-default`, `emblem-synchronizing`, `emblem-important`).

### Windows (Cloud Filter API)

On Windows 10 1709+, AeroCloud uses the **Cloud Filter API** (`CfSetInSyncState`, `CfRegisterSyncRoot`) to display native Explorer sync badges. No COM DLL or shell extension is required — the badges appear automatically in the file list and Details pane.

### macOS (FinderSync)

On macOS, badge overlays are provided through the FinderSync extension framework, displaying standard Finder badge icons for sync status.

## Cloud Features

### Sync Index Cache

AeroCloud maintains a local index of the remote file tree. This index is stored as compact JSON and enables:

- **Instant directory listing** without re-scanning the remote
- **Change detection** by comparing the cached index against the current remote state
- **Offline browsing** of the remote file structure

### Cross-Provider Remote Search

Search across any connected provider using the `search()` method from the StorageProvider trait. Search is delegated to the provider's native API when available (Google Drive, Dropbox, OneDrive, Box) or falls back to recursive listing with client-side filtering.

### Storage Quota

The status bar displays remaining storage for the connected provider. Quota information is fetched via `get_storage_quota()` and shows used / total space with a usage percentage.

### File Versions

Providers that support versioning (Google Drive, Dropbox, OneDrive, Box, Zoho WorkDrive) expose version history through the StorageProvider trait:

- **List versions** — see all previous versions with timestamps and sizes
- **Download version** — retrieve a specific historical version
- **Restore version** — promote a previous version to current

### Share Links

Create shareable links for files and folders on supported providers. Options vary by provider but may include:

- Expiration date
- Password protection
- View-only or edit permissions

### WebDAV Locking

For WebDAV connections, AeroCloud supports RFC 4918 file locking:

- **Exclusive locks** prevent concurrent edits
- **Lock tokens** are managed automatically
- **Lock refresh** keeps active locks alive during editing sessions
