---
title: Cloudflare R2 with AeroFTP
description: Connect Cloudflare R2 to AeroFTP using the dedicated preset, Account ID field, bucket setup, and S3-compatible credentials.
---

# Cloudflare R2

Cloudflare R2 is an S3-compatible object storage platform known for zero egress fees. AeroFTP includes a dedicated **Cloudflare R2 preset** with an Account ID field.

## Why Use AeroFTP with Cloudflare R2

- Fast setup with a dedicated R2 profile
- Desktop bucket browsing and object transfer workflows
- Good fit for backup, asset storage, and media delivery pipelines
- One interface for R2, AWS S3, B2, Wasabi, and other S3-compatible services

## What You Need

- your Cloudflare **Account ID**
- an R2 **Access Key ID**
- an R2 **Secret Access Key**
- your target bucket name

## How to Connect

1. Open AeroFTP.
2. Select **Cloudflare R2** from the S3 provider presets.
3. Enter your Account ID.
4. Enter your Access Key ID and Secret Access Key.
5. Enter your bucket name.
6. Confirm that the computed endpoint matches:

```text
{your-account-id}.r2.cloudflarestorage.com
```

1. Connect and save the profile.

## Recommended Defaults

- region: `auto`
- use the built-in R2 preset
- copy the Account ID directly from the Cloudflare dashboard

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Invalid endpoint | Wrong Account ID | Recopy the Account ID from the Cloudflare R2 dashboard |
| Access denied | Token scope too small | Create an R2 token with bucket read/write permissions |
| Bucket not found | Wrong bucket name | Verify the exact bucket name in R2 |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Quick Start](/getting-started/quick-start)
