# AeroCloud

AeroCloud turns any server into a private personal cloud. It rides AeroFTP's full provider surface - **7 transport protocols + 20+ native provider integrations** - with maturity badges that classify each one by sync reliability. Background sync from the system tray, native file manager badges, selective sync, file versioning (`.aeroversions/`), `.aeroignore` patterns.

## Supported Integrations

AeroCloud supports the sync surface exposed by the desktop wizard. The maturity badges below are the same ones used in the app. `GitHub` and `Drime Cloud` are excluded from AeroCloud sync because their models do not fit the background-sync workflow.

### Wizard Sync Tiers

| Integration | Auth | Maturity | Wizard caveat / operational note |
| --- | --- | --- | --- |
| FTP | Username / Password | Beta | Requires MFMT support for reliable timestamps. |
| FTPS | Username / Password | Beta | Requires MFMT support for reliable timestamps. |
| SFTP | Password / Key / Agent | Stable | Best overall fit for full AeroCloud sync. |
| WebDAV family | Username / Password | Stable | Covers generic WebDAV plus hosted variants such as Nextcloud, Seafile, Tab.digital, Felicloud, CloudMe, InfiniCLOUD, Jianguoyun, and similar presets. |
| S3 family | Access Key / Secret | Stable | Covers AWS S3, Cloudflare R2, Backblaze S3, Wasabi, DigitalOcean Spaces, MinIO, Oracle Cloud, S3Drive, and similar S3-compatible presets. |
| Azure Blob | Connection string / SAS | Stable | Treated as a first-class object-storage sync target in the wizard. |
| Google Drive | OAuth 2.0 PKCE | Stable | Native Google API path with strong sync behavior. |
| Dropbox | OAuth 2.0 PKCE | Stable | Native Dropbox API path with strong sync behavior. |
| OneDrive | OAuth 2.0 PKCE | Stable | Native Microsoft Graph path with strong sync behavior. |
| Jottacloud | Username / Password | Stable | Native provider with no wizard caveat. |
| kDrive | OAuth 2.0 | Stable | Native provider with no wizard caveat. |
| Koofr | OAuth 2.0 PKCE | Stable | Native provider with no wizard caveat. |
| OpenDrive | Session auth | Stable | Native provider with no wizard caveat. |
| Box | OAuth 2.0 | Beta | Stricter API rate limits than other providers. |
| pCloud | OAuth 2.0 | Beta | OAuth flow may require periodic re-authorization. |
| Zoho WorkDrive | OAuth 2.0 | Beta | Team ID resolution adds setup complexity. |
| Yandex Disk | OAuth 2.0 | Beta | Service may be blocked in some regions. |
| MEGA | Email / Password | Beta | Requires the external MEGAcmd daemon for AeroCloud sync. |
| Filen | Email / Password + optional 2FA | Beta | End-to-end encryption adds sync overhead. |
| Internxt | OAuth 2.0 PKCE | Beta | End-to-end encryption adds sync overhead. |
| FileLu | API key / saved profile | Beta | Region latency can vary; sync uses hash comparison. |
| 4shared | OAuth 1.0 | Alpha | Manual re-authorization is required if the token is revoked. |

### How To Read The Matrix

- **Stable** means the wizard treats the integration as production-grade for day-to-day AeroCloud usage.
- **Beta** means the integration is usable, but the desktop app exposes a concrete caveat in the wizard.
- **Alpha** means the integration is available, but operational rough edges are still expected.
- **WebDAV family** and **S3 family** are documented by analogy: if a preset is not shown as its own row in the AeroCloud wizard, it inherits the family tier unless its provider guide states otherwise.

## Background Sync

AeroCloud runs in the system tray and synchronizes files in the background. The cloud provider factory dispatches connections for all supported protocols - direct-auth, OAuth 2.0, and OAuth 1.0. Protocol maturity badges in the setup wizard indicate sync reliability per provider.

When background sync is active:

- The **tray icon** shows sync status (idle, syncing, error)
- **Sync intervals** are configurable per cloud connection
- **Transfer progress** is visible from the tray menu
- **Filesystem watcher** (inotify on Linux) detects local changes in real time
- All transfers use the same **circuit breaker** and **retry policies** as interactive transfers

## 4-Step Setup Wizard

The CloudPanel wizard guides you through connecting a new cloud provider in four steps.

### Step 1 - Select Protocol

A grid of protocol cards organized into three groups:

- **Servers** - FTP, FTPS, SFTP, WebDAV
- **Cloud** - S3, Azure Blob, MEGA, Filen, Internxt, kDrive, Jottacloud, Koofr, OpenDrive, Yandex Disk, FileLu
- **OAuth** - Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, 4shared

### Step 2 - Connection Fields

Dynamic form fields based on the selected protocol:

- **Server protocols**: Host, port, username, password, path, TLS mode
- **OAuth providers**: Client ID / Secret (optional for built-in apps), region selector (Zoho)
- **API providers**: API key, email, password, 2FA code (Filen)
- **S3**: Endpoint, region, bucket, access key, secret key, path style toggle

### Step 3 - Authorize (OAuth only)

For OAuth providers, click **Authorize** to open the browser-based consent flow. AeroFTP receives the callback, exchanges the code for tokens, and stores them in the encrypted vault.

### Step 4 - Sync Settings

Configure the sync behavior for this connection:

- **Local folder** to sync
- **Remote path** (root or subdirectory)
- **Sync direction** (push, pull, bidirectional)
- **Sync interval** (manual, 5 min, 15 min, 1 hour, etc.)

## Native OS File Manager Badges

AeroCloud provides native sync status badges in your operating system's file manager - the same green checkmarks and blue sync arrows you see with Dropbox or OneDrive.

### Badge States

| Badge | Meaning |
|-------|---------|
| **Green checkmark** | File is synced and up to date |
| **Blue arrows** | File is currently syncing |
| **Red X** | Sync error - check the sync log for details |

### Linux (Nautilus / Nemo / Caja)

AeroCloud communicates with GNOME-based file managers through the **GIO emblem** system. A Unix domain socket IPC server listens for status queries and responds with emblem names (`emblem-default`, `emblem-synchronizing`, `emblem-important`).

### Windows (Cloud Filter API)

On Windows 10 1709+, AeroCloud uses the **Cloud Filter API** (`CfSetInSyncState`, `CfRegisterSyncRoot`) to display native Explorer sync badges. No COM DLL or shell extension is required - the badges appear automatically in the file list and Details pane.

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

- **List versions** - see all previous versions with timestamps and sizes
- **Download version** - retrieve a specific historical version
- **Restore version** - promote a previous version to current

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
