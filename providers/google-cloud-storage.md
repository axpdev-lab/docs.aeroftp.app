---
title: Google Cloud Storage with AeroFTP
description: Connect Google Cloud Storage to AeroFTP using S3-compatible HMAC keys, bucket setup, and interoperability credentials.
---

# Google Cloud Storage

Google Cloud Storage (GCS) provides S3-compatible access through its [XML API interoperability](https://cloud.google.com/storage/docs/interoperability) layer. AeroFTP includes a dedicated **Google Cloud Storage preset** with pre-configured endpoint and path-style addressing.

## Why Use AeroFTP with Google Cloud Storage

- Dedicated GCS preset with auto-configured endpoint
- Desktop bucket browsing and object transfer workflows
- Works alongside Google Drive (separate protocol) in the same interface
- One interface for GCS, AWS S3, Azure, R2, and other S3-compatible services

## What You Need

- a Google Cloud project with Cloud Storage enabled
- an **HMAC Access Key** and **Secret**
- your target bucket name

## Creating HMAC Keys

1. Open the [Google Cloud Console](https://console.cloud.google.com/storage).
2. Go to **Cloud Storage > Settings > Interoperability**.
3. If prompted, click **Set project as default**.
4. Under **User account HMAC** or **Service account HMAC**, click **Create a key**.
5. Copy the **Access Key** and **Secret** immediately (the Secret is shown only once).

## How to Connect

1. Open AeroFTP.
2. Select **Google Cloud Storage** from the S3 provider presets.
3. Enter your HMAC Access Key and Secret.
4. Enter your bucket name.
5. Select a location (or leave as **Auto**).
6. Connect and save the profile.

The endpoint is pre-configured as:

```text
storage.googleapis.com
```

## Recommended Defaults

| Setting | Value |
| ------- | ----- |
| Endpoint | `storage.googleapis.com` (auto-filled) |
| Path style | Enabled (required for GCS) |
| Region | `auto` (recommended) |

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Access denied | Wrong HMAC keys | Regenerate keys in Cloud Storage > Settings > Interoperability |
| Bucket not found | Wrong bucket name | Verify exact name in Cloud Storage > Buckets |
| Connection timeout | HTTP/2 negotiation | AeroFTP forces HTTP/1.1 automatically for GCS compatibility |
| Project not set | Missing default project | Set your project as default in the Interoperability tab |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Google Drive](/providers/google-drive) (separate OAuth-based protocol)
- [Quick Start](/getting-started/quick-start)
