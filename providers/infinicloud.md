# InfiniCLOUD

InfiniCLOUD (formerly TeraCLOUD) is a Japanese cloud storage service with WebDAV support. AeroFTP includes a built-in InfiniCLOUD preset. The free plan includes 25 GB of storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | WebDAV | Built-in preset |
| Server | Your personal WebDAV URL | e.g. `https://<node>.teracloud.jp` |
| Port | 443 | HTTPS |
| Username | Your InfiniCLOUD username | |
| Password | App password | Generate from My Page > Apps Connection |

## How to Connect

1. Open AeroFTP.
2. Select **InfiniCLOUD** from the provider list.
3. Go to **My Page > Apps Connection** on the InfiniCLOUD website to find your personal WebDAV URL.
4. Enter the WebDAV URL, username, and app password.
5. Connect and verify the directory listing.

## Features

- **File operations**: Upload, download, rename, move, and delete files and folders.
- **AeroSync**: Supported with size + modification time compare mode.

## Tips

- Each InfiniCLOUD account has a unique WebDAV server URL assigned to a specific node. You must use your personal URL, not a generic endpoint.
- Generate an app password from **My Page > Apps Connection** for WebDAV access.
- The 25 GB free tier is generous compared to most WebDAV-compatible services.

## Related Documentation

- [WebDAV](/protocols/webdav)
