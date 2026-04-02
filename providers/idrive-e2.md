---
title: IDrive e2 with AeroFTP
description: Set up IDrive e2 in AeroFTP with the built-in S3-compatible preset, endpoint guidance, and bucket access tips.
---

IDrive e2 is an S3-compatible hot storage service that works well for backup, media storage, and application assets. AeroFTP includes an **IDrive e2 preset** for faster setup.

## Why Use AeroFTP with IDrive e2

- Desktop setup for an S3-compatible provider without manual repetition
- Saved profiles for recurring backup and transfer tasks
- Bucket browsing and standard object transfer workflows
- Same client for IDrive e2 and other S3-compatible services

## What You Need

- your IDrive e2 access key
- your IDrive e2 secret key
- your bucket name
- the region endpoint from the e2 dashboard

## How to Connect

1. Open AeroFTP.
2. Select **IDrive e2** from the S3 provider list.
3. Enter your access key and secret key.
4. Enter your bucket name.
5. Set or confirm the region endpoint shown in the IDrive e2 dashboard.
6. Connect and save the profile.

## Recommended Defaults

- use the built-in IDrive e2 preset
- use the endpoint copied from your active e2 region
- verify bucket-level permissions on the generated key

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Access denied | Wrong key or insufficient key scope | Recreate the access key with the required permissions |
| Invalid endpoint | Wrong region endpoint | Copy the exact endpoint from the e2 dashboard |
| Bucket not found | Wrong bucket name | Verify the bucket name in your e2 console |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
