# Koofr

<ProviderPlanCard id="koofr" />

AeroFTP connects to Koofr via the official API with OAuth2 PKCE authentication. Koofr is an EU-based cloud storage service (Slovenia) providing 10 GB of free storage.

## Connection Settings

Authentication is handled via OAuth2 PKCE:

1. Click **Connect** on the Koofr protocol.
2. A browser window opens to Koofr's authorization page.
3. Sign in and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the Universal Credential Vault.

## Features

- **Trash Management**: Deleted files go to Koofr's trash. The Trash Manager lets you browse, restore, and empty the trash.
- **Share Links**: Create shareable download links for files and folders.
- **Storage Quota**: Used and total storage displayed in the status bar.
- **Multi-Provider Hub**: Koofr can aggregate storage from Google Drive, Dropbox, OneDrive, and Amazon S3 into a single view (configured on Koofr's web interface).

## Benchmark and cleanup notes

The native Koofr API and Koofr WebDAV are separate connection methods. Compare benchmark rows with the same method. The community benchmark uses `.dat` payloads and checks its scratch root after cancellation because an in-flight upload can complete late. Read reported cleanup notes before assuming every temporary or trash item was removed. See [Community Benchmark](/test-reports/community-benchmark/).

## Tips

- Koofr's 10 GB free tier is lifetime -- no expiration, no forced upgrades.
- Koofr is based in Slovenia (EU) and complies with GDPR.
- Koofr supports connecting external cloud accounts (Google Drive, Dropbox, OneDrive) as sub-mounts -- this is configured on Koofr's website, not through AeroFTP.
- For AeroSync, Koofr provides reliable modification timestamps for change detection.
- Koofr offers a unique "Vault" feature on their end (client-side encryption of a subfolder). This is separate from AeroFTP's AeroVault.
