# Jianguoyun

Jianguoyun (Nutstore) is a popular Chinese cloud storage service with WebDAV support. AeroFTP includes a built-in Jianguoyun preset with pre-configured endpoint settings. The free plan includes 3 GB of storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | `https://dav.jianguoyun.com/dav` | Auto-configured |
| Port | 443 | HTTPS |
| Username | Your Jianguoyun email | |
| Password | App-specific password | Generate from Account Settings > Security |

## How to Connect

1. Open AeroFTP.
2. Select **Jianguoyun** from the provider list.
3. Enter your email and app-specific password.
4. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **AeroSync**: Supported with size + modification time compare mode.

## Tips

- Jianguoyun requires an **app-specific password** for WebDAV access, not your regular login password. Generate one from Account Settings > Security > Third-party App Management.
- The WebDAV endpoint uses the `/dav/` base path. AeroFTP configures this automatically.

## Related Documentation

- [WebDAV](/protocols/webdav)
