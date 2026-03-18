# 4shared

AeroFTP connects to 4shared using their native REST API with OAuth 1.0 (HMAC-SHA1) authentication. 4shared provides 15 GB of free storage.

## Connection Settings

Authentication uses OAuth 1.0 with a three-step token flow:

1. Click **Connect** on the 4shared protocol.
2. A browser window opens to 4shared's authorization page.
3. Approve the access request.
4. The OAuth tokens are exchanged and stored automatically.

Alternatively, you can authenticate with username and password directly using the **Full Auth** flow.

## Features

- **OAuth 1.0 Signing**: All API requests are signed with HMAC-SHA1 per RFC 5849. The signing module (`oauth1.rs`) is reusable across providers.
- **ID-Based File System**: 4shared uses numeric IDs for files and folders rather than paths. AeroFTP maintains a folder/file cache for path resolution.
- **Shared Links**: Files uploaded to 4shared are shareable by default with public download links.
- **Per-Entry Parsing**: Directory listings use fault-tolerant JSON parsing -- a malformed entry is skipped rather than failing the entire listing.

## Tips

- 4shared's free tier provides 15 GB but has bandwidth limits on downloads.
- The API returns file and folder IDs as either strings or integers depending on the endpoint. AeroFTP handles this with a custom `string_or_i64` deserializer.
- 4shared does not provide a trash/recycle bin through the API. Deletions are permanent.
- Relative paths in file operations are resolved against the current directory automatically.
