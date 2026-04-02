---
title: Quotaless with AeroFTP
description: Connect to Quotaless in AeroFTP using S3 or WebDAV with exact endpoint values, recommended defaults, and troubleshooting tips.
---

# Quotaless

Connect to Quotaless in AeroFTP using either **S3** or **WebDAV**. Use the S3 profile if you want an object-storage workflow, or WebDAV if you prefer a more file-oriented connection style.

## Why Use AeroFTP with Quotaless

AeroFTP gives you a desktop GUI for Quotaless instead of a browser-only workflow.

- Browse files in a dual-pane desktop interface
- Save Quotaless profiles securely in the OS keyring
- Upload, download, rename, and organize files from one app
- Reuse the same client for Quotaless, SFTP servers, cloud drives, and other storage providers

Quotaless is supported in AeroFTP through two built-in presets:

- **Quotaless S3**
- **Quotaless WebDAV**

## Supported Connection Modes

| Mode | Supported in AeroFTP | Recommended | Notes |
| --- | --- | --- | --- |
| S3 | Yes | Yes | Best for bucket-based object storage workflows |
| WebDAV | Yes | Optional | Good if you prefer file-like browsing |

## Quotaless Connection Details

### S3

- Endpoint: `io.quotaless.cloud`
- Port: `8000`
- Protocol family: S3-compatible
- Username field in AeroFTP: Access Key ID
- Password field in AeroFTP: Secret Access Key

### WebDAV

- Server URL: `https://io.quotaless.cloud:8080/webdav`
- Port: `8080`
- Protocol family: WebDAV
- Username test account: `aeroftp`

## Before You Start

Prepare the connection details for the mode you want to use.

For S3:

- access key ID
- secret access key
- bucket name

For WebDAV:

- username
- password

## Connect to Quotaless S3

1. Open AeroFTP and go to the connection screen.
2. Select **Quotaless S3** from the provider list.
3. Enter your **Access Key ID**, **Secret Access Key**, and **Bucket Name**.
4. Keep the preset endpoint aligned to `https://io.quotaless.cloud:8000`.
5. Connect and verify that the bucket opens correctly.
6. Save the connection for future use.

Recommended defaults:

- HTTPS enabled
- endpoint `https://io.quotaless.cloud:8000`
- port `8000`
- use the built-in preset instead of generic S3 when possible

## Connect to Quotaless WebDAV

1. Open AeroFTP and select **Quotaless WebDAV**.
2. Confirm that the server URL is `https://io.quotaless.cloud:8080/webdav`.
3. Enter your Quotaless username and password.
4. Connect and verify directory browsing.
5. Save the profile if the connection succeeds.

Recommended defaults:

- HTTPS enabled
- server URL `https://io.quotaless.cloud:8080/webdav`
- port `8080`

## Which Mode Should You Choose?

Choose **S3** if you:

- mainly work with object storage
- want a bucket-based setup
- already have S3 credentials issued by Quotaless

Choose **WebDAV** if you:

- prefer a username/password setup
- want file-oriented browsing behavior
- already use Quotaless through a WebDAV workflow

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Authentication failed | Wrong credential type for the selected mode | Use S3 keys for S3, username/password for WebDAV |
| Connection timeout | Wrong host, port, or temporary network issue | Verify `io.quotaless.cloud`, port `8000` for S3 and `8080` for WebDAV |
| Bucket not found | Wrong S3 bucket name | Double-check the bucket name in your Quotaless account |
| WebDAV opens the wrong path | Incorrect URL entered manually | Prefer the Quotaless WebDAV preset |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [WebDAV](/protocols/webdav)
- [Quick Start](/getting-started/quick-start)
