# OneDrive

AeroFTP connects to Microsoft OneDrive via the Microsoft Graph API with OAuth2 authentication. Supports personal OneDrive and OneDrive for Business.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the OneDrive protocol.
2. A browser window opens to Microsoft's login page.
3. Sign in with your Microsoft account and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring. To use your own Azure AD app, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

## Features

- **Trash Management**: Deleted files go to the OneDrive recycle bin. The Trash Manager dialog lets you list, restore, and permanently delete items.
- **Resumable Uploads**: Files larger than 4 MB are automatically uploaded using Microsoft's resumable upload sessions, which survive network interruptions.
- **File Versioning**: OneDrive retains version history for files. Browse and restore previous versions.
- **Shared Links**: Create shareable links with configurable permissions.
- **Storage Quota**: Used and total storage displayed in the status bar.

## Tips

- OneDrive provides 5 GB free with a Microsoft account, or 1 TB with Microsoft 365.
- OneDrive for Business may have different API permissions. If you encounter "Access Denied" errors, your organization's admin may need to approve the app.
- For AeroSync, OneDrive provides file hashes (SHA-1 for personal, QuickXorHash for Business) that enable efficient change detection.
- Large file uploads (>4 MB) use the upload session API automatically -- no configuration needed.
