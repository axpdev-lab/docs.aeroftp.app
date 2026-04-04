# Drime Cloud

AeroFTP connects to Drime Cloud using its native REST API with Bearer token authentication. Drime Cloud is a secure file collaboration and cloud storage platform built on the Bedrive/BeDrive engine with S3-backed storage. The free plan includes 20 GB of storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| API Token | Your access token | From Drime Dashboard or via login endpoint |

Generate an API token from your Drime Cloud account settings. AeroFTP stores it encrypted in the OS keyring.

## Features

- **File Operations**: Upload, download, rename, move, delete, and duplicate files and folders.
- **S3 Multipart Upload**: Files larger than 5 MB are automatically uploaded using presigned S3 URLs with chunked multipart transfer for reliability.
- **Shareable Links**: Create share links with optional password protection and custom expiration dates.
- **File Versioning**: Access previous file versions through backup history (retention period depends on plan).
- **Server-Side Copy**: Duplicate files directly on the server without downloading and re-uploading.
- **Storage Quota**: View used and available storage space.
- **Workspace Support**: Access team workspaces with role-based permissions (Viewer, Editor, Owner).

## Plans

| Feature | Free | Pro |
|---------|------|-----|
| Storage | 20 GB | Higher |
| File history | Limited | 120 days |
| Workspaces | Limited | Up to 100 members |
| Password-protected links | Yes | Yes |
| Custom expiration dates | Yes | Yes |
| Compliance tracking | No | Yes |
| Advanced permissions | No | Yes |

## Tips

- Drime Cloud uses numeric file IDs internally. Path navigation works by walking the directory tree from the root.
- Downloads use a hash-based URL scheme. AeroFTP handles the hash resolution automatically.
- The simple upload endpoint has a 5 MB limit. AeroFTP switches to S3 multipart automatically for larger files, so no manual configuration is needed.
- Rate limiting (HTTP 429) is handled with automatic exponential backoff retries.
- For AeroSync, use **size + modification time** compare mode.
