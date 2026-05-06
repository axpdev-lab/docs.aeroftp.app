# OpenDrive

AeroFTP connects to OpenDrive via their native REST API with session-based authentication. OpenDrive provides up to 7 GB of free storage (5 GB base, expandable via the OpenDrive review/social campaign).

::: tip Sign up for the free plan
The free plan, including the path to grow from 5 GB to 7 GB, is documented on the official page: **[opendrive.com/free](https://www.opendrive.com/free)**. The campaign tasks (Twitter follow, social shares, leaving a review) and the bandwidth bonus are listed there. Plan availability and exact perks are managed by OpenDrive and may change.
:::

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

- OpenDrive's free tier starts at 5 GB and can be raised to 7 GB via the review/social campaign at [opendrive.com/free](https://www.opendrive.com/free).
- The daily bandwidth limit (1 GB, raised to 3 GB after the campaign tasks) applies to **downloads only**, not uploads. The current usage is visible on the OpenDrive dashboard under Settings (your account page on opendrive.com). Always confirm the live numbers with OpenDrive directly: AeroFTP only reports what the API returns.
- Free accounts have a 100 MB per-file size limit. Paid plans remove the file size restriction.
- OpenDrive sessions expire after inactivity. AeroFTP handles re-authentication transparently if the session times out.
- For AeroSync, OpenDrive's MD5 checksums enable the **checksum** compare mode for the most accurate change detection.
- OpenDrive share links can be set to expire after a specific date -- useful for temporary file sharing.
