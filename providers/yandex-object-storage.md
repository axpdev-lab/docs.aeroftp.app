# Yandex Object Storage

Yandex Object Storage is an S3-compatible cloud storage service by Yandex Cloud, based in Russia. AeroFTP includes a built-in Yandex Object Storage preset with pre-configured endpoint settings.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | S3 | Built-in preset |
| Access Key ID | Your static access key ID | Yandex Cloud Console > Service Accounts > Static Access Keys |
| Secret Access Key | Your secret key | Yandex Cloud Console > Service Accounts > Static Access Keys |
| Bucket | Target bucket name | Yandex Cloud Console > Object Storage |

## How to Connect

1. Open AeroFTP.
2. Select **Yandex Object Storage** from the S3 provider presets.
3. Enter your Access Key ID and Secret Access Key from a Yandex Cloud service account.
4. Enter the bucket name.
5. Connect and verify the directory listing.

## Features

- **S3-compatible**: Full S3 API support for standard object operations.
- **Multipart upload**: Large files are uploaded in chunks.
- **Server-side copy**: Move and copy files without downloading.

## Tips

- This is **Yandex Object Storage** (S3-compatible), which is different from **Yandex Disk** (personal cloud storage with OAuth). AeroFTP supports both as separate providers.
- The default region is `ru-central1` and the endpoint is `storage.yandexcloud.net`.
- Create static access keys from a **service account**, not your personal Yandex account.

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Yandex Disk](/providers/yandex)
