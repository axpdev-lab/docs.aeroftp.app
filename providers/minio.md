---
title: MinIO with AeroFTP
description: Connect self-hosted MinIO to AeroFTP using an S3-compatible endpoint, bucket name, and access keys.
---

# MinIO

MinIO is a self-hosted S3-compatible object storage server. AeroFTP supports MinIO through a built-in **MinIO preset** and through generic S3-compatible setup.

## Why Use AeroFTP with MinIO

- Desktop GUI for self-hosted object storage
- Good fit for homelabs, internal infrastructure, and on-prem deployments
- Saved profiles for multiple endpoints or environments
- Same app for MinIO, AWS S3, Wasabi, R2, and other object storage providers

## What You Need

- your MinIO endpoint
- your access key
- your secret key
- your bucket name

Typical endpoint examples:

- `http://minio.local:9000`
- `https://s3.internal.example.com`

## How to Connect

1. Open AeroFTP.
1. Select **MinIO** from the S3 provider presets.
1. Enter your access key and secret key.
1. Enter your bucket name.
1. Enter the MinIO endpoint.
1. Keep path-style access enabled if the preset uses it.
1. Connect and save the profile.

## Recommended Defaults

- use path-style addressing
- use `us-east-1` unless your deployment requires a different region value
- keep the endpoint exact, including scheme and port if needed

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Invalid endpoint | Missing scheme or wrong port | Include `http://` or `https://` and the correct port |
| Signature mismatch | Wrong secret key or incompatible endpoint value | Recheck credentials and endpoint format |
| Bucket not found | Wrong bucket name | Verify the bucket in the MinIO console |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
