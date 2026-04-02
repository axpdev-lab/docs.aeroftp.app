---
title: SourceForge with AeroFTP
description: Upload SourceForge releases from AeroFTP over SFTP using the built-in SourceForge preset and SSH key authentication.
---

Use AeroFTP to upload releases directly to SourceForge File Release System storage over SFTP. If you publish open source binaries, installers, archives, or release artifacts, the SourceForge preset gives you a faster desktop workflow than a terminal-only setup.

## Why Use AeroFTP with SourceForge

- Direct SFTP access to SourceForge release storage
- Simple release folder organization from a desktop app
- Transfer queue for multiple artifacts per release
- Saved profiles for recurring project uploads

## Connection Details

| Field | Value | Notes |
| ----- | ----- | ----- |
| Server | `frs.sourceforge.net` | Pre-filled by the preset |
| Port | `22` | Standard SFTP |
| Username | Your SourceForge username | Not your email address |
| Authentication | SSH key recommended | Required for reliable SourceForge upload access |

## How to Connect

1. Open AeroFTP.
2. Select **SourceForge** from the provider list.
3. Confirm the server is `frs.sourceforge.net`.
4. Leave the port on `22`.
5. Enter your SourceForge username.
6. Configure your SSH private key if AeroFTP prompts for SSH key authentication.
7. Connect and browse the release directory.

## Recommended Workflow

For each release:

1. create a version folder such as `v3.3.0/`
2. upload release artifacts into that folder
3. verify the expected files are present

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Authentication rejected | SSH key not configured or not uploaded to SourceForge | Upload your public key to SourceForge account settings |
| Permission denied on upload | Missing project permissions | Ensure you have release upload permissions for the project |
| Timeout | Temporary server slowness | Retry and increase timeout if needed |

## Related Documentation

- [SourceForge protocol guide](/protocols/sourceforge)
- [SFTP](/protocols/sftp)
