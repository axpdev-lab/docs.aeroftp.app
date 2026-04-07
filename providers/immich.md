---
title: Immich with AeroFTP
description: Connect to Immich or PixelUnion in AeroFTP using the native REST API with API key authentication.
---

# Immich

[Immich](https://immich.app) is an open-source (AGPL v3), self-hosted photo and video management platform. AeroFTP connects to any Immich instance via the REST API using API key authentication.

[PixelUnion](https://pixelunion.eu) is an EU-hosted managed Immich service (16 GB free) available as a preset in AeroFTP's Discover panel.

## Connection Settings

| Field | Value |
| --- | --- |
| Server URL | Your Immich instance URL (e.g. `https://photos.example.com`) |
| API Key | Generated in Immich > User Settings > API Keys |
| Port | 443 (automatic) |

For PixelUnion, use `https://yourname.pixelunion.eu` as the server URL.

## How to Connect

1. Select **Immich** (or **PixelUnion**) from Discover Services.
2. Enter your server URL and API key.
3. Click **Connect**.

## Features

- **Albums as folders**: Each Immich album appears as a directory. Create new albums with "New Folder" from root.
- **Virtual folders**: `[All Assets]` shows all photos/videos, `[Favorites]` shows starred items.
- **Upload**: Drag and drop files into albums or `[All Assets]`. Automatic deduplication via SHA-256.
- **Download**: Download originals with streaming progress.
- **Delete**: Sends items to Immich's soft trash (recoverable from Immich web UI).
- **Share links**: Generate shareable URLs for albums and individual files.
- **Search**: Find files by name from root or within specific albums.
- **Checksum**: SHA-256 integrity verification.
- **CLI**: Full support via `aeroftp-cli --profile "MyImmich"` for scripting and automation.

## Limitations

- **No rename**: Immich does not support renaming assets via API.
- **No move**: Moving files between albums is not supported.
- **No nested albums**: Albums are flat (one level only).
- **No storage quota**: The API does not expose storage usage.

These operations are automatically disabled in AeroFTP's UI when connected to Immich.

## Tips

- API keys inherit the permissions of the user who created them. Use a dedicated key for AeroFTP.
- Immich uses EXIF data to organize photos by date. Uploaded files retain their original timestamps.
- Share links can be created for individual photos or entire albums.
- For self-hosted instances, make sure your Immich server is accessible over HTTPS.
- PixelUnion offers 16 GB free storage with EU data residency (Netherlands).

## Related Documentation

- [Immich Official Docs](https://immich.app/docs/overview/introduction)
- [PixelUnion Help Center](https://pixelunion.eu)
