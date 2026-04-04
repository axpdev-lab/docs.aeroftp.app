# CloudMe

CloudMe is a Swedish cloud storage service accessible via WebDAV. AeroFTP includes a built-in CloudMe preset with pre-configured endpoint settings. The free plan includes 3 GB of storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | `https://webdav.cloudme.com/{username}` | Auto-configured from username |
| Port | 443 | HTTPS |
| Username | Your CloudMe username | |
| Password | Your CloudMe password | |

## How to Connect

1. Open AeroFTP.
2. Select **CloudMe** from the provider list.
3. Enter your CloudMe username and password.
4. The server URL is configured automatically.
5. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **AeroSync**: Supported with size + modification time compare mode.

## Tips

- The WebDAV endpoint includes your username in the path. AeroFTP fills this in automatically when you select the CloudMe preset.
- CloudMe does not support share link creation via WebDAV.

## Related Documentation

- [WebDAV](/protocols/webdav)
