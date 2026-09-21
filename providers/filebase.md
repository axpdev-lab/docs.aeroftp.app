---
title: Filebase with AeroFTP
description: Set up Filebase in AeroFTP with the built-in S3-compatible preset - three fields, a fixed endpoint and path-style addressing.
---

# Filebase

<ProviderPlanCard id="filebase" />

Filebase is an S3-compatible object storage service. AeroFTP includes a **Filebase preset** that fills in the endpoint (`https://s3.filebase.io`), the region (`auto`) and path-style addressing, so the form asks only for the three values the Filebase console shows.

## What You Need

- your Filebase access key, which the console calls **Access token** (Console > Access Keys)
- your Filebase secret key (Console > Access Keys > Secret Key)
- the name of an existing bucket (Console > Buckets)

## How to Connect

1. Open AeroFTP and select **Filebase** among the S3 providers in Add Service.
2. Paste the access token and the secret key.
3. Enter the bucket name.
4. Connect and save the profile.

## What Differs From Other S3 Presets

- Object versioning is not offered on Filebase connections.
- Copies and moves inside the bucket use a single `CopyObject` request. Filebase does not implement the multipart copy (`UploadPartCopy`) that AeroFTP uses on other S3 services, so AeroFTP never sends it there.
- For the same reason an S3 delta upload (`put --delta`) falls back to a normal upload on Filebase.

## Troubleshooting

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Access denied | Wrong access token or secret key | Copy both again from Console > Access Keys |
| Bucket not found | Wrong bucket name | Check the name in Console > Buckets |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
