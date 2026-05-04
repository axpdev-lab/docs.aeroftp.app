---
title: Backblaze B2 with AeroFTP
description: Connect to Backblaze B2 in AeroFTP using either the native v4 API preset (large-file workflow, server-side copy, version history) or the S3-compatible legacy preset.
---

# Backblaze B2

Backblaze B2 is a cost-effective object storage platform. AeroFTP ships **two** presets and lets you pick the one that matches your workload:

| Preset | Backend | Best for |
|--------|---------|----------|
| **Backblaze B2 (native)** | B2 v4 API directly | Large-file workflows, server-side copy, version history |
| **Backblaze B2 (S3-compat)** | S3 endpoint exposed by B2 | Mixed-S3 estates, scripted tooling that already speaks S3 |

> If you are starting fresh, pick the **native** preset. It speaks the same wire protocol as Backblaze's own tools, gets the full version history surface, and avoids the per-bucket S3 endpoint guessing that has tripped users up in the past.

## Backblaze B2 (native, v4 API)

The native preset bypasses the S3 compatibility layer entirely.

### What you get

- Native B2 large-file workflow (`b2_start_large_file` / `b2_upload_part` / `b2_finish_large_file`).
- Server-side copy via `b2_copy_file` - no download / re-upload round-trip.
- File version history surfaced through `list_versions` / `download_version` / `restore_version` so deleted or overwritten objects can be recovered from the AeroFTP UI.
- Endpoint discovery: `b2_authorize_account` returns the `apiUrl` and `downloadUrl` for your account, so you do not need to know the regional S3 hostname in advance.

### Setup

1. Open the [Backblaze App Keys page](https://secure.backblaze.com/app_keys.htm) and create a new application key.
2. In AeroFTP, pick **Backblaze B2 (native)** in Discover.
3. Enter:
   - **Application Key ID** (starts with `003...`)
   - **Application Key** (only shown at creation - copy it now)
   - **Bucket Name** (case-sensitive, exact match)
4. Connect. AeroFTP will run `b2_authorize_account` and discover the right `apiUrl` / `downloadUrl` for your account automatically.

### Connection settings

| Field | Value |
|-------|-------|
| Application Key ID | From Backblaze App Keys |
| Application Key | From Backblaze App Keys (one-time display) |
| Bucket | Exact bucket name |
| Endpoint | Discovered automatically by `b2_authorize_account` |

## Backblaze B2 (S3-compat, legacy)

The S3-compat preset routes B2 through the standard S3 API. It is the right choice when:

- You already have automation scripted against the S3 SDK.
- You operate a mixed estate of B2 and other S3 services and want one code path.
- You explicitly need an S3 multipart workflow rather than the native B2 large-file workflow.

### Setup

1. Open AeroFTP and pick **Backblaze B2 (S3-compat)** in Discover.
2. Enter:
   - **Key ID** (starts with `003...`)
   - **Application Key**
   - **Bucket Name**
   - **Endpoint** - copy it from the **Bucket Settings** page in the Backblaze console (e.g. `s3.eu-central-003.backblazeb2.com`). Do **not** prefix with `https://`.
3. Connect and save the profile.

### Recommended defaults

- Path-style addressing: enabled (B2 does not yet support virtual-hosted style for arbitrary buckets).
- Region: `auto` (placeholder; B2 ignores it).

## Common issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Signature error (S3-compat) | Wrong endpoint or secret key | Verify the exact S3 endpoint in **Bucket Settings** and the application key |
| Access denied | Application key permissions too narrow | Ensure the key can access the target bucket (read + write + listAllBucketNames as needed) |
| Bucket not found | Wrong bucket name | The bucket name is case-sensitive |
| `b2_authorize_account` 401 (native) | Application Key ID + Key mismatch | Generate a fresh application key; the old one may have been revoked |

## Why two presets?

Backblaze's S3-compat layer is excellent but it does not surface every B2 feature. The native preset wins on:

- **Server-side copy** (`b2_copy_file`) - the S3-compat endpoint emulates `CopyObject` but rewrites the file rather than reusing the source bytes for cross-bucket copies.
- **Version history** - `b2_list_file_versions` returns the full version chain; the S3-compat layer hides this behind versioning headers.
- **Large-file workflow** - native `b2_finish_large_file` is the original B2 behaviour and avoids the S3-compat multipart commit edge cases that have caused intermittent issues for some users.

The S3-compat preset wins on:

- **Tooling reuse** - any S3 SDK / CLI works as-is.
- **Cross-provider scripting** - the same code path that talks to AWS / R2 / Wasabi / MinIO also talks to B2.

You can have both presets installed at once and switch per-profile.

## Related

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
