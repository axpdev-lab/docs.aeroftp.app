---
title: Hetzner Storage Box with AeroFTP
description: Set up Hetzner Storage Box in AeroFTP over SFTP with the correct host format, port 23, and recommended connection settings.
---

Hetzner Storage Box is a low-cost remote storage service designed for backup, file transfer, and archival workloads. AeroFTP supports Hetzner Storage Box through a built-in **SFTP preset**.

## Why Use AeroFTP with Hetzner Storage Box

- Desktop GUI instead of terminal-only workflows
- Saved profiles for multiple boxes or users
- Drag-and-drop uploads and downloads
- File browsing, folder management, and transfer queue support

## Connection Details

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | SFTP | Built-in preset |
| Port | `23` | Hetzner Storage Box uses port 23 for SSH/SFTP |
| Server | `{username}.your-storagebox.de` | Example: `u123456.your-storagebox.de` |
| Username | Your Storage Box username | Example: `u123456` |
| Password | Your Storage Box password | From the Hetzner Robot panel |

## How to Connect

1. Open AeroFTP.
2. Select **Hetzner Storage Box** from the provider list.
3. Enter your username and password.
4. Set the server in the form `{username}.your-storagebox.de`.
5. Leave the port on `23`.
6. Connect and verify the directory listing.
7. Save the profile for reuse.

## Recommended Defaults

- protocol: SFTP
- port: `23`
- server naming pattern: `{username}.your-storagebox.de`

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Connection refused | Wrong port | Storage Box SFTP uses port `23`, not `22` |
| Authentication failed | Wrong username or password | Confirm the exact Storage Box username in the Hetzner panel |
| Host key prompt appears | First SSH connection | Accept the host key after verifying the server hostname |

## Related Documentation

- [SFTP](/protocols/sftp)
- [Quick Start](/getting-started/quick-start)
