---
title: IBM Cloud Object Storage with AeroFTP
description: Connect IBM Cloud Object Storage to AeroFTP with the built-in S3 preset, HMAC credentials and the regional endpoint for your bucket.
---

# IBM Cloud Object Storage

<ProviderPlanCard id="ibm-cloud-object-storage" />

IBM Cloud Object Storage (COS) is IBM's S3-compatible object storage. AeroFTP includes a dedicated **IBM Cloud Object Storage** preset that builds the endpoint from the location you pick, so you only enter your keys, the bucket and its location.

::: info Availability
The IBM Cloud Object Storage preset ships in the release after AeroFTP v4.2.0. On v4.2.0, use the generic **S3 Compatible** form with the endpoint `https://s3.<location>.cloud-object-storage.appdomain.cloud`, the bucket location as region, and path-style access enabled.
:::

## What You Need

- an IBM Cloud account with a Cloud Object Storage instance
- **HMAC credentials** for that instance: in the IBM Cloud console open the instance, **Service credentials**, **New credential**, and enable **Include HMAC Credential**. The `cos_hmac_keys` block of the new credential holds the `access_key_id` and the `secret_access_key`
- your bucket name
- the bucket's **location** (shown in the bucket's configuration)

API keys and IAM tokens are not S3 credentials: the preset needs the HMAC pair.

## How to Connect

1. Open AeroFTP.
1. Select **IBM Cloud Object Storage** from the S3 providers.
1. Paste the HMAC **Access Key ID** and **Secret Access Key**.
1. Choose the **Region** that matches the bucket's location.
1. Enter the bucket name, or use **Fetch** to list the buckets the key can see.
1. Connect and save the profile.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | S3 | Built-in preset |
| Endpoint | `https://s3.<location>.cloud-object-storage.appdomain.cloud` | Built from the selected region |
| Default region | `eu-de` (Frankfurt) | Change it to your bucket's location |
| Addressing | Virtual-hosted | IBM also accepts path-style |
| Port | 443 | HTTPS |

## Locations

The region select lists every public endpoint IBM documents:

- **Regional**: `us-south` (Dallas), `us-east` (Washington DC), `eu-gb` (London), `eu-de` (Frankfurt), `eu-es` (Madrid), `ca-tor` (Toronto), `ca-mon` (Montreal), `br-sao` (São Paulo), `au-syd` (Sydney), `jp-tok` (Tokyo), `jp-osa` (Osaka), `in-che` (Chennai), `in-mum` (Mumbai)
- **Cross-Region**: `us`, `eu`, `ap`
- **Single Data Center**: `ams03` (Amsterdam), `par01` (Paris), `mon01` (Montreal), `sjc04` (San Jose), `che01` (Chennai), `sng01` (Singapore)

A bucket answers only on the endpoint of its own location. The region is also the one AeroFTP signs requests with, so it must match the bucket.

## Features

- **File operations**: upload, download, rename, move and delete, including multipart uploads for large files
- **Share links**: presigned URLs, valid for a limited time
- **AeroSync**: supported
- **Profiles from other tools**: a bucket imported from Cyberduck, rclone, restic or an AWS config keeps its endpoint, and the signing region is read back from it when the profile stores none

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Bucket not found | The bucket lives in another location | Pick the bucket's own location in **Region** |
| Signature does not match | Wrong secret key, or a region that differs from the bucket's location | Recheck the HMAC pair and the region |
| Access denied | The credential has no role on the bucket | Create the service credential with the **Writer** or **Manager** role |
| Invalid access key | An API key was used instead of HMAC keys | Create a credential with **Include HMAC Credential** enabled |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
- [Quick Start](/getting-started/quick-start)
