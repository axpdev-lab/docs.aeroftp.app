---
title: Backblaze B2 with AeroFTP
description: Connect to Backblaze B2 in AeroFTP using the built-in S3-compatible preset, with bucket, endpoint, and credential guidance.
---

Backblaze B2 is a cost-effective object storage platform with an S3-compatible API. AeroFTP includes a built-in **Backblaze B2 preset** that simplifies endpoint setup.

## Why Use AeroFTP with Backblaze B2

- Easy S3-compatible setup from a desktop GUI
- Saved profiles for recurring backup or transfer workflows
- Bucket browsing, uploads, downloads, and sync-friendly behavior
- One client for B2, S3, R2, Wasabi, and other providers

## What You Need

- your B2 `keyID`
- your `applicationKey`
- your bucket name
- the S3 endpoint shown in the Backblaze dashboard

## How to Connect

1. Open AeroFTP.
2. Select **Backblaze B2** from the S3 provider presets.
3. Enter your **keyID** in the access key field.
4. Enter your **applicationKey** in the secret key field.
5. Enter your bucket name.
6. Confirm the endpoint shown by the preset or replace it with the endpoint from the Backblaze dashboard if needed.
7. Connect and save the profile.

## Recommended Defaults

- protocol: S3-compatible
- use the Backblaze B2 preset instead of generic S3
- keep the endpoint aligned to the dashboard-provided S3 region endpoint

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Signature error | Wrong endpoint or secret key | Verify the exact S3 endpoint and application key |
| Access denied | Wrong key permissions | Ensure the B2 application key can access the target bucket |
| Bucket not found | Wrong bucket name | Check the exact bucket name in Backblaze B2 |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
