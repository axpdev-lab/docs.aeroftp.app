---
title: Oracle Cloud Object Storage with AeroFTP
description: Connect Oracle Cloud Object Storage to AeroFTP using the S3-compatible preset, customer secret keys, and namespace-specific compatibility endpoints.
---

# Oracle Cloud Object Storage

Oracle Cloud Object Storage exposes an S3-compatible API through namespace-specific compatibility endpoints. AeroFTP includes an **Oracle Cloud preset** so you can save those endpoints cleanly and reuse them like any other S3-compatible provider.

## Why Use AeroFTP with Oracle Cloud

- desktop access to OCI object storage buckets through an S3-compatible workflow
- reusable saved profiles for repeated transfers and backup jobs
- compatibility with namespace-based Oracle endpoints that are awkward to retype manually
- one client for Oracle Cloud, AWS S3, Wasabi, R2, and other object storage services

## What You Need

- your Oracle **Customer Secret Key Access Key**
- your Oracle **Customer Secret Key Secret Key**
- your bucket name
- your Object Storage namespace
- your Oracle Cloud region

## Endpoint Format

Oracle Cloud uses this S3 compatibility endpoint format:

```text
https://{namespace}.compat.objectstorage.{region}.oraclecloud.com
```

Example:

```text
https://mycompany.compat.objectstorage.us-ashburn-1.oraclecloud.com
```

## How to Connect

1. Open AeroFTP.
2. Select **Oracle Cloud** from the S3 provider presets.
3. Enter the **Access Key** created from Oracle customer secret keys.
4. Enter the matching **Secret Key**.
5. Enter your bucket name.
6. Build or paste the full namespace-based S3 endpoint.
7. Connect and save the profile.

## Recommended Defaults

- use the **Oracle Cloud** preset instead of generic S3
- keep **path-style access** enabled
- paste the full compatibility endpoint, including your namespace and region
- make sure the endpoint region matches the bucket region exactly

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Authentication failed | Using the wrong secret type | Use Oracle customer secret keys, not unrelated console credentials |
| Bucket not found | Wrong namespace or region in the endpoint | Rebuild the compatibility endpoint carefully |
| Signature mismatch | Endpoint or key pair is wrong | Verify both the namespace endpoint and key pair |
| Access denied | IAM policy does not allow Object Storage access | Check the OCI policy attached to the user or group |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
