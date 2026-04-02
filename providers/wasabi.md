---
title: Wasabi with AeroFTP
description: Connect Wasabi object storage to AeroFTP using the built-in S3-compatible preset, region selection, and bucket setup guidance.
---

Wasabi is a high-performance S3-compatible object storage provider known for straightforward pricing and strong backup use cases. AeroFTP includes a dedicated **Wasabi preset** to simplify setup.

## Why Use AeroFTP with Wasabi

- Desktop setup for S3-compatible storage without repeated manual configuration
- Saved profiles for recurring backup and transfer tasks
- Bucket browsing, upload, download, and sync-friendly workflows
- One client for Wasabi, AWS S3, B2, R2, and other object storage providers

## What You Need

- your Wasabi access key
- your Wasabi secret key
- your target bucket name
- the Wasabi region you want to use

## How to Connect

1. Open AeroFTP.
1. Select **Wasabi** from the S3 provider presets.
1. Enter your access key and secret key.
1. Enter your bucket name.
1. Choose the correct Wasabi region.
1. Verify that the endpoint matches the selected region.
1. Connect and save the profile.

## Recommended Defaults

- use the built-in Wasabi preset
- keep the region aligned with the bucket's real location
- verify the final endpoint before saving the profile

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Signature error | Wrong region or endpoint | Recheck the selected Wasabi region |
| Bucket not found | Bucket exists in another region | Switch the connection to the bucket's real region |
| Access denied | Wrong credentials or missing bucket permissions | Verify the active Wasabi key permissions |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Quick Start](/getting-started/quick-start)
