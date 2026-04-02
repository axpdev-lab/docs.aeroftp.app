# Box

AeroFTP connects to Box via the official Box Content API with OAuth2 authentication. Box is a feature-rich cloud storage platform with enterprise capabilities.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the Box protocol.
2. A browser window opens to Box's authorization page.
3. Sign in and grant AeroFTP access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring. To use your own Box app, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

## Features

- **Trash Management**: Deleted files go to Box's trash. The Trash Manager lets you browse, restore, and permanently delete trashed items.
- **Comments**: Add comments to files via the context menu. Comments are visible to all collaborators.
- **Collaborations**: View and manage file/folder collaborations and permissions.
- **Tags**: Add and manage tags on files. Tag management uses a reusable dialog component shared with Dropbox.
- **File Versioning**: Box retains previous versions of files for recovery.
- **Shared Links**: Create shareable links with password protection and expiration options.
- **Folder Locks** (Enterprise): Lock folders to prevent modifications. Requires a Box Business or Enterprise plan.
- **Watermark** (Enterprise): Apply watermarks to files for security. Requires Enterprise plan.
- **PRO Badge**: Enterprise-only features are marked with a PRO badge in the UI.

## Tips

- Box provides 10 GB free with a personal account. File upload limit is 250 MB on free plans, 5 GB on Business.
- Box's API rate limits are relatively strict. AeroFTP handles 429 responses with automatic retry.
- For AeroSync, Box provides SHA-1 hashes for files, enabling accurate change detection.
- If you see "terms of service" errors, you may need to accept Box's updated terms in the web interface first.
