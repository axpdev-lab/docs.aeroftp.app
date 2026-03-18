# OpenDrive

AeroFTP connects to OpenDrive via their native REST API with session-based authentication. OpenDrive provides 5 GB of free storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Username | Your OpenDrive email | |
| Password | Your OpenDrive password | Stored encrypted in the OS keyring |

Authentication creates a session token that is maintained for the duration of the connection.

## Features

- **Trash Management**: Deleted files go to OpenDrive's trash. The Trash Manager lets you browse, restore, and permanently delete trashed items. Accessible from the context menu.
- **MD5 Checksums**: OpenDrive provides MD5 hashes for files, enabling integrity verification after transfers.
- **Expiring Share Links**: Create download links with configurable expiration dates.
- **Zlib Compression**: Some API responses use zlib compression for reduced bandwidth.
- **Full File Operations**: Upload, download, rename, move, and delete files and folders.

## Tips

- OpenDrive's free tier provides 5 GB with a 100 MB per-file size limit. Paid plans remove the file size restriction.
- OpenDrive sessions expire after inactivity. AeroFTP handles re-authentication transparently if the session times out.
- For AeroSync, OpenDrive's MD5 checksums enable the **checksum** compare mode for the most accurate change detection.
- OpenDrive share links can be set to expire after a specific date -- useful for temporary file sharing.
