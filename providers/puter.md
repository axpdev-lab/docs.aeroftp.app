---
title: Puter with AeroFTP
description: Connect Puter cloud storage to AeroFTP with the built-in WebDAV preset, your username and password or auth token.
---

# Puter

<ProviderPlanCard id="puter" />

Puter is a cloud platform whose storage is reachable over WebDAV. AeroFTP includes a dedicated **Puter** preset with the endpoint pre-configured, so you only enter your username and password.

The free tier gives you 25 MB of storage and needs no card.

<!-- Free tier (25 MB, no card required) confirmed in the provider task card. Prices and other figures are left out on purpose. -->

::: info Availability
The Puter preset ships in AeroFTP 4.2.8. On earlier versions, use the generic **WebDAV** form with the server `https://dav.puter.com/<your-username>` and port 443.
:::

## What You Need

- a Puter account at [puter.com](https://puter.com)
- your Puter username
- your Puter password, or an auth token (see [Token auth](#token-auth))

## How to Connect

1. Open AeroFTP.
1. Select **Puter** from the WebDAV providers.
1. Enter your Puter **username** and **password**.
1. Connect and verify the directory listing.

The server URL `https://dav.puter.com/{username}` is configured automatically: the `{username}` placeholder is replaced with the username you enter.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | WebDAV | Built-in preset |
| Server | `https://dav.puter.com/{username}` | Auto-configured from username |
| Port | 443 | HTTPS |
| Username | Your Puter username | |
| Password | Your Puter password | With 2FA enabled, append the current 6-digit code. The code expires, so token auth is better for sustained sessions and sync (see below) |

## Token auth

Puter also accepts an auth token as the password. For token auth:

1. Use the literal username `-token` (dash followed by "token", nothing before it).
2. Paste the auth token as the **password**.
3. Open the profile's **Advanced** settings and set **Server** to `https://dav.puter.com/<your-username>` with your real account username.

The preset fills `{username}` with the login name, so with the literal `-token` username the path would point at a user that does not exist; overriding Server keeps the real username in the path. Token auth is recommended for sustained sessions and AeroSync, because it does not expire the way an appended 2FA code does.

## Features

- **File operations**: upload, download, rename, move, and delete files and folders
- **AeroSync**: supported with size + modification time compare mode
- **Share links**: not available through WebDAV

## Tips

- The WebDAV endpoint includes your username in the path. AeroFTP fills this in automatically when you select the Puter preset.
- With two-factor authentication enabled, append the current 6-digit 2FA code to your password when connecting. The saved code expires, so later requests can fail; use [token auth](#token-auth) for sessions and sync that must stay connected.

## Related Documentation

- [Puter documentation](https://docs.puter.com)
- [WebDAV](/protocols/webdav)
