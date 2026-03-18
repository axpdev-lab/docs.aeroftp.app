# Jottacloud

AeroFTP connects to Jottacloud via WebDAV. Jottacloud is a Norwegian cloud storage service that provides 5 GB of free storage with data residency in Norway.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Host | `jottacloud.com` | Pre-configured by the Jottacloud preset |
| Username | Your Jottacloud username | |
| Password | Your Jottacloud password | Or an app-specific password |

Jottacloud is accessed through the WebDAV protocol. When you select the Jottacloud preset, AeroFTP configures the endpoint automatically.

## Features

- **WebDAV Access**: Standard WebDAV file operations -- upload, download, rename, move, and delete.
- **Norwegian Data Residency**: All data is stored in Norway, subject to Norwegian privacy laws.
- **Unlimited Storage** (paid): Jottacloud's paid plans offer unlimited storage, making it attractive for large backups.

## Tips

- Jottacloud's free tier provides 5 GB. The Personal plan offers unlimited storage for a monthly fee.
- If you have 2FA enabled on your Jottacloud account, you may need to create an **app-specific password** in your account settings for WebDAV access.
- Since Jottacloud uses WebDAV, it inherits the same characteristics as other WebDAV connections -- no trash API, no versioning API through this interface.
- For AeroSync, use **size + modification time** compare mode. WebDAV access provides reliable file metadata.
- Jottacloud is a good choice for users who prioritize Nordic data residency and privacy.
