---
title: Nextcloud with AeroFTP
description: Connect Nextcloud to AeroFTP using the built-in WebDAV preset, standard path format, and app-password friendly setup.
---

# Nextcloud

<ProviderPlanCard id="nextcloud" />

Nextcloud is one of the most common WebDAV-based storage and collaboration platforms. AeroFTP includes a dedicated **Nextcloud preset** that fills the expected WebDAV path automatically.

## Why Use AeroFTP with Nextcloud

- Desktop file management for self-hosted or managed Nextcloud instances
- Dual-pane browsing, transfer queue, and saved profiles
- No need to manually remember the standard WebDAV path every time
- Good fit for self-hosted file access without relying on a browser UI

## Standard Nextcloud WebDAV Path

The usual Nextcloud WebDAV path is:

```text
/remote.php/dav/files/USERNAME/
```

Replace `USERNAME` with your exact Nextcloud login name.

## How to Connect

1. Open AeroFTP.
2. Select **Nextcloud** from the WebDAV presets.
3. Enter your Nextcloud server hostname.
4. Replace `USERNAME` in the path with your real login name.
5. Enter your username.
6. Enter a password or, preferably, an app password.
7. Connect and save the profile.

## Recommended Defaults

- protocol: WebDAV over HTTPS
- path: `/remote.php/dav/files/USERNAME/`
- use an app password if your server has 2FA enabled

## Transfer behavior in v4.2.5

AeroFTP detects Nextcloud capabilities from the connection and server responses, including configurations entered as a bare origin. Suitable uploads use Nextcloud chunked upload v2; retryable chunk failures are retried in place. Parallel file and chunk work still obeys the live session and resource limits. The WebDAV transfer pool advertises a ceiling of up to eight parallel file transfers, not eight requests for every operation. Multipart chunk concurrency is a separate limit within the provider's resource budget.

Replacing a file uses the provider's guarded replacement path rather than assuming that an overwriting WebDAV `MOVE` preserves the old destination until success. See [WebDAV](/protocols/webdav) for the transport behavior and [DAG engine](/architecture/dag-transfer-engine) for the selected runner.

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| 401 Unauthorized | Wrong credentials or wrong username in the path | Check both the login credentials and the path username |
| 404 Not Found | Wrong WebDAV path | Use the standard Nextcloud path shown above |
| 2FA login fails | Main password used instead of app password | Generate an app password in Nextcloud security settings |

## Related Documentation

- [WebDAV](/protocols/webdav)
- [Quick Start](/getting-started/quick-start)
