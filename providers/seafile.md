# Seafile

Seafile is an open-source, self-hosted cloud storage platform with WebDAV support. AeroFTP includes a built-in Seafile preset. Public instances like Seafile Cloud are also supported.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | `https://your-server.com/seafdav/` | Or `https://plus.seafile.com/seafdav/` for Seafile Cloud |
| Port | 443 | HTTPS |
| Username | Your Seafile email | |
| Password | Your Seafile password | |

## How to Connect

1. Open AeroFTP.
2. Select **Seafile** from the provider list.
3. Enter your server URL (or use the default for Seafile Cloud).
4. Enter your email and password.
5. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **Self-hosted**: Connect to any Seafile instance by changing the server URL.
- **AeroSync**: Supported with size + modification time compare mode.

## Tips

- The WebDAV endpoint path is `/seafdav/` - make sure to include the trailing slash.
- For self-hosted instances, ensure WebDAV is enabled in your Seafile server configuration (`ENABLE_WEBDAV = True` in `seahub_settings.py`).
- Seafile libraries appear as top-level directories in the WebDAV view.

## Related Documentation

- [WebDAV](/protocols/webdav)
