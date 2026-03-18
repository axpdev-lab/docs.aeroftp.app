# Yandex Disk

AeroFTP connects to Yandex Disk via the official REST API with OAuth2 authentication. Yandex Disk provides 5 GB of free storage.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the Yandex Disk protocol.
2. A browser window opens to Yandex's authorization page.
3. Sign in and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring. To use your own OAuth credentials, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

## Features

- **Trash Management**: Full trash lifecycle -- list, restore, permanently delete individual items, and empty the entire trash. Accessible via the Trash Manager dialog.
- **Share Links**: Create public download links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.
- **Full File Operations**: Upload, download, rename, move, copy, and delete.

## Tips

- Yandex Disk provides 5 GB free. Additional storage can be earned through Yandex promotions or purchased.
- Yandex also offers **Yandex Object Storage** (S3-compatible). This is a separate service configured using the S3 preset (`storage.yandexcloud.net`).
- For AeroSync, Yandex Disk provides modification timestamps and MD5 hashes for reliable change detection.
- If you are outside Russia/CIS, connection speeds to Yandex servers may be slower due to geographic distance.
