---
title: Uploadcare with AeroFTP
description: Connect Uploadcare to AeroFTP using public + secret API key authentication for EU-based, GDPR-friendly media storage.
---

# Uploadcare

[Uploadcare](https://uploadcare.com) is an EU-based, GDPR-friendly media storage and CDN platform. AeroFTP integrates Uploadcare via its native REST + Upload APIs as a first-class `StorageProvider`. Shipped in **v3.7.2** as the 24th protocol.

## Connection Settings

| Field | Value |
| --- | --- |
| REST endpoint | `https://api.uploadcare.com` (automatic) |
| Upload endpoint | `https://upload.uploadcare.com` (automatic) |
| Public Key | From Uploadcare dashboard > API Keys |
| Secret Key | From the same panel |
| Auth | Public + Secret pair (Authorization header) |

## How to Connect

1. Sign up at [uploadcare.com](https://uploadcare.com) and create a project.
2. In the dashboard, open **API Keys** and copy both the **Public Key** and the **Secret Key**.
3. In AeroFTP, open **Discover Services** and pick **Uploadcare** from the **Photo & Media** tier.
4. Enter the public + secret key pair.
5. Click **Connect**. AeroFTP lists the project's stored files using the cursor-based pagination flow.

## Features

- **Cursor-based listing**: Native pagination through Uploadcare's REST API. AeroFTP transparently follows the cursor across pages; long lists scroll smoothly.
- **Store-once mapping to directories**: Uploadcare uses a flat UUID model. AeroFTP layers a directory abstraction on top so you can browse and organize as folders. Files retain their original UUIDs in the Properties dialog.
- **Upload**: Two-stage commit through `/base/` (multipart) followed by `/files/{uuid}/storage/` to flag the file as stored. Streaming progress with `.aerotmp` atomic semantics.
- **Download**: Direct `https://ucarecdn.com/<uuid>/` URLs with optional transformation paths.
- **Delete**: Soft delete via REST. Files removed from listing but recoverable through the Uploadcare dashboard during the retention window.
- **EU data residency**: All data physically stored in EU regions (GDPR-compliant by default).

## CLI

```bash
aeroftp-cli ls --profile "MyUploadcare"
aeroftp-cli put --profile "MyUploadcare" ./assets/*.png /
aeroftp-cli get --profile "MyUploadcare" "/<uuid>" ./local/
aeroftp-cli sync --profile "MyUploadcare" ./media /
```

## Tips

- The public key is safe to embed in client-side code (signed upload widgets, etc.). The secret key must remain server-side. AeroFTP keeps both in the encrypted vault.
- Uploadcare's CDN supports image transformations via path segments (`/-/preview/300x300/`, etc.). Append them to share links as needed.
- Free tier includes 3 GB of stored media and unlimited bandwidth for the first 30 days; check the dashboard for the current pricing.
- Activity Log surfaces the project public-key hostname in the clear (e.g. `Authenticated as api.uploadcare.com/<project>`); the secret key remains masked.

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `401 Unauthorized` | Wrong public/secret key pair | Regenerate the keys in the dashboard and reconnect. |
| `409 Conflict` on delete | File still has active webhooks or pending operations | Wait for pending operations to settle, retry the delete. |
| Files visible in Uploadcare web but not in AeroFTP | Files are uploaded but not committed to storage | AeroFTP's `put` flow always commits. Check the dashboard's "Pending" filter for orphaned uploads. |

## Related Documentation

- [ImageKit](/providers/imagekit) - sibling image CDN provider
- [Cloudinary](/providers/cloudinary) - sibling image/video CDN provider
- [Uploadcare Official Docs](https://uploadcare.com/docs/)
