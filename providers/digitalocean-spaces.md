---
title: DigitalOcean Spaces with AeroFTP
description: Connect DigitalOcean Spaces to AeroFTP with region-based S3 endpoints, bucket setup, and access key guidance.
---

DigitalOcean Spaces is a managed object storage service with an S3-compatible API. AeroFTP supports it through a built-in **DigitalOcean Spaces preset**.

## Why Use AeroFTP with DigitalOcean Spaces

- Desktop setup for a common managed object storage provider
- Region-aware endpoints through the built-in preset
- Bucket browsing, upload, download, and sync-friendly behavior
- One UI for Spaces and other S3-compatible storage providers

## What You Need

- your access key
- your secret key
- your bucket name
- the region where the Space is hosted, such as `nyc3` or `ams3`

## How to Connect

1. Open AeroFTP.
1. Select **DigitalOcean Spaces** from the S3 provider presets.
1. Enter your access key and secret key.
1. Enter your bucket name.
1. Select the correct region.
1. Confirm the computed endpoint for that region.
1. Connect and save the profile.

## Recommended Defaults

- use the region picker instead of typing the endpoint manually
- keep the endpoint aligned to the real Space region
- verify bucket permissions on the active key

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Bucket not found | Wrong region selected | Switch to the correct Spaces region |
| Access denied | Key lacks access to the target Space | Check the key permissions in DigitalOcean |
| Invalid endpoint | Wrong region mapping | Use the built-in preset and region selector |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Quick Start](/getting-started/quick-start)
