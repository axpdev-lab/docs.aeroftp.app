# AWS S3

Amazon S3 (Simple Storage Service) is the original S3 implementation and the de facto standard for cloud object storage. AeroFTP includes a built-in AWS S3 preset with automatic endpoint configuration for 30+ regions.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Protocol | S3 | Built-in preset |
| Access Key ID | Your IAM access key | IAM Console > Users > Security Credentials > Access Keys |
| Secret Access Key | Your IAM secret key | Shown only once at key creation |
| Bucket | Target bucket name | Must already exist |
| Region | AWS region | e.g. `us-east-1`, `eu-west-1` |

## How to Connect

1. Open AeroFTP.
2. Select **Amazon S3** from the S3 provider presets.
3. Enter your Access Key ID and Secret Access Key.
4. Select the region where your bucket is located.
5. Enter the bucket name.
6. Connect and verify the directory listing.

## Features

- **Full S3 operations**: Upload, download, rename, move, delete, and create folders.
- **30+ regions**: Automatic endpoint configuration for all AWS regions.
- **Multipart upload**: Large files are uploaded in chunks for reliability.
- **Server-side copy**: Move and copy files without downloading.
- **Bucket versioning**: Access previous object versions if enabled on the bucket.

## Tips

- Use **fine-grained IAM policies** to restrict access to specific buckets and operations. Avoid using root account credentials.
- AWS S3 is pay-as-you-go with no permanent free tier (the free tier is 5 GB for the first 12 months only).
- For the best performance, choose a bucket region close to your location.
- The endpoint is auto-computed as `s3.{region}.amazonaws.com` based on your region selection.

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
