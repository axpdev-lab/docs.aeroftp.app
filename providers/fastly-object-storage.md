---
title: Fastly Object Storage with AeroFTP
description: Connect Fastly Object Storage to AeroFTP with the built-in S3 preset, a regional endpoint, an access key pair and your bucket.
---

# Fastly Object Storage

<ProviderPlanCard id="fastly" />

Fastly Object Storage is an S3-compatible object store with regional endpoints. AeroFTP includes a dedicated **Fastly Object Storage** preset with path-style addressing and region-aware signing.

The free allowance is 5 GB. Fastly asks for a card when you sign up.

::: info Availability
The Fastly preset ships in AeroFTP 4.2.7. On earlier versions, use the generic **S3 Compatible** form with the regional endpoint, path-style addressing and your bucket.
:::

## What You Need

- a Fastly account with Object Storage enabled
- an Object Storage **access key ID** and **secret access key**
- your bucket name
- the region where the bucket lives

Create the bucket and key pair in the [Fastly control panel](https://www.fastly.com/documentation/guides/platform/object-storage/object-storage-quick-start/). The secret is shown by Fastly when the key is created.

## How to Connect

1. Open AeroFTP.
1. Select **Fastly Object Storage** from the S3 providers.
1. Select the bucket's region.
1. Paste the **Access key ID** and **Secret access key**.
1. Enter the bucket name, or use **Fetch** to list the buckets the key can see.
1. Connect and save the profile.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | S3 | Built-in Fastly preset |
| Endpoint | `https://{region}.object.fastlystorage.app` | Filled by the selected region |
| Region | The endpoint's region label | It must match for SigV4 signing |
| Addressing | Path-style | Fixed by the preset |
| Port | 443 | HTTPS |

The older region names `us-east`, `us-west` and `eu-central` are distinct from `us-east-1`, `us-west-1` and `eu-central-1`. Select the exact name shown by Fastly. If the region and endpoint disagree, AeroFTP names the region to select instead of returning Fastly's generic `InvalidRequest` error.

## Features

- **File operations**: upload, download, rename, move and delete, including multipart uploads for large files
- **Server-side copy**: a copy runs inside Fastly, so no object data passes through your computer
- **Share links**: presigned URLs, limited to 7 days at most
- **AeroSync and AeroCloud**: supported, with a 30-minute floor between full remote scans
- **rclone bridge**: import and export use the `Fastly` provider token, available in rclone 1.74.0 and newer

### Unsupported Fastly operations

Fastly Object Storage does not currently provide S3 object versions or object tagging through this integration. AeroFTP therefore hides Object Tags and the version-based Trash view for Fastly profiles, and refuses a direct unsupported call. A storage usage figure is not available from the S3 API.

### Request timeouts and retries

Fastly answers a request that exceeds its 120-second limit with HTTP 408. AeroFTP repeats a 408 on a single PUT or a multipart part inside the same bounded retry budget as connection refusals and HTTP 429. Other HTTP failures are not blindly replayed.

### Listing requests

Fastly bills bucket listings as requests. AeroCloud therefore runs a full scan of a Fastly pair at most every 30 minutes, including after a manual first sync. Incremental sync still reacts to local changes between those scans.

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| 400 `InvalidRequest` | Signing region differs from the endpoint label | Select the exact region named in the error |
| 403 Access denied | Wrong key pair, or no access to the bucket | Recheck the key ID, secret and bucket permissions |
| Bucket not found | Wrong bucket or region | Verify both values in the Fastly control panel |
| Object Tags or Trash is absent | Fastly does not support those operations here | Use the Fastly control panel for account-level operations |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [rclone Bridge](/features/rclone)
- [Provider Reference](/advanced/provider-reference)
- [Quick Start](/getting-started/quick-start)
