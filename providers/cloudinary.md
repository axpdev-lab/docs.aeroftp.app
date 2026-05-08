---
title: Cloudinary with AeroFTP
description: Connect Cloudinary to AeroFTP using cloudname + API key + secret authentication for image and video CDN with AI media services.
---

# Cloudinary

[Cloudinary](https://cloudinary.com) is an image and video CDN with AI-powered media services (auto-tagging, content-aware cropping, format optimization, transformations). AeroFTP connects via the native REST API as a first-class `StorageProvider`. Shipped in **v3.7.4** as the 25th protocol.

## Connection Settings

| Field | Value |
| --- | --- |
| Endpoint | `https://api.cloudinary.com/v1_1/{cloud_name}/` (auto-derived) |
| Cloud Name | From Cloudinary dashboard > Account Details |
| API Key | From the same panel |
| API Secret | From the same panel |
| Auth | Cloudname + key + secret triple (URL-encoded auth) |

## How to Connect

1. Sign up at [cloudinary.com](https://cloudinary.com) and create a media library.
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. In AeroFTP, open **Discover Services** and pick **Cloudinary** from the **Photo & Media** tier.
4. Enter the three credentials.
5. Click **Connect**. AeroFTP authenticates and lists the asset folders or tag-based pseudo-folders depending on your account plan.

## Features

- **Asset folders (paid plans)**: Cloudinary's native "Asset Folders" appear as standard directories. Create / rename / move with the standard tools.
- **Tag-based pseudo-folders (free plan)**: Free Cloudinary accounts do not expose Asset Folders. AeroFTP uses Cloudinary's `tags` field as a pseudo-folder model so you can still organize uploads by category.
- **Listing**: Uses `/resources/by_asset_folder` and `/folders` endpoints when Asset Folders are available, falling back to tag-based listing on free plans.
- **Upload**: Direct upload via `/resources/{type}/upload` with multipart streaming and SHA-256 deduplication.
- **Download**: Direct CDN URLs (`https://res.cloudinary.com/<cloud_name>/...`) with transformation passthrough.
- **CDN transformations**: Append `f_auto` (format auto), `q_auto` (quality auto), `w_300,h_300,c_fill` (resize-and-crop) to share links to leverage Cloudinary's transformation pipeline.
- **AI media services**: Auto-tagging, content-aware cropping, and format optimization remain accessible from Cloudinary's web dashboard. AeroFTP focuses on the storage layer.

## Free Tier

- 25 GB of managed storage.
- 25 GB of bandwidth per month.
- 25,000 transformations per month.

Heavy CDN traffic counts against the bandwidth quota, not the storage quota. The free tier is generous enough for personal photo libraries or small marketing sites.

## CLI

```bash
aeroftp-cli ls --profile "MyCloudinary"
aeroftp-cli put --profile "MyCloudinary" ./photos/*.jpg /campaigns/
aeroftp-cli get --profile "MyCloudinary" "/campaigns/*" ./local-cache/
aeroftp-cli sync --profile "MyCloudinary" ./marketing /uploads/marketing
```

## Tips

- The **API Secret** is signing material for protected URLs. Keep it in the vault; never embed it in front-end code.
- Cloudinary distinguishes `image`, `video`, and `raw` resource types. AeroFTP routes uploads automatically based on file extension; raw files (PDFs, archives) go to the `raw` type to avoid unwanted transformations.
- Free-plan accounts do not have Asset Folders. The pseudo-folder model is transparent in the UI but assets remain flat in Cloudinary's native dashboard.
- Use AeroSync's "skip identical" mode when bulk-uploading marketing assets to avoid burning the upload quota on retries.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `401 Unauthorized` | Wrong cloud name / key / secret | Double-check all three values in the dashboard and reconnect. |
| Folders missing from listing | Free plan, no Asset Folders | Switch to tag-based pseudo-folders or upgrade your plan. |
| `420 Rate limited` | Burst upload exceeded plan throughput | Reduce parallel uploads (`--parallel 2`) and retry. |
| Transformations not applied | Share link uses raw URL | Append `tr:` parameters to the share link or configure auto-transformations in the dashboard. |

## Related Documentation

- [ImageKit](/providers/imagekit) - sibling image/video CDN provider
- [Uploadcare](/providers/uploadcare) - sibling EU/GDPR media provider
- [Cloudinary Official Docs](https://cloudinary.com/documentation)
