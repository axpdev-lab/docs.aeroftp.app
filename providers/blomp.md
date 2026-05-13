---
title: Blomp with AeroFTP
description: Connect Blomp to AeroFTP using OpenStack Swift / S3 endpoints with 40 GB free storage. Currently in pipeline pending upstream proxy fix.
---

# Blomp

<ProviderPlanCard id="blomp" />

[Blomp](https://blomp.com) is a cloud storage provider with a generous **40 GB free** tier, built on top of an OpenStack Swift backend with an S3-compatible front-door. AeroFTP exposes Blomp as a preset on top of the standard S3 protocol stack.

::: warning Status: pipeline (preset)
Blomp's S3 endpoint currently returns `403` on storage operations even after a successful authentication. The preset is shipped in AeroFTP for users who already have a working configuration, but the integration is gated on an upstream proxy fix from Blomp. Tracked in the [provider pipeline](https://github.com/axpdev-lab/aeroftp/blob/main/ROADMAP.md#provider-pipeline). The S3 logo, badge, and IntroHub card are already wired so the preset becomes fully functional once the upstream fix lands.
:::

## Connection Settings

| Field | Value |
| --- | --- |
| Endpoint | Blomp's S3 gateway URL (verify in your Blomp account dashboard) |
| Region | `us-east-1` (placeholder, S3 protocol requires a region) |
| Bucket | Your Blomp container / bucket name |
| Access Key ID | From Blomp dashboard > API Keys |
| Secret Access Key | From the same panel |
| Path-style addressing | Enabled (Blomp does not resolve bucket-as-subdomain) |

## Why Use AeroFTP with Blomp

- 40 GB free storage is one of the most generous quotas among S3-compatible providers
- one client for Blomp, AWS S3, Wasabi, Cloudflare R2, MinIO, and 13 other S3-compatible backends
- saved profile in the encrypted vault, no plaintext credentials on disk
- AeroSync, AeroVault overlay, and CLI all work transparently once the upstream proxy is fixed

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
| `403 Forbidden` on listing or upload | Upstream Blomp proxy bug (auth ok, storage 403) | Pending upstream fix. Track the [provider pipeline](https://github.com/axpdev-lab/aeroftp/blob/main/ROADMAP.md#provider-pipeline). |
| `404 Not Found` on bucket | Wrong bucket name or endpoint | Verify the exact bucket and endpoint in your Blomp dashboard. |
| `SignatureDoesNotMatch` | Time skew, wrong region, or wrong path-style setting | Ensure path-style is enabled and the system clock is in sync. |

## Related Documentation

- [S3-Compatible](/protocols/s3) - protocol-level technical reference
- [MinIO](/providers/minio) - reliable self-hosted S3 alternative
- [Wasabi](/providers/wasabi) - paid S3-compatible alternative with no egress fees
- [Blomp Website](https://blomp.com)
