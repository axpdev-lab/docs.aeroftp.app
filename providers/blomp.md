---
title: Blomp with AeroFTP
description: Connect Blomp to AeroFTP over OpenStack Swift with 40 GB free storage. Production-ready, live-verified against a real account.
---

# Blomp

<ProviderPlanCard id="blomp" />

[Blomp](https://blomp.com) is a cloud storage provider offering **40 GB free**, plus 40 GB for every referral who stays active, up to 400 GB. It is built on an OpenStack Swift backend, and AeroFTP connects to it through its **native Swift provider**, not through S3.

::: tip Status: production
Blomp graduated to production once its Swift backend was verified against a live account. Log in with your Blomp email and password and the container is discovered for you.
:::

## Connection Settings

You normally only supply the username and password; the preset fills in the rest.

| Field | Value |
| --- | --- |
| Protocol | OpenStack Swift (**not** S3) |
| Auth endpoint | `https://authenticate.blomp.com` (Keystone v2) |
| Username | Your Blomp login **email** |
| Password | Your Blomp account password |
| Tenant name | `storage` — fixed, identical for every Blomp account |
| Container | Named after your login email; AeroFTP resolves it automatically |

## Files Larger Than 5 GiB

OpenStack Swift caps a single object at 5 GiB, and Blomp inherits that limit. **AeroFTP handles it for you.** Above 5 GiB the upload switches automatically to Swift **Static Large Objects**: the file is split into 1 GiB segments stored under `.file-segments/{object}/`, then a manifest is written at the real object path. You upload a 40 GB file the same way you upload a 40 KB one.

Two things worth knowing:

- The segments live in the same container under `.file-segments/`. Deleting that folder by hand breaks the large objects that reference it.
- This is native Swift SLO, not a client-side chunking overlay. The object is a normal Swift large object, so other Swift clients read it correctly — you are not locked into AeroFTP to get your data back.

::: info The 403 on account listing is expected
Blomp forbids the account-level container listing that Swift normally offers, and answers `403` even for a correctly authenticated session. This is **by design on Blomp's side, not an error in your configuration and not an outage**. AeroFTP handles it by falling back to the deterministic container named after your username, so browsing and transfers work normally. If you have read older notes describing this as an unresolved upstream bug, they are out of date.
:::

## Why Use AeroFTP with Blomp

- 40 GB free storage, reaching 400 GB through referrals
- one client for Blomp alongside S3, WebDAV, SFTP, FTP and 30+ other backends
- saved profile in the encrypted vault, no plaintext credentials on disk
- AeroSync, AeroVault overlay, and the CLI all work against Blomp like any other backend

## How to Connect

1. Sign up at [blomp.com](https://blomp.com) and confirm the 40 GB free tier.
2. In your Blomp dashboard, generate an **Access Key ID** and **Secret Access Key**.
3. Note the S3 endpoint URL Blomp provides for your account.
4. In AeroFTP, open **Discover Services** and pick **Blomp**.
5. Enter the access key, secret key, endpoint, and bucket name.
6. Click **Connect**. AeroFTP authenticates against Blomp's S3 front-door.

## Current Limitations

Until Blomp's upstream proxy fix lands, AeroFTP behaves as follows:

- **Auth succeeds, listing 403**: the S3 front-door accepts your credentials but returns `403` on `ListObjects` calls. AeroFTP surfaces this as `Provider error: AccessDenied` in the Activity Log.
- **Uploads also 403**: same root cause. The provider will display the auth state correctly but operations fail.
- **AeroSync disabled**: any `sync` operation will halt at the listing step with the same `403`.

The integration code path itself is correct (it is a thin S3 wrapper), so the preset will become fully functional once Blomp's proxy is fixed without any AeroFTP-side change required.

## Recommended Defaults

- enable path-style addressing (Blomp does not support virtual-hosted style)
- keep the S3 region as `us-east-1` (placeholder; Blomp's gateway accepts any v4-signed region)
- choose a non-critical Blomp bucket for testing until the upstream fix lands
- if you need a working S3 backend in the meantime, use [MinIO](/providers/minio), [Wasabi](/providers/wasabi), [Storj](/providers/storj), or [IDrive e2](/providers/idrive-e2)

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `403 Forbidden` on the account-level container listing | Blomp forbids that call by design, for every client | Nothing to do. AeroFTP falls back to the container named after your username, so browsing and transfers work. See the note "The 403 on account listing is expected" above. |
| `404 Not Found` on bucket | Wrong bucket name or endpoint | Verify the exact bucket and endpoint in your Blomp dashboard. |
| `SignatureDoesNotMatch` | Time skew, wrong region, or wrong path-style setting | Ensure path-style is enabled and the system clock is in sync. |

## Related Documentation

- [S3-Compatible](/protocols/s3) - protocol-level technical reference
- [MinIO](/providers/minio) - reliable self-hosted S3 alternative
- [Wasabi](/providers/wasabi) - paid S3-compatible alternative with no egress fees
- [Blomp Website](https://blomp.com)
