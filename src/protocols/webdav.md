# WebDAV

WebDAV (Web Distributed Authoring and Versioning) extends HTTP for file management. It is the standard protocol used by Nextcloud, Seafile, ownCloud, and many NAS devices for remote file access.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Host | Server URL | e.g. `cloud.example.com` |
| Port | `443` (HTTPS) or `80` (HTTP) | HTTPS recommended |
| Path | WebDAV endpoint path | e.g. `/remote.php/dav/files/user/` |
| Username | Your account username | |
| Password | Your account password | App passwords recommended |

## Presets

AeroFTP includes preconfigured presets that auto-fill the endpoint path:

| Preset | Endpoint | Notes |
|--------|----------|-------|
| **Nextcloud** | `/remote.php/dav/files/USERNAME/` | Replace USERNAME with your login |
| **Seafile** | `/seafdav` | Requires SeafDAV enabled on server |
| **CloudMe** | `webdav.cloudme.com` | 3 GB free, direct WebDAV |
| **Custom** | Any URL | For any WebDAV-compatible server |

## Features

- **PROPFIND**: Directory listing with full metadata (size, mtime, content type).
- **Root Boundary**: Navigation is restricted to the configured WebDAV path. You cannot browse above the initial path, preventing accidental access to other users' directories.
- **TLS**: All HTTPS connections use system certificate validation. Self-signed certificates trigger a confirmation dialog.
- **Large Files**: Streaming uploads with chunked transfer encoding.

## Tips

- For **Nextcloud**, generate an **app password** in Settings > Security > Devices & sessions. Do not use your main login password -- it will fail if 2FA is enabled.
- For **Seafile**, the SeafDAV extension must be enabled by the server administrator. Check `seahub_settings.py` for `ENABLE_WEBDAV_SECRET`.
- If you get 401 errors on Nextcloud, verify the path includes your exact username (case-sensitive).
- WebDAV performance depends heavily on the server. For large directory listings (1000+ files), expect slower response times compared to SFTP.
- When using AeroSync with WebDAV, the **size + modification time** compare mode is recommended, as WebDAV servers do not consistently provide checksums.
