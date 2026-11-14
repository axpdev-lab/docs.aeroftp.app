---
title: Neon Object Storage with AeroFTP
description: Connect Neon Object Storage to AeroFTP with the built-in S3 preset, S3 credentials and your branch endpoint.
---

# Neon Object Storage

<ProviderPlanCard id="neon" />

Neon Object Storage is an S3-compatible object storage service from Neon, the serverless Postgres platform. Each database branch can have its own storage endpoint, so a preview branch gets its own copy of the files.

AeroFTP includes a dedicated **Neon Object Storage** preset with path-style addressing, so you only enter the S3 credentials, the bucket and the endpoint shown in the Neon Console.

The free tier gives you 5 GB of storage per project.

<!-- Free tier (5 GB per project) confirmed in the provider task card. Prices and other figures are left out on purpose. -->

::: info Availability
The Neon Object Storage preset ships in AeroFTP 4.2.8. On earlier versions, use the generic **S3 Compatible** form with your branch endpoint (see below), the matching region, path-style addressing on, and your bucket.
:::

## What You Need

- a Neon account and a project, at [console.neon.tech](https://console.neon.tech)
- a bucket, created in the Neon Console **Storage** tab
- **S3 credentials**: the access key ID and secret shown under **Storage → Connect → S3 credentials** in the Neon Console. The secret is shown once when the credentials are created
- the **endpoint** for your branch, also under **Connect → Storage**; it looks like `https://<branch-id>.storage.<cell>.<region>.aws.neon.tech`

The Neon CLI can also create the credentials: `neon credentials create --scope storage:read --scope storage:write`.

::: tip Per-branch endpoints
Every branch has its own endpoint host. When you connect to a different branch, copy its endpoint from the Console again. Credentials are valid on the branch they were issued on and that branch's descendants: on a parent or sibling branch Neon returns `403 AccessDenied`, so select credentials issued on the target branch or one of its ancestors.
:::

## How to Connect

1. Open AeroFTP.
1. Select **Neon Object Storage** from the S3 providers.
1. Paste the **Access key ID** and the **Secret access key**.
1. Enter the bucket name.
1. Paste the **Endpoint** from the Neon Console Connect → Storage tab.
1. Pick the **Region** that matches your endpoint (EU Central 1 Frankfurt, US East 1 N. Virginia, US East 2 Ohio, or AP Southeast 1 Singapore).
1. Connect and save the profile.

## Connection Settings

| Field | Value | Notes |
| ----- | ----- | ----- |
| Protocol | S3 | Built-in preset |
| Endpoint | `https://<branch-id>.storage.<cell>.<region>.aws.neon.tech` | Per branch; copy it from the Neon Console |
| Region | `eu-central-1` by default | Four options: `eu-central-1`, `us-east-1`, `us-east-2`, `ap-southeast-1` |
| Addressing | Path-style | Enabled by default for this preset |
| Port | 443 | HTTPS |

## Features

- **File operations**: upload, download, rename, move and delete, including multipart uploads for large files
- **Server-side copy**: supported through the S3 API
- **Share links**: presigned URLs, valid for a limited time
- **AeroSync and AeroCloud**: supported
- **Profiles from other tools**: an S3 profile for `*.aws.neon.tech` is recognized as Neon Object Storage on import

## Troubleshooting

- **Signature or authorization errors**: check that the access key and secret come from the same Neon project and branch scope, and that the endpoint belongs to that branch.
- **Region mismatch**: the endpoint already contains the cell and region; pick the region option that matches the endpoint suffix, or leave the default when unsure.
- **Bucket not found**: create the bucket on the target branch first, through the Neon Console Storage tab, the Neon CLI, the Neon API or the S3 API (`CreateBucket` is supported).

## Related Documentation

- [Neon Object Storage overview](https://neon.com/docs/storage/overview)
- [S3-Compatible storage](/protocols/s3)
