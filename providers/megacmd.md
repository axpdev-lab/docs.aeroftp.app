---
title: MEGAcmd local WebDAV bridge with AeroFTP
description: Connect AeroFTP to a MEGA account via the official MEGAcmd CLI's built-in local WebDAV server on 127.0.0.1:4443.
---

# MEGAcmd (local WebDAV)

MEGAcmd is MEGA's official command-line tool. It ships with a built-in WebDAV server that exposes your signed-in MEGA account on `127.0.0.1:4443` so any WebDAV-aware client can read and write encrypted MEGA storage without re-implementing the MEGA SDK.

AeroFTP includes a **MEGAcmd (local WebDAV)** Discover preset that pre-fills the bridge URL and authentication mode.

| Field | Value |
|-------|-------|
| Server | `http://127.0.0.1:4443/` |
| Port | `4443` |
| Authentication | **Anonymous** (no Authorization header sent) |
| Scheme | HTTP |

> **When to use this**: pick MEGAcmd if you already use MEGAcmd for syncs or scripts elsewhere on your machine and want AeroFTP to ride the same authenticated session, or if you need a shared local mountpoint that other applications can reach over WebDAV. For a first-time MEGA setup, prefer the [native MEGA provider](/providers/mega) - it speaks the SDK directly, supports E2E share links, and does not require a separate daemon.

## Setup

1. Install [MEGAcmd](https://mega.io/cmd) for your platform.
2. Open the MEGAcmd terminal and sign in:
   ```
   login your-email@example.com
   ```
3. Start the WebDAV bridge on the default mountpoint:
   ```
   webdav /
   ```
   This serves the entire account root over WebDAV. To expose only a subtree, replace `/` with the path you want.
4. Close the MEGAcmd terminal window. The WebDAV server keeps running in the background as long as the MEGAcmd daemon is alive.
5. In AeroFTP, open Discover, pick **MEGAcmd (local WebDAV)**, and connect. No credentials are needed.

## Anonymous Authentication

The MEGAcmd WebDAV server does not enforce HTTP Basic auth - the local listener trusts that only the user's session can reach it. AeroFTP sends an explicit anonymous request (no `Authorization` header at all) so the bridge does not see a malformed `Authorization: Basic` header and refuse the connection. This was a bug class in earlier versions and is fixed in v3.7.1.

## Lifecycle

- The bridge dies when the MEGAcmd daemon exits. On most platforms the daemon is started lazily by the first `mega-cmd` invocation; reboot the host or run `mega-quit` and `mega-cmd` again to restart.
- Multiple `webdav` invocations can pin different MEGA subtrees to the same listener; they appear as additional URLs printed when MEGAcmd starts.
- The bridge does not auto-reconnect if the MEGAcmd session expires. Run `login` again before opening AeroFTP.

## Tips

- For Mount Manager use, point the [Mount Manager](/features/mount-manager) at the saved profile so the mountpoint is persistent and can autostart with the rest of your AeroFTP mounts.
- For backup workflows, AeroSync's bandwidth control and verification policies work the same way through MEGAcmd as they do through the native MEGA provider, but throughput is generally lower because every request goes through MEGAcmd's local proxy.
- If the connection silently drops, check the MEGAcmd daemon log (`~/.megaCmd/megacmd.log` on Linux) for sign-in expiry messages.

## Related

- [MEGA native provider](/providers/mega) - direct SDK path, E2E share links.
- [MEGA S4 Object Storage](/providers/mega-s4) - MEGA's paid S3-compatible offering.
- [WebDAV protocol](/protocols/webdav)
