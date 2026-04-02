---
title: Storj with AeroFTP
description: Connect Storj to AeroFTP using the built-in S3-compatible preset, choose the right gateway endpoint, and use path-style defaults that match Storj's gateway model.
---

Storj is a decentralized cloud object storage platform exposed through S3-compatible gateway endpoints. AeroFTP includes a dedicated **Storj preset** so you can connect with the right gateway and default behavior without building the endpoint manually.

## Why Use AeroFTP with Storj

- desktop access to Storj buckets without scripting
- built-in gateway selection for North America, Europe, and Asia-Pacific
- saved profiles for recurring upload, download, and sync workflows
- one client for Storj, S3, R2, Wasabi, Backblaze B2, and other object storage providers

## What You Need

- your Storj S3 gateway access key
- your Storj S3 gateway secret key
- your bucket name
- the gateway region you want to use

## Gateway Endpoints

Use the Storj gateway that matches your preferred region:

- `https://gateway.storjshare.io` for US1
- `https://gateway.eu1.storjshare.io` for EU1
- `https://gateway.ap1.storjshare.io` for AP1

## How to Connect

1. Open AeroFTP.
2. Select **Storj** from the S3 provider presets.
3. Enter your gateway **Access Key**.
4. Enter your gateway **Secret Key**.
5. Enter the Storj bucket name you want to browse.
6. Choose the gateway endpoint closest to your workload.
7. Connect and save the profile.

## Recommended Defaults

- use the built-in **Storj** preset instead of generic S3
- keep **path-style access** enabled
- keep the region behavior aligned to Storj's gateway model
- use the gateway endpoint that matches the data locality you want

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| Signature error | Wrong gateway endpoint or wrong secret key | Re-check the selected gateway and your S3 gateway credentials |
| Bucket not found | Wrong bucket name | Verify the exact bucket name in the Storj console |
| Access denied | Access grant does not include the target bucket | Regenerate or expand the Storj access grant used for S3 gateway access |
| Slow transfers | Gateway region is far from your users or data path | Switch to the closest Storj gateway endpoint |

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [Provider Reference](/advanced/provider-reference)
