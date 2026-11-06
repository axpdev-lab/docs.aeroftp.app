---
title: Tigris with AeroFTP
description: Connect Tigris object storage to AeroFTP with the built-in S3 preset, an access key pair and your bucket.
---

# Tigris

<ProviderPlanCard id="tigris" />

Tigris is a globally distributed, S3-compatible object storage service. AeroFTP includes a dedicated **Tigris** preset with a fixed endpoint and region, so you only enter your access key, the secret and the bucket.

The free tier gives you 5 GB of storage and needs no card. A card is needed beyond the free tier, or to make a bucket public.

<!-- Free tier (5 GB, no card required) confirmed by the owner on 2026-11-06. Prices and other figures are left out on purpose. -->

::: info Availability
The Tigris preset ships in AeroFTP 4.2.7. On earlier versions, use the generic **S3 Compatible** form with the endpoint `https://t3.storage.dev`, the region `auto` and your bucket. Leave path-style access off, unless the bucket name contains dots (see [Addressing](#addressing)).
:::

## What You Need

- a Tigris account and a bucket, created at [console.storage.dev](https://console.storage.dev)
- an **access key**: the key ID starts with `tid_` and the secret starts with `tsec_`. Tigris shows the secret once, when you create the key
- your bucket name

::: warning Cloud Disk buckets
Do not open a Tigris **Cloud Disk** (beta) bucket in AeroFTP. Changing its objects from outside the disk corrupts the disk.
:::

## How to Connect

1. Open AeroFTP.
1. Select **Tigris** from the S3 providers.
1. Paste the **Access key ID** and the **Secret access key**.
1. Enter the bucket name, or use **Fetch** to list the buckets the key can see.
1. Connect and save the profile.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | S3 | Built-in preset |
| Endpoint | `https://t3.storage.dev` | Fixed by the preset |
| Region | `auto` | Fixed by the preset, so there is no region picker |
| Addressing | Virtual-hosted | Path-style is available in the profile |
| Port | 443 | HTTPS |

Saved or imported profiles on the older host `fly.storage.tigris.dev` are recognized as Tigris and keep their endpoint. Nothing is migrated automatically, and switching to `t3.storage.dev` is optional.

## Addressing

Virtual-hosted addressing is the default. Path-style also works, so you can turn it on in the profile when you need it.

A bucket name that contains dots cannot be served over virtual-hosted addressing: the TLS certificate for `*.t3.storage.dev` covers one name label and does not match a dotted name. AeroFTP then shows an error that says so and suggests either a bucket name without dots or the path-style option for the profile. An rclone export of a profile with a dotted bucket writes path-style addressing, unless the profile already stores your own choice.

## Features

- **File operations**: upload, download, rename, move and delete, including multipart uploads for large files
- **Server-side copy**: a copy runs inside Tigris, so no data passes through your computer
- **Share links**: presigned URLs, valid for a limited time (see [Share links](#share-links))
- **AeroSync and AeroCloud**: supported (see [Listing requests](#listing-requests))
- **Trash and versions**: see [Versions and deleted files](#versions-and-deleted-files)
- **Profiles from other tools**: a Tigris bucket imported from Cyberduck, rclone or an AWS config is recognized as Tigris. An rclone remote with no region imports with `auto`

### Integrity

For a single-part upload, the ETag Tigris returns is the MD5 of the content. AeroFTP makes no claim about the ETag of a multipart upload.

### Rename and move

Inside a bucket, a rename or move uses the Tigris metadata rename, which copies no data. If Tigris refuses the request, AeroFTP falls back to a copy followed by a delete for the rest of the session. The metadata rename is a convenience of the service, not something AeroFTP can guarantee on every account.

### Versions and deleted files

On a bucket with snapshots or versioning enabled, a deleted object appears in the **Trash** view as two entries: a noncurrent version and a delete marker. **Empty trash** removes both. Entries that Tigris flags as soft-deleted stay visible in the Trash so that you can purge them, and they are left out of the version list of a single file.

Snapshot and versioning settings belong to Tigris: configure them in the Tigris console. AeroFTP does not change them.

### Storage usage

A plain S3 endpoint has no usage call, so the storage figure of an S3 profile is normally not available. Tigris is the exception: AeroFTP asks the account for the total number of stored bytes when a session opens.

- In the app, the storage bar shows the used bytes with no cap, because Tigris reports no total for the account. The figure is read once at connect and is not updated by each upload, so reconnect to refresh it.
- On the command line, `aeroftp-cli df --profile NAME` prints `Used:` and the line `Total: unmetered (set a manual cap in the profile to show %)`. Set a manual cap in the profile if you want a percentage.
- The call is detected at run time. If Tigris does not answer it for your key, the storage figure is not available and AeroFTP falls back to what it already knows from an earlier scan.

A profile created with the generic S3 form shows no storage bar in the app. `aeroftp-cli df` still reports its usage.

### Share links

A share link is a presigned URL. AeroFTP limits its lifetime to 7 days at most, even if you ask for longer.

### Encryption

Tigris encrypts every object at rest. AeroFTP sends no SSE headers to Tigris, and an SSE or KMS setting carried by an imported profile is ignored.

### Listing requests

At Tigris, listing a bucket is a Class A request, the class that Tigris applies to write operations. AeroCloud therefore does a full scan of a Tigris profile at most every 30 minutes; incremental sync still reacts to local changes right away.

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| TLS error that mentions the bucket name | The bucket name contains dots and the profile uses virtual-hosted addressing | Use a bucket name without dots, or turn on path-style for the profile |
| 403 Access denied | Wrong key pair, or the key has no access to the bucket | Recheck the `tid_` key ID, the `tsec_` secret and the bucket name |
| Storage usage is not available | Tigris did not answer the usage call for this key | Nothing to fix: the cached figure from an earlier scan is shown instead |
| Storage usage is not updating | The figure is read when the session opens | Disconnect and connect again |
| Profile on `fly.storage.tigris.dev` | The older host | It works as is; moving to `t3.storage.dev` is optional |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
- [Quick Start](/getting-started/quick-start)
