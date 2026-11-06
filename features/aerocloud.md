---
description: "Turn any server into a private cloud: background sync from the tray, file manager badges, selective sync and versioning."
---

# AeroCloud

AeroCloud turns a supported server into a private personal cloud. The wizard offers the sync surface in the table below, with maturity badges for each one. SCP is a transport in AeroFTP 4.2.6 and is not in that wizard yet. Background sync from the system tray, native file manager badges, selective sync, file versioning (`.aeroversions/`), `.aeroignore` patterns.

## Supported Integrations

AeroCloud supports the sync surface exposed by the desktop wizard. The maturity badges below are the same ones used in the app. `GitHub` and `Drime Cloud` are excluded from AeroCloud sync because their models do not fit the background-sync workflow.

### Wizard Sync Tiers

| Integration | Auth | Maturity | Wizard caveat / operational note |
| --- | --- | --- | --- |
| FTP | Username / Password | Beta | Requires MFMT support for reliable timestamps. |
| FTPS | Username / Password | Beta | Requires MFMT support for reliable timestamps. |
| SFTP | Password / Key / Agent | Stable | Best overall fit for full AeroCloud sync. |
| WebDAV family | Username / Password | Stable | Covers generic WebDAV plus hosted variants such as Nextcloud, Seafile, TAB.DIGITAL, Felicloud, CloudMe, InfiniCLOUD, Jianguoyun, and similar presets. |
| S3 family | Access Key / Secret | Stable | Covers AWS S3, Cloudflare R2, Backblaze S3, Wasabi, DigitalOcean Spaces, MinIO, Oracle Cloud, S3Drive, and similar S3-compatible presets. |
| Azure Blob | Connection string / SAS | Stable | Treated as a first-class object-storage sync target in the wizard. |
| Dropbox | OAuth 2.0 PKCE | Stable | Native Dropbox API path with strong sync behavior. |
| OneDrive | OAuth 2.0 PKCE | Stable | Native Microsoft Graph path with strong sync behavior. |
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

The wizard also offers Backblaze B2 (native API), ImageKit, Uploadcare and Cloudinary. Google Drive, Jottacloud and 4shared are wired in the sync backend but stay out of the wizard until a saved profile passes the live connect check the wizard list is built from (`AEROCLOUD_OFFERED` in `src/components/AeroCloudProtocols.tsx`); Proton Drive and Twake Drive have not been through that check yet. OpenStack Swift and SCP are not offered.

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

## Setup Wizard

The AeroCloud wizard syncs a local folder with a server you have already saved in My Servers. It does not create connections: add and test the server first, then run the wizard. It has three steps.

### Step 1 - Choose Folder

- **Cloud name**, the name shown in the tab
- **Local folder**, the folder on this computer that AeroCloud keeps in sync

### Step 2 - Select Server

A searchable list of your saved profiles. Only profiles whose protocol is in the table above are listed; the wizard says how many others it hid. If no saved profile can be used, it offers to open My Servers.

Under the list, choose the **remote folder**: a sub-folder of the profile's starting folder that mirrors the local one. AeroCloud creates it if it does not exist. When the chosen integration has a sync caveat, the wizard shows it here.

### Step 3 - Sync Settings

- **Sync on file change**, real-time sync from the filesystem watcher
- **Sync interval**, from 1 minute to 1440 minutes, or from 1 hour to 168 hours
- A **summary** of the profile, the local folder and the remote folder before you confirm

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

On a backend with no used-space API (FTP, S3, WebDAV), **Calculate used storage** in the status bar measures it by walking the files under the profile's initial path, or under the current folder when the profile has none, and a profile can run it on connect. While the scan runs, the storage chip shows the running figure and keeps the total it already knew. Clicking the chip runs the scan again on any backend, including one whose API reports the account total, and the figure is then the bytes found under that path over the whole account: when the initial path is a subfolder, the chip reads as less used space than the account holds. Point the profile's initial path at the account root for a scanned figure that matches the account.

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
