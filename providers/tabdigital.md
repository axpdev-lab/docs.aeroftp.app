---
title: Tab.digital with AeroFTP
description: Connect Tab.digital to AeroFTP using its Nextcloud-as-a-Service WebDAV preset, EU/GDPR positioning, 8 GB free tier, and OCS share links.
---

# Tab.digital

[Tab.digital](https://tab.digital) is an EU-based, GDPR-positioned Nextcloud-as-a-Service provider with an 8 GB free tier. AeroFTP connects to Tab.digital through its dedicated **Tab.digital preset**, built on top of the standard WebDAV + OCS API stack already used for Nextcloud and Felicloud. Shipped in **v3.7.4**.

## Connection Settings

| Field | Value |
| --- | --- |
| WebDAV URL | `https://cloud.tab.digital/remote.php/dav/files/{username}/` |
| Username | Your Tab.digital account username (or email-based identifier) |
| Password | Your account password or app token |
| OCS Endpoint | `https://cloud.tab.digital/ocs/v2.php/` (automatic) |
| Port | 443 (HTTPS) |

## Why Use AeroFTP with Tab.digital

- desktop file access to a hosted EU-only cloud service
- saved profiles for recurring upload, download, and sync workflows
- a familiar Nextcloud-style WebDAV path pattern
- one client for Tab.digital, Nextcloud, Felicloud, Quotaless WebDAV, and generic WebDAV servers
- OCS share-link badge in the IntroHub `ServerCard` and Discover catalog

## How to Connect

1. Sign up at [tab.digital](https://tab.digital) and confirm your account.
2. Open AeroFTP and pick **Tab.digital** from the **WebDAV** tier in **Discover Services**.
3. Enter your username (or email-based account identifier) and password / app token.
4. Confirm the default DAV path: `https://cloud.tab.digital/remote.php/dav/files/{username}/`. AeroFTP auto-substitutes `{username}`.
5. Click **Connect** and save the profile.

## Features

- **Native WebDAV**: list, upload, download, mkdir, rename, delete, move all use the standard WebDAV verbs (PROPFIND, PUT, GET, MOVE, MKCOL, DELETE).
- **OCS share links**: native share-link generation with optional password and expiry through Nextcloud's OCS API. The OCS badge in the IntroHub `ServerCard` confirms the OCS API is reachable.
- **Trash recovery**: Tab.digital's WebDAV exposes the standard Nextcloud trash endpoint at `/remote.php/dav/trashbin/{username}/trash/`. AeroFTP's WebDAV provider lists the trash folder when navigating up from root.
- **Real-time quota**: AeroFTP polls the standard WebDAV quota properties (`{DAV:}quota-used-bytes`, `{DAV:}quota-available-bytes`) for the storage badge in the StatusBar.
- **healthCheckUrl preset**: Server Health Check probes Tab.digital's status endpoint to surface DNS / TCP / TLS / HTTP latency in IntroHub Pro.

## Recommended Defaults

- use the **Tab.digital** preset instead of generic WebDAV
- keep HTTPS enabled on port 443
- prefer an app token if Tab.digital exposes one in the security settings
- keep the default `/remote.php/dav/files/{username}/` path format

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `401 Unauthorized` | Wrong username, password, or token | Verify the exact login identifier and try an app token if available |
| `404 Not Found` | Username placeholder not replaced correctly | Re-check the final DAV path and account identifier |
| Login works in browser but not in AeroFTP | WebDAV requires app-token style auth | Generate and use an app token when possible |
| Wrong OCS badge color | Pre-v3.7.4 builds used a stale OCS color | Update to v3.7.4 or later: badge is now consistent with Felicloud/Nextcloud |
| Stale `basePath` on import | Pre-v3.7.4 preset shipped legacy `basePath` defaults | Re-add the profile with the v3.7.4+ preset; the IntroHub auto-strips legacy WebDAV roots |

## CLI

```bash
aeroftp-cli ls --profile "MyTabDigital"
aeroftp-cli put --profile "MyTabDigital" ./docs/*.pdf /Documents/
aeroftp-cli get --profile "MyTabDigital" "/Photos/*" ./backups/
aeroftp-cli sync --profile "MyTabDigital" ./important /backup/important
aeroftp-cli link --profile "MyTabDigital" /Documents/share.pdf --expires 7d
```

## Related Documentation

- [Nextcloud](/providers/nextcloud) - parent Nextcloud preset
- [Felicloud](/providers/felicloud) - sibling EU Nextcloud-as-a-Service preset
- [WebDAV](/protocols/webdav) - protocol-level technical reference
- [Tab.digital Website](https://tab.digital)
