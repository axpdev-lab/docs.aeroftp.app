# kDrive

AeroFTP connects to Infomaniak kDrive via the official API with OAuth2 authentication. kDrive is a Swiss cloud storage service by Infomaniak, offering 15 GB of free storage.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the kDrive protocol.
2. A browser window opens to Infomaniak's authorization page.
3. Sign in and approve access.
4. AeroFTP retrieves your available drives and selects the primary drive.

OAuth tokens are stored encrypted in the OS keyring. To use your own OAuth credentials, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

## Features

- **Drive Selection**: If your account has multiple kDrives, AeroFTP uses the primary drive by default.
- **Cursor-Based Pagination**: Large directories are loaded efficiently using cursor pagination.
- **Trash Management**: Deleted files go to the kDrive trash and can be restored.
- **File Versioning**: kDrive retains previous versions of files. View and restore versions through AeroFTP.
- **Share Links**: Create shareable links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.

## Tips

- kDrive provides 15 GB free, which is generous among European cloud providers.
- Infomaniak is based in Switzerland, offering strong privacy protections under Swiss law.
- kDrive integrates with Infomaniak's broader ecosystem (email, web hosting, Swiss Transfer).
- For AeroSync, kDrive provides reliable modification timestamps for change detection.
