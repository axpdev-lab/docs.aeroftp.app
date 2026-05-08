---
title: ImageKit with AeroFTP
description: Connect to ImageKit in AeroFTP using the native REST API with private key authentication for media CDN and storage workflows.
---

# ImageKit

[ImageKit](https://imagekit.io) is an image and video CDN with built-in storage, real-time transformations, and a generous 20 GB media + 20 GB bandwidth/month free tier. AeroFTP connects to ImageKit through its native REST API as a first-class `StorageProvider`, with full list / upload / download / delete / mkdir / rename support plus media-CDN transformation passthrough. Shipped in **v3.7.2** as the 23rd protocol.

## Connection Settings

| Field | Value |
| --- | --- |
| Endpoint | `https://api.imagekit.io` (automatic) |
| URL Endpoint ID | Your account's ImageKit URL (e.g. `https://ik.imagekit.io/yourname`) |
| Private Key | From ImageKit dashboard > Developer Options > API Keys |
| Public Key | From the same panel (used for signed URLs and transformations) |
| Auth | HTTP Basic with the private key |

> The Activity Log renders `Authenticated as ik.imagekit.io/yourname` in the clear instead of masking the URL endpoint as a 3-char prefix. The endpoint URL is not secret. Private keys remain masked.

## How to Connect

1. Sign in at [imagekit.io](https://imagekit.io) and create or open your media library.
2. Navigate to **Developer Options > API Keys** and generate a private + public key pair (or copy the existing pair).
3. In AeroFTP, open **Discover Services** and pick **ImageKit** from the **Photo & Media** tier.
4. Enter your URL endpoint, private key, and public key.
5. Click **Connect**. AeroFTP authenticates and lists the root media library.

## Features

- **Native folder semantics**: ImageKit folders map directly to AeroFTP directories. Create / rename / delete with the standard tools.
- **Upload / download**: Multipart upload via `/files/upload`, streaming download with progress bars and `.aerotmp` atomic writes.
- **Listing**: Uses `/files` with `type=all` so a single call returns the folder + file mix. AeroFTP's tolerant `null_to_default` deserializer handles ImageKit's per-row `null` fields on folder entries (`size`, `tags`, `mime`, `fileType`, dimensions).
- **Search and metadata**: File metadata, tags, and descriptions are surfaced in the Properties dialog.
- **CDN transformations passthrough**: Share links surface the raw `URL Endpoint ID` so you can append ImageKit transformation parameters (`tr:w-300,h-300,q-80`, etc.) directly. Combine with AeroSync to build content-aware delivery pipelines.
- **CrossProfile**: ImageKit is wired into Cross-Profile Transfer, IconPicker (Media category), and SessionTabs.

## CLI

```bash
aeroftp-cli ls --profile "MyImageKit"
aeroftp-cli put --profile "MyImageKit" ./photos/*.jpg /campaigns/2026/
aeroftp-cli get --profile "MyImageKit" "/campaigns/2026/*.jpg" ./local-cache/
aeroftp-cli sync --profile "MyImageKit" ./marketing /uploads/marketing
```

The CLI resolves the API key from the encrypted vault on every call. The key is never visible on the command line.

## Tips

- ImageKit private keys inherit account-wide access. Use a dedicated key for AeroFTP if you need to revoke it independently of dashboard logins.
- The free tier covers 20 GB of media plus 20 GB of bandwidth per month. Heavy CDN traffic counts against the bandwidth quota, not the storage quota.
- ImageKit auto-applies AVIF / WebP conversion when the client supports it. Original uploads are preserved as-is.
- Activity Log will show `Authenticated as ik.imagekit.io/<endpoint>` (URL only, no key fragments).

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `Invalid configuration: Your request contains invalid value for type parameter` | Pre-v3.7.3 builds sent `type=file-and-folder` (not in API enum) | Update to v3.7.3 or later. Listing now uses `type=all`. |
| `Parse error: error decoding response body` on listing | ImageKit returns `null` for `size` / `tags` / `mime` on folder rows | Update to v3.7.3 or later. The deserializer now tolerates per-row nulls. |
| `401 Unauthorized` | Wrong private key, or revoked from dashboard | Regenerate the private key and reconnect. |
| Empty listing | Wrong URL endpoint | Confirm the URL endpoint matches `https://ik.imagekit.io/<your-name>` exactly. |

## Related Documentation

- [Uploadcare](/providers/uploadcare) - sibling EU/GDPR media provider
- [Cloudinary](/providers/cloudinary) - sibling image/video CDN provider
- [Immich](/providers/immich) - self-hosted media library
- [ImageKit Official Docs](https://docs.imagekit.io/)
