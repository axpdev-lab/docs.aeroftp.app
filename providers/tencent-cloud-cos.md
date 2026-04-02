---
title: Tencent Cloud COS with AeroFTP
description: Connect Tencent Cloud COS to AeroFTP using the built-in S3-compatible preset, COS regional endpoints, and APPID-style bucket naming.
---

# Tencent Cloud COS

Tencent Cloud COS is Tencent's S3-compatible object storage platform. AeroFTP includes a dedicated **Tencent Cloud COS preset** so the regional endpoint pattern is handled consistently.

## Why Use AeroFTP with Tencent Cloud COS

- desktop bucket access without manually composing S3 requests
- regional endpoint handling for China, Asia-Pacific, Europe, and US regions
- saved connection profiles for repeat upload, backup, and sync workflows
- one client for COS, Alibaba Cloud OSS, AWS S3, and other object storage providers

## What You Need

- your Tencent **SecretId**
- your Tencent **SecretKey**
- your bucket name including the **APPID suffix**
- the region where the bucket is hosted

## Bucket Naming and Endpoint Format

Tencent Cloud COS buckets usually include the APPID suffix, for example:

```text
mybucket-1250000000
```

The endpoint format is:

```text
https://cos.{region}.myqcloud.com
```

## How to Connect

1. Open AeroFTP.
2. Select **Tencent Cloud COS** from the S3 provider presets.
3. Enter your **SecretId** in the access key field.
4. Enter your **SecretKey** in the secret key field.
5. Enter the full bucket name, including the APPID suffix.
6. Select the COS region.
7. Connect and save the profile.

## Recommended Defaults

- use the dedicated **Tencent Cloud COS** preset
- keep the selected region aligned to the bucket region in Tencent Cloud
- do not remove the APPID suffix from the bucket name

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Bucket not found | Missing APPID suffix in bucket name | Re-enter the full bucket name exactly as shown in Tencent Cloud |
| Signature mismatch | Wrong region | Re-select the region and retry |
| Access denied | SecretId or SecretKey lacks COS permissions | Verify the CAM policy attached to the key |
| Empty listing | Connected to the wrong bucket or prefix | Double-check the bucket name and top-level path |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
