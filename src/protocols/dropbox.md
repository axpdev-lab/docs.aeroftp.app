# Dropbox

AeroFTP connects to Dropbox via the official Dropbox API v2 with OAuth2 PKCE authentication. Full file management, tags, trash, and versioning support.

## Connection Settings

Authentication is handled via OAuth2 PKCE (no client secret required on the device):

1. Click **Connect** on the Dropbox protocol.
2. A browser window opens to Dropbox's authorization page.
3. Sign in and approve AeroFTP's access.
4. The authorization is completed automatically.

OAuth tokens are stored encrypted in the OS keyring. To use your own app credentials, enter a **Client ID** in Settings > Cloud Providers.

## Features

- **Tag Management**: Add, remove, and view tags on files and folders via the context menu. Tags use Dropbox's native Tags API, so they sync across all Dropbox clients.
- **Trash Management**: Deleted files are moved to Dropbox's trash. The Trash Manager dialog lets you browse, restore, and permanently delete trashed items.
- **File Versioning**: Dropbox retains previous versions of files. Access version history through the context menu.
- **File Sharing**: Create shared links for files and folders.
- **Storage Quota**: Used and total storage shown in the status bar.
- **Streaming Uploads**: Files are uploaded using chunked streaming, preventing out-of-memory issues on large files.

## Tips

- Dropbox's free tier (Basic) provides 2 GB of storage.
- Tags are user-scoped -- other collaborators on a shared folder do not see your tags.
- When syncing with AeroSync, Dropbox provides reliable content hashes that enable accurate change detection.
- If you encounter rate limiting (HTTP 429), AeroFTP retries automatically with exponential backoff.
