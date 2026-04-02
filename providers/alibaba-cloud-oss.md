---
title: Alibaba Cloud OSS with AeroFTP
description: Connect Alibaba Cloud OSS to AeroFTP using the built-in S3-compatible preset, regional OSS endpoints, and AccessKey credentials.
---

Alibaba Cloud OSS is Alibaba's object storage platform with S3-compatible access patterns. AeroFTP includes an **Alibaba Cloud OSS preset** that maps the regional endpoint format automatically.

## Why Use AeroFTP with Alibaba Cloud OSS

- direct desktop access to OSS buckets from AeroFTP
- region-aware endpoint generation for China, Asia-Pacific, Europe, and US regions
- reusable saved profiles for backup and transfer workflows
- one client for OSS, AWS S3, Tencent COS, Oracle Cloud, and other S3-compatible providers

## What You Need

- your **AccessKey ID**
- your **AccessKey Secret**
- your OSS bucket name
- the OSS region used by that bucket

## Endpoint Format

Alibaba Cloud OSS uses the following endpoint pattern:

```text
https://oss-{region}.aliyuncs.com
```

Examples include:

- `https://oss-cn-hangzhou.aliyuncs.com`
- `https://oss-ap-southeast-1.aliyuncs.com`
- `https://oss-eu-central-1.aliyuncs.com`

## How to Connect

1. Open AeroFTP.
2. Select **Alibaba Cloud OSS** from the S3 provider presets.
3. Enter your **AccessKey ID**.
4. Enter your **AccessKey Secret**.
5. Enter your bucket name.
6. Select the region where the bucket is hosted.
7. Confirm the auto-generated OSS endpoint.
8. Connect and save the profile.

## Recommended Defaults

- use the **Alibaba Cloud OSS** preset instead of generic S3
- keep virtual-hosted-style defaults unless your environment requires otherwise
- make sure the bucket region and selected endpoint match exactly

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Access denied | Wrong AccessKey permissions | Check RAM permissions for OSS bucket access |
| Signature mismatch | Wrong region selected | Re-select the exact region used by the bucket |
| Bucket not found | Bucket name or region mismatch | Verify both values in the OSS console |
| Connection works but listing fails | Credentials lack list permissions | Ensure the key can read bucket metadata and list objects |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
