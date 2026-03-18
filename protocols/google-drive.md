# Google Drive

AeroFTP connects to Google Drive via the official Google Drive API v3 with OAuth2 authentication. You can browse, upload, download, and manage files on your personal Google Drive and shared (team) drives as if they were a remote filesystem. AeroFTP supports starring, comments, custom properties, file versioning, trash management, and storage quota display.

## Connection and Authentication

Authentication is handled entirely through OAuth2 -- there are no manual tokens or API keys to configure.

![Google Drive OAuth authorization flow](/images/google-drive-auth.png)
<!-- SCREENSHOT: The Google Drive connection card in AeroFTP showing the "Connect" button, followed by the browser OAuth consent screen asking to grant AeroFTP access. -->

### Setup Steps

1. In the AeroFTP connection screen, select **Google Drive** from the protocol list.
2. Click **Connect**. Your default browser opens to Google's OAuth consent screen.
3. Sign in with your Google account (or select an already signed-in account).
4. Review the permissions and click **Allow**. AeroFTP requests access to your Google Drive files.
5. The browser redirects back to AeroFTP with an authorization code. This is captured automatically -- you do not need to copy or paste anything.
6. AeroFTP exchanges the authorization code for access and refresh tokens, which are stored encrypted in the OS keyring.

Token refresh is automatic. When the access token expires (typically after 1 hour), AeroFTP uses the refresh token to obtain a new one without any user interaction.

### Custom OAuth Credentials

By default, AeroFTP uses its own OAuth client for Google Drive. If you prefer to use your own Google Cloud project credentials (for higher API quotas or organizational policies), you can enter a custom **Client ID** and **Client Secret** in **Settings > Cloud Providers > Google Drive**.

To create your own credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **Google Drive API**.
3. Under **Credentials**, create an **OAuth 2.0 Client ID** of type "Desktop app".
4. Copy the Client ID and Client Secret into AeroFTP's settings.

## File Browsing

Once connected, your Google Drive appears as a file tree. The root `/` shows your My Drive contents. Navigation works the same as any other protocol -- double-click folders to enter, use the breadcrumb bar to go back.

### Google Workspace Files

Google Docs, Sheets, Slides, and other Workspace files appear in the file list with their native icons. These are cloud-native formats that do not have a traditional file size -- they exist only on Google's servers.

- **Downloading**: When you download a Google Docs file, AeroFTP exports it to a standard format automatically (Docs to `.docx`, Sheets to `.xlsx`, Slides to `.pptx`).
- **Uploading**: Standard Office files uploaded to Google Drive remain in their original format. Google does not auto-convert them unless you configure that in Google Drive's own settings.

### Shared Drives (Team Drives)

If your Google account has access to Shared Drives (formerly Team Drives), they appear alongside your personal My Drive. Shared Drives have their own storage quota and ownership model -- files belong to the organization, not individual users.

## Features

### Starring Files

Star and unstar files directly from the right-click context menu. Starred files are marked in Google Drive's metadata and appear in the "Starred" section of the Google Drive web interface.

- Right-click a file and select **Star** or **Unstar**.
- The starred status is visible in the file's metadata panel.

### Comments

Add comments to any file via the context menu. Comments are visible to all collaborators who have access to the file in Google Drive.

- Right-click a file and select **Add Comment**.
- A dialog appears where you can type your comment.
- Comments appear in the Google Drive web interface's comment sidebar.

### Custom Properties

Set key-value properties and file descriptions through the context menu. Properties are stored in Google Drive's file metadata and can be read by other applications via the API.

- Right-click a file and select **Properties**.
- Add or edit the file description and custom key-value pairs.

### File Versioning

Google Drive retains previous versions of files automatically (for 30 days or 100 versions, whichever comes first). AeroFTP exposes version management through the StorageProvider interface:

- **List versions**: See all available versions of a file with timestamps and sizes.
- **Download a specific version**: Retrieve an older version of a file.
- **Restore a version**: Promote a previous version to become the current version.

### Storage Quota

Your Google Drive storage usage is displayed in the status bar at the bottom of the AeroFTP window, showing used space vs. total available space (e.g., `7.2 GB / 15.0 GB`).

> **Note**: Google Drive's 15 GB free tier is shared across Gmail, Google Drive, and Google Photos. If your quota appears lower than expected, check your Gmail and Photos usage.

### Trash Management

Deleted files are moved to Google Drive's trash (not permanently deleted). You can restore or permanently delete trashed files through AeroFTP.

## CLI Usage

The AeroFTP CLI accesses Google Drive through saved connection profiles:

```bash
# List root directory
aeroftp ls --profile "Google Drive" /

# List with details (size, date, type)
aeroftp ls --profile "Google Drive" / -l

# Download a file
aeroftp get --profile "Google Drive" /Documents/report.pdf ./

# Upload a file
aeroftp put --profile "Google Drive" /Documents/ ./presentation.pptx

# Search for files
aeroftp find --profile "Google Drive" / -n "*.pdf"

# Show storage quota
aeroftp df --profile "Google Drive"

# Directory tree
aeroftp tree --profile "Google Drive" /Projects/ -d 2

# JSON output for scripting
aeroftp ls --profile "Google Drive" / -l --json
```

> **Note**: Google Drive CLI access requires a saved profile with valid OAuth tokens. Run the GUI at least once to complete the OAuth flow, then the CLI can reuse the stored tokens.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| OAuth consent screen shows "unverified app" | Using custom OAuth credentials not yet verified by Google | Click "Advanced" then "Go to app" to proceed, or complete Google's verification process |
| `403 Rate Limit Exceeded` | Too many API requests in a short period | Wait a few minutes and retry; consider using your own OAuth credentials for higher quotas |
| Files show 0 bytes | Google Workspace files (Docs, Sheets) have no binary size | This is normal -- these files are exported on download |
| Cannot delete files | Insufficient permissions on a Shared Drive | Verify your access level on the Shared Drive in Google Drive's web interface |
| Token refresh fails | OAuth tokens revoked or expired | Disconnect and reconnect to Google Drive to re-authorize |

## Tips

- For large uploads, Google Drive uses resumable upload sessions that survive network interruptions. AeroFTP handles this automatically for files larger than 5 MB.
- File names in Google Drive can contain characters that are invalid on local filesystems (e.g. `:`). AeroFTP sanitizes these transparently during downloads.
- Google Drive API has a rate limit of approximately 12,000 requests per 100 seconds per user. For bulk operations on thousands of files, expect some throttling.
- AeroSync works well with Google Drive using the **size + modification time** compare mode.
