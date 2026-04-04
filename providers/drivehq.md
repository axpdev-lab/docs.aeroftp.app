# DriveHQ

DriveHQ is an enterprise cloud storage and file sharing service accessible via WebDAV. AeroFTP includes a built-in DriveHQ preset with pre-configured endpoint settings.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | `https://webdav.drivehq.com` | Auto-configured |
| Port | 443 | HTTPS |
| Username | Your DriveHQ username | |
| Password | Your DriveHQ password | |

## How to Connect

1. Open AeroFTP.
2. Select **DriveHQ** from the provider list.
3. Enter your DriveHQ username and password.
4. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **AeroSync**: Supported with size + modification time compare mode.

## Tips

- DriveHQ sharing features are managed through their separate web interface, not via WebDAV.
- For enterprise accounts, check with your administrator for any access restrictions.

## Related Documentation

- [WebDAV](/protocols/webdav)
