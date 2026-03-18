# Google Drive

AeroFTP connects to Google Drive via the official Google Drive API v3 with OAuth2 authentication. Full support for personal drives and shared drives.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the Google Drive protocol.
2. A browser window opens to Google's consent screen.
3. Sign in and grant AeroFTP access to your files.
4. The authorization code is captured automatically.

No manual configuration is needed. OAuth tokens are stored encrypted in the OS keyring and refreshed automatically.

To use your own OAuth credentials, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

## Features

- **Starring**: Star and unstar files directly from the right-click context menu. Starred status is visible in file metadata.
- **Comments**: Add comments to files via the context menu. Comments are visible to all collaborators.
- **Custom Properties**: Set key-value properties and file descriptions through the context menu.
- **File Versioning**: Google Drive retains file versions automatically. View and manage versions through AeroFTP.
- **Storage Quota**: Your used and total storage is displayed in the status bar.
- **Shared Drives**: Access Team Drives alongside your personal My Drive.
- **Trash**: Deleted files are moved to Google Drive's trash and can be restored.

## Tips

- Google Drive's 15 GB free tier is shared with Gmail and Google Photos.
- For large uploads, Google Drive uses resumable upload sessions that survive network interruptions.
- File names in Google Drive can contain characters that are invalid on local filesystems (e.g. `:`). AeroFTP handles this transparently during downloads.
- Google Docs, Sheets, and Slides appear in the file list but cannot be downloaded as binary files -- they are cloud-native formats.
