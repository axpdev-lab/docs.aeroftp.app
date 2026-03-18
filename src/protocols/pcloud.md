# pCloud

AeroFTP connects to pCloud via their native API with OAuth2 authentication. pCloud offers 10 GB of free storage with US and EU data center options.

## Connection Settings

Authentication is handled via OAuth2:

1. Click **Connect** on the pCloud protocol.
2. A browser window opens to pCloud's authorization page.
3. Sign in and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring.

## Data Center Regions

When creating a pCloud account, you choose a data center region:

| Region | API Endpoint | Notes |
|--------|-------------|-------|
| **United States** | `api.pcloud.com` | Default |
| **European Union** | `eapi.pcloud.com` | GDPR-compliant |

AeroFTP auto-detects your data center based on the OAuth response. If detection fails, you can set the region manually.

## Features

- **Trash Management**: Deleted files can be recovered from pCloud's trash.
- **File Versioning**: pCloud retains up to 15 days of version history (30 days on Premium).
- **Shared Links**: Create download and upload links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.
- **Streaming Transfers**: Large files are uploaded and downloaded with streaming I/O.

## Tips

- pCloud's 10 GB free tier does not expire, unlike some competitors.
- pCloud also offers lifetime plans (one-time payment) -- a unique offering among cloud providers.
- For AeroSync, pCloud provides file hashes that enable efficient change detection.
- If your account is on the EU server, ensure you selected the EU region during pCloud account creation. You cannot migrate between regions.
