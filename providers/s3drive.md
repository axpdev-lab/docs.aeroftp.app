---
title: S3Drive with AeroFTP
description: Connect AeroFTP to S3Drive (Storj-backed S3-compatible cloud, 12 GB free tier) using credentials from the S3Drive desktop app's "Setup with Rclone" page.
---

# S3Drive

[S3Drive](https://s3drive.app) is an S3-compatible cloud built on top of Storj's decentralised storage network. Its free plan includes 12 GB of storage. AeroFTP ships an **S3Drive** Discover preset that pre-fills the endpoint, region, and addressing style; the only thing you need to copy from the S3Drive desktop app is the access key, secret, and bucket name.

| Field | Default | Notes |
|-------|---------|-------|
| Endpoint | `https://storage.kapsa.io` | S3Drive's public S3 gateway. Override in Advanced if your account points elsewhere. |
| Region | `us-east-1` | Standard placeholder for non-AWS S3 endpoints. |
| Path-style addressing | Disabled | Virtual-hosted style; S3Drive provisions per-account buckets at the gateway. |
| Access key ID | From S3Drive | Setup with Rclone -> `access_key_id`. |
| Secret access key | From S3Drive | Setup with Rclone -> `secret_access_key`. |
| Bucket | From S3Drive | The bucket created for your account. |

> Storage quota is **not** exposed by the standard S3 API, so the bottom status bar will not show used / total bytes for S3Drive even though AeroSync still tracks transferred volume locally. This is a protocol limitation, not an S3Drive limitation.

## Setup

1. Sign in to S3Drive (the [free plan](https://s3drive.app) includes 12 GB on Storj).
2. In the S3Drive desktop app open **Settings**, then **Setup with Rclone** (or visit [docs.s3drive.app/Advanced/Setup-rclone](https://docs.s3drive.app/Advanced/Setup-rclone/)).
3. Generate the rclone configuration to reveal the S3 credentials issued for your account.
4. Copy `access_key_id`, `secret_access_key`, and the **bucket name** from the rclone snippet into the corresponding fields in AeroFTP.
5. **Endpoint** and **Region** come from the same rclone snippet. Open the **Advanced** section in AeroFTP only if your values differ from the defaults (`storage.kapsa.io` / `us-east-1`).
6. Connect and save the profile.

The Discover preset surfaces a numbered checklist above the credential fields with a link straight to the S3Drive Setup with Rclone documentation, so you do not need to keep this page open during the first connect.

## Why S3Drive shows up as Beta

AeroFTP currently classes S3Drive as a Beta provider for sync purposes:

- The S3 gateway exposes everything AeroFTP needs for transfer and AeroSync (range reads, multipart upload, prefix listing).
- Storage quota is not exposed via the gateway, so anything that depends on it (the storage bar, dedup-aware footer) defers to "Unknown" for S3Drive profiles.
- Public share links are not provisioned by the gateway; they live inside the S3Drive desktop app's UI.

If quota / share links matter for your workflow, run S3Drive alongside [Storj](/providers/storj) directly: the underlying storage is the same, but Storj's native gateway URLs let you mint signed links from AeroFTP.

## Tips

- S3Drive's gateway speaks the S3 multi-thread chunk parallel download path, so files larger than the cutoff (default 250 MiB) automatically use ranged parallel streams when `--multi-thread-streams N` is set.
- For backup workflows, pair S3Drive with the **Backup** AeroSync preset (full SHA-256 checksum) - the gateway returns ETag headers AeroSync can compare against locally.
- If you regenerate credentials in the S3Drive app, edit the saved profile in AeroFTP and paste the new key / secret; the bucket and endpoint stay the same.

## Related

- [Storj](/providers/storj) - the underlying storage network.
- [S3-Compatible protocol](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
