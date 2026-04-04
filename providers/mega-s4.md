# MEGA S4 Object Storage

MEGA S4 is MEGA's S3-compatible object storage service. It provides S3-compatible API access with servers in Europe and Canada. A MEGA Pro plan is required.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | S3 | Built-in preset |
| Access Key ID | Your S4 access key | S4 Dashboard > Access Keys |
| Secret Access Key | Your S4 secret key | S4 Dashboard > Access Keys |
| Bucket | Target bucket name | S4 Dashboard > Buckets |
| Region | S4 region | `eu-central-1`, `eu-west-1`, `ca-central-1`, `ca-west-1` |

## How to Connect

1. Open AeroFTP.
2. Select **MEGA S4** from the S3 provider presets.
3. Enter your Access Key ID and Secret Access Key from the S4 Dashboard.
4. Select your region (EU or Canada).
5. Enter the bucket name.
6. Connect and verify the directory listing.

## Features

- **S3-compatible**: Full S3 API support for standard object operations.
- **4 regions**: 2 EU regions and 2 Canada regions.
- **Multipart upload**: Large files are uploaded in chunks.
- **Server-side copy**: Move and copy files without downloading.

## Tips

- MEGA S4 requires a **Pro plan**. There is no free tier for S4 object storage.
- The endpoint is auto-computed as `s3.{region}.s4.mega.io` based on your region selection.
- This is separate from the standard MEGA cloud storage (which uses E2E encryption). S4 is a different product with S3-compatible access.

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [MEGA](/providers/mega)
