---
title: Felicloud with AeroFTP
description: Connect Felicloud to AeroFTP using its Nextcloud-style WebDAV path, email-based login, and app-token friendly setup.
---

Felicloud is a hosted cloud storage service built on a Nextcloud-style WebDAV model. AeroFTP can connect to it directly with a dedicated **Felicloud preset** using the standard DAV path pattern.

## Why Use AeroFTP with Felicloud

- desktop file access to a hosted EU-focused cloud service
- saved profiles for recurring upload, download, and sync workflows
- a familiar WebDAV path pattern similar to hosted Nextcloud services
- one client for Felicloud, Nextcloud, Quotaless WebDAV, and generic WebDAV servers

## What You Need

- your Felicloud login email
- your password or app token
- the default WebDAV path tied to your account name

## Default WebDAV URL

Felicloud uses this WebDAV path pattern:

```text
https://cloud.felicloud.com/remote.php/dav/files/{username}/
```

Replace `{username}` with the exact username or email-based account identifier expected by Felicloud.

## How to Connect

1. Open AeroFTP.
2. Select **Felicloud** from the WebDAV provider list.
3. Enter your account email.
4. Enter your password or app token.
5. Confirm the default Felicloud DAV URL.
6. Connect and save the profile.

## Recommended Defaults

- use the **Felicloud** preset instead of generic WebDAV
- keep HTTPS enabled on port `443`
- prefer an app token if Felicloud exposes one in the security settings
- keep the default `/remote.php/dav/files/{username}/` path format

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `401 Unauthorized` | Wrong email, password, or token | Verify the exact login identifier and try an app token if available |
| `404 Not Found` | Username placeholder not replaced correctly | Re-check the final DAV path and account identifier |
| Login works in browser but not in AeroFTP | WebDAV requires app-token style auth | Generate and use an app token when possible |
| Opens wrong folder | Wrong account identifier in the DAV path | Update the username portion of the path to match the account |

## Related Documentation

- [WebDAV](/protocols/webdav)
- [Nextcloud](/providers/nextcloud)
- [Provider Reference](/advanced/provider-reference)
