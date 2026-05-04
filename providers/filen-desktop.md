---
title: Filen Desktop bridges with AeroFTP
description: Connect AeroFTP to a logged-in Filen Desktop instance via the local WebDAV (port 1900) or local S3 (port 1700) Network Drive bridges.
---

# Filen Desktop (local bridges)

Filen Desktop ships two **Network Drive** bridges that let any S3-aware or WebDAV-aware client talk to your Filen account through the desktop app's local listener. AeroFTP exposes both as first-class Discover entries.

| Preset | Endpoint | Port | Auth | Notes |
|--------|----------|------|------|-------|
| **Filen Desktop (local WebDAV)** | `local.webdav.filen.io` | `1900` | Basic auth (separate from the Filen account) | HTTP only. Needs the WebDAV bridge enabled in Filen Desktop. |
| **Filen Desktop (local S3)** | `local.s3.filen.io` | `1700` | Access key + secret (separate from the Filen account) | HTTP only. Path-style addressing, region must be `filen`, bucket must be `filen`. |

Both bridges run on `127.0.0.1` and require Filen Desktop to be open and signed in. AeroFTP enforces HTTP for these specific hostnames in the WebDAV scheme detector so the handshake never tries TLS against a plaintext listener.

> **When to use which**: pick the **WebDAV** bridge if the rest of your tooling already speaks WebDAV; pick the **S3** bridge if you want to use the AeroFTP S3 streaming code path (multi-thread chunk parallel download, prefix listing) against your Filen vault. Both speak the same Filen account; you can switch between them without re-uploading anything.

## Filen Desktop > local WebDAV

### Setup

1. Open Filen Desktop and sign in with your Filen account.
2. Go to **Settings** > **Network Drive** > **WebDAV**.
3. Choose a **username** and **password** for the bridge. These are local credentials, separate from your Filen account.
4. Toggle **Enabled** and pick port **1900** (default) or a custom one.
5. Keep Filen Desktop running while you connect from AeroFTP.

### Connection settings

| Field | Value |
|-------|-------|
| Server | `local.webdav.filen.io` |
| Port | `1900` |
| Scheme | HTTP (auto-detected) |
| Username | The WebDAV bridge username (set in Filen Desktop) |
| Password | The WebDAV bridge password (set in Filen Desktop) |

The Discover preset ships inline setup steps so the credential fields render with the configuration path you have to walk in Filen Desktop above them.

## Filen Desktop > local S3

### Setup

1. Open Filen Desktop and sign in with your Filen account.
2. Go to **Settings** > **Network Drive** > **S3**.
3. Choose an **access key** and **secret key** for the bridge. These are local credentials, separate from your Filen account.
4. Toggle **Enabled** and pick port **1700** (default) or a custom one.
5. Region must stay `filen` and bucket must stay `filen`.
6. Keep Filen Desktop running while you connect from AeroFTP.

### Connection settings

| Field | Value |
|-------|-------|
| Endpoint | `http://local.s3.filen.io:1700` |
| Region | `filen` (literal) |
| Bucket | `filen` (literal) |
| Path-style addressing | **Required** |
| Access key | The S3 bridge access key (set in Filen Desktop) |
| Secret key | The S3 bridge secret key (set in Filen Desktop) |

## Why HTTP, not HTTPS

Both bridges listen on the loopback interface only. Filen Desktop does not provision a TLS certificate for `local.webdav.filen.io` or `local.s3.filen.io` because the hostnames resolve to `127.0.0.1`. AeroFTP's WebDAV scheme detector recognises these hostnames (alongside `localhost`, `127.0.0.1`, RFC 1918 ranges, `*.local`, and `*.localhost`) and pins them to HTTP regardless of port.

If you have a custom forward proxy that does add TLS in front of the bridge, override the scheme manually via the Discover preset's **Advanced** > **Endpoint URL** field (use the explicit `https://` prefix).

## Tips

- These bridges are not part of the native Filen API integration. Use the [Filen native provider](/providers/filen) when you want metadata-encrypted listings, 2FA-aware authentication, or v3 Argon2id login.
- The bridges are great for AeroSync (the WebDAV one) and for the multi-thread chunk parallel download path (the S3 one) but they cannot share files: share links and trash management still go through the native Filen provider.
- If the bridge looks unreachable, confirm Filen Desktop is foregrounded - the listeners are tied to the app process, not to a system service.

## Related

- [Filen native provider](/providers/filen) - the direct API path with end-to-end encryption.
- [WebDAV protocol](/protocols/webdav)
- [S3-Compatible protocol](/protocols/s3)
