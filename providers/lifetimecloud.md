---
title: LifetimeCloud with AeroFTP
description: Connect LifetimeCloud storage to AeroFTP with the built-in WebDAV preset, your username and a dedicated WebDAV token.
---

# LifetimeCloud

<ProviderPlanCard id="lifetimecloud" />

LifetimeCloud provides cloud storage accessible over standard WebDAV. AeroFTP includes a dedicated **LifetimeCloud** preset with the endpoint pre-configured, so you only enter your username and WebDAV token.

The 1 GB trial account requires no card and includes WebDAV access (up to 50 MB per file, max 50 files, family sharing for 2 members, 1 year of version history from the web or desktop client, and 30 days / last 3 versions via WebDAV).

::: info Availability
The LifetimeCloud preset ships in AeroFTP 4.2.8. On earlier versions, use the generic **WebDAV** form with the server `https://lifetimecloud.me/dav/<your-username>/` and port 443.
:::

## What You Need

- a LifetimeCloud account at [lifetimecloud.me](https://lifetimecloud.me/register)
- your LifetimeCloud username
- WebDAV enabled on your account and a generated **WebDAV token** from your [LifetimeCloud Profile](https://lifetimecloud.me/profile)

## How to Connect

1. Open AeroFTP.
1. Select **LifetimeCloud** from the WebDAV providers.
1. Enter your LifetimeCloud **username**.
1. Paste your **WebDAV token** (do not use your LifetimeCloud account login password).
1. Connect and verify the directory listing.

The server URL `https://lifetimecloud.me/dav/{username}/` is configured automatically: the `{username}` placeholder is replaced with the username you enter.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | WebDAV | Built-in preset |
| Server | `https://lifetimecloud.me/dav/{username}/` | Auto-configured from username |
| Port | 443 | HTTPS |
| Username | Your LifetimeCloud username | Used in both auth and the `/dav/{username}/` path |
| WebDAV token | Token generated in Profile | Separate from your LifetimeCloud account login password |

## Features and Security Notes

- **File operations**: upload, download, rename, move, and delete files and folders.
- **Deletes over WebDAV**: deletions issued over WebDAV are immediate and permanent rather than moving items to a server Trash folder; version history recovery via the web interface remains subject to the plan's retention limits (30 days / last 3 versions for WebDAV changes).
- **AeroSync**: supported with size + modification time compare mode.
- **Share links**: not available through WebDAV.
- **Transport vs. client-side encryption**: the WebDAV endpoint is standard HTTPS, not provider-side end-to-end encryption. If you want client-side encryption before upload, attach an optional **AeroCrypt** or **rclone crypt** overlay in AeroFTP's overlays panel rather than expecting WebDAV itself to encrypt filenames or payloads at rest.

## Tips

- Always authenticate WebDAV with the token generated in [lifetimecloud.me/profile](https://lifetimecloud.me/profile); account passwords fail with HTTP 401/403.
- Keep trial uploads under 50 MB per file and 50 files total when testing on the 1 GB trial account.
- If exporting a profile or configuring another tool manually, replace `{username}` with your actual LifetimeCloud username in `https://lifetimecloud.me/dav/{username}/`.

## Related Documentation

- [LifetimeCloud WebDAV / rclone guide](https://lifetimecloud.me/articles/rclone-webdav-guide.html)
- [WebDAV](/protocols/webdav)
