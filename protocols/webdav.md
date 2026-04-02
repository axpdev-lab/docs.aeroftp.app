# WebDAV

WebDAV (Web Distributed Authoring and Versioning) extends HTTP with file management operations defined in RFC 4918. It is the standard remote file access protocol used by Nextcloud, Seafile, CloudMe, and many NAS devices. Because WebDAV runs over HTTP/HTTPS, it works through corporate firewalls and proxies that block other protocols.

AeroFTP's WebDAV implementation uses the `reqwest` HTTP client with `quick-xml` for parsing PROPFIND responses, supporting both Basic and Digest authentication, TLS certificate validation, and streaming uploads.

For provider-specific setup guides, see:

- [Quotaless](/providers/quotaless)
- [Nextcloud](/providers/nextcloud)
- [Felicloud](/providers/felicloud)

## Connection Settings

![WebDAV connection with preset selector](/images/webdav-presets.png)
<!-- SCREENSHOT: WebDAV connection dialog showing the preset dropdown (Nextcloud, Seafile, CloudMe, Custom), Host field, Port (443), Path field auto-filled with "/remote.php/dav/files/USERNAME/", Username, and Password fields. -->

| Field | Value | Notes |
| ----- | ----- | ----- |
| Host | Server URL | e.g. `cloud.example.com` or `nas.local` |
| Port | `443` (HTTPS) or `80` (HTTP) | HTTPS is strongly recommended |
| Path | WebDAV endpoint path | Auto-filled by presets; e.g. `/remote.php/dav/files/user/` |
| Username | Your account username | |
| Password | Your account password | App passwords recommended for Nextcloud |

## Presets

AeroFTP includes preconfigured presets that auto-fill the endpoint path and port for popular WebDAV services. Select a preset from the dropdown, fill in your credentials, and connect.

| Preset | Endpoint Path | Port | Free Tier | Notes |
| ------ | ------------- | ---- | --------- | ----- |
| **Nextcloud** | `/remote.php/dav/files/USERNAME/` | 443 | Varies by provider | Replace `USERNAME` with your exact login name |
| **Seafile** | `/seafdav` | 443 | 2 GB | SeafDAV must be enabled by the server admin |
| **CloudMe** | `/` (host: `webdav.cloudme.com`) | 443 | 3 GB | Direct WebDAV access, no path prefix needed |
| **Felicloud** | `/remote.php/dav/files/USERNAME/` | 443 | 10 GB | Hosted Nextcloud-based service with the same DAV path pattern |
| **Custom** | Any path | Any | -- | For any WebDAV-compatible server or NAS |

### Nextcloud Setup

Nextcloud is the most common WebDAV use case. To connect:

1. Select the **Nextcloud** preset.
2. Enter your Nextcloud server hostname (e.g. `cloud.example.com`).
3. Replace `USERNAME` in the path with your exact Nextcloud login name (case-sensitive).
4. For the password, generate an **app password** in Nextcloud: go to **Settings > Security > Devices & sessions** and create a new app password.

> **Important**: Do not use your main Nextcloud password if you have 2FA enabled -- it will be rejected. App passwords bypass 2FA and are the recommended authentication method.

### Seafile Setup

Seafile uses the SeafDAV extension for WebDAV access:

1. Select the **Seafile** preset (path auto-fills to `/seafdav`).
2. Enter your Seafile server hostname.
3. Use your Seafile account credentials.

> **Note**: SeafDAV must be enabled by the Seafile server administrator. Check `seahub_settings.py` for `ENABLE_WEBDAV_SECRET`. If it is not enabled, you will receive a 404 error on the WebDAV endpoint.

### CloudMe Setup

CloudMe provides direct WebDAV access at `webdav.cloudme.com`:

1. Select the **CloudMe** preset.
2. The host is auto-filled to `webdav.cloudme.com`.
3. Enter your CloudMe username and password.
4. 3 GB of free storage is available.

## Root Boundary Enforcement

AeroFTP enforces a **root boundary** based on the configured WebDAV path. This means:

- Navigation is restricted to the initial path and its subdirectories.
- The `cd()` and `cd_up()` operations cannot navigate above the configured path.
- This prevents accidental access to other users' directories on multi-tenant servers.

For example, if you connect with path `/remote.php/dav/files/alice/`, you cannot navigate to `/remote.php/dav/files/bob/` even if the server would allow it. The root boundary is enforced client-side by AeroFTP.

## Authentication Methods

AeroFTP supports two HTTP authentication schemes for WebDAV:

### Basic Authentication

The default method. Username and password are sent as a Base64-encoded header on each request. When used over HTTPS (recommended), this is secure because the entire HTTP conversation is encrypted.

### Digest Authentication (RFC 2617)

Some WebDAV servers require Digest authentication, where the password is never sent over the wire -- instead, a hash-based challenge-response mechanism is used. AeroFTP auto-detects Digest authentication when the server responds with a `401 Unauthorized` and a `WWW-Authenticate: Digest` header, then automatically switches to the Digest scheme.

You do not need to configure this manually. AeroFTP handles the detection and switching transparently.

## Features

- **PROPFIND**: Directory listings are retrieved using the WebDAV `PROPFIND` method with `Depth: 1`. AeroFTP parses the XML response to extract file names, sizes, modification times, and content types.
- **TLS**: All HTTPS connections use the system's certificate store for validation. Self-signed certificates trigger a confirmation dialog before proceeding.
- **Streaming uploads**: Large files are uploaded using chunked transfer encoding, so they are streamed from disk without loading the entire file into memory.
- **Create directories**: The `MKCOL` method is used to create new directories on the server.
- **Delete**: The `DELETE` method removes files and directories (recursively for directories).
- **Move/Rename**: The `MOVE` method with a `Destination` header handles both moves and renames.

## CLI Usage

The AeroFTP CLI supports WebDAV connections using URL syntax:

```bash
# Nextcloud -- list files
aeroftp ls webdav://user@cloud.example.com/remote.php/dav/files/user/

# Nextcloud -- download a file
aeroftp get webdav://user@cloud.example.com/remote.php/dav/files/user/Documents/report.pdf ./

# Nextcloud -- upload a file
aeroftp put webdav://user@cloud.example.com/remote.php/dav/files/user/Documents/ ./notes.txt

# CloudMe -- list root
aeroftp ls webdav://user@webdav.cloudme.com/

# Custom WebDAV server on HTTP (non-TLS)
aeroftp ls webdav://user@nas.local:5005/webdav/share/ --insecure

# Directory tree
aeroftp tree webdav://user@cloud.example.com/remote.php/dav/files/user/ -d 3

# JSON output
aeroftp ls webdav://user@cloud.example.com/remote.php/dav/files/user/ -l --json
```

Passwords are prompted interactively. For saved connections, use `--profile "My Nextcloud"` instead of URL mode.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `401 Unauthorized` | Wrong credentials or case-sensitive username | Verify credentials; ensure the username in the path matches your login exactly (case-sensitive on Nextcloud) |
| `404 Not Found` | Wrong endpoint path | Check the WebDAV path -- Nextcloud requires `/remote.php/dav/files/USERNAME/`, Seafile requires `/seafdav` |
| `405 Method Not Allowed` | Server does not support the requested WebDAV method | The server may have a limited WebDAV implementation; check server documentation |
| Cannot navigate above initial path | Root boundary enforcement | This is by design -- AeroFTP restricts navigation to the configured path |
| Slow directory listings (1000+ files) | WebDAV PROPFIND is verbose | WebDAV XML responses are larger than SFTP metadata; expect slower listing for very large directories |
| Self-signed certificate error | Server uses a self-signed TLS certificate | Accept the certificate in the confirmation dialog, or use `--insecure` in the CLI |
| 2FA login fails on Nextcloud | Using main password instead of app password | Generate an app password in Nextcloud Settings > Security > Devices & sessions |

## Tips

- For **Nextcloud**, always generate an app password. This is the officially recommended method and avoids issues with 2FA, rate limiting, and account lockout policies.
- WebDAV performance depends heavily on the server. For directories with many files, SFTP is significantly faster because it avoids the XML parsing overhead.
- When using AeroSync with WebDAV, the **size + modification time** compare mode is recommended. WebDAV servers do not consistently provide checksums, and the `getlastmodified` property may have only second-level precision.
- For NAS devices (Synology, QNAP) that offer both WebDAV and SFTP, prefer SFTP for better performance and more reliable file metadata.
- CloudMe's free tier (3 GB) is one of the few remaining free WebDAV services that works without any server-side configuration.
