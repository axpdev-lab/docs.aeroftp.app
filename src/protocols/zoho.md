# Zoho WorkDrive

AeroFTP connects to Zoho WorkDrive via the official API with OAuth2 authentication. Zoho WorkDrive is a team-oriented cloud storage service with label management, file versioning, and 8 regional data centers.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the Zoho WorkDrive protocol.
2. A browser window opens to Zoho's consent screen.
3. Sign in and grant access.
4. AeroFTP detects your team ID automatically.

To use your own OAuth credentials, enter a **Client ID** and **Client Secret** in Settings > Cloud Providers.

### Regional Endpoints

Zoho operates in 8 regions. The OAuth flow auto-detects your region:

| Region | Domain |
|--------|--------|
| US | `zohoapis.com` |
| EU | `zohoapis.eu` |
| India | `zohoapis.in` |
| Australia | `zohoapis.com.au` |
| Japan | `zohoapis.jp` |
| UK | `zohoapis.uk` |
| Canada | `zohoapis.ca` |
| Saudi Arabia | `zohoapis.sa` |

## Features

- **Team Labels**: Manage team-level color-coded labels. Apply and remove labels on files via a dedicated dialog. Labels are shared across team members.
- **File Versioning**: View the version history of files, download specific versions, and restore (promote) a previous version to current.
- **Trash Management**: Deleted files go to the WorkDrive trash. The Trash Manager lets you restore or permanently delete items.
- **Share Links**: Create shareable links with configurable access levels.
- **Storage Quota**: Team storage usage displayed in the status bar.

## Tips

- Zoho WorkDrive's free tier provides 5 GB per team. Paid plans start at 5 TB.
- Labels are team-scoped, meaning all team members see and share the same label set.
- If you need to switch regions, you must create a new Zoho account in the target region -- migration is not supported.
- For AeroSync, Zoho provides modification timestamps that enable reliable change detection with the **overwrite if newer** strategy.
