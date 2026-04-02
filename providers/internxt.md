# Internxt Drive

AeroFTP connects to Internxt Drive, an end-to-end encrypted cloud storage service with a zero-knowledge architecture. Internxt provides 1 GB of free storage.

## Connection Settings

Authentication is handled via OAuth2 PKCE:

1. Click **Connect** on the Internxt protocol.
2. A browser window opens to Internxt's authorization page.
3. Sign in and approve access.
4. Authorization completes automatically.

OAuth tokens are stored encrypted in the OS keyring.

## Features

- **End-to-End Encryption**: All files are encrypted client-side before upload. Internxt uses AES-256 with a zero-knowledge design -- the service cannot access your data.
- **OAuth2 PKCE**: Secure authorization flow without exposing a client secret. No manual API key management required.
- **Full File Operations**: Upload, download, rename, move, and delete files and folders.
- **Privacy-First**: Internxt is headquartered in the EU (Spain) and complies with GDPR. No tracking, no data mining.

## Tips

- Internxt's 1 GB free tier includes full E2E encryption at no additional cost.
- Because all metadata is encrypted, some operations (directory listing, rename) involve additional decryption steps compared to non-encrypted providers.
- Internxt does not currently expose a trash or file versioning API. Deletions through AeroFTP are permanent.
- For AeroSync, use the **size** compare mode. Encrypted modification times may not match local timestamps.
- Internxt is a good choice if privacy and EU data residency are priorities.
