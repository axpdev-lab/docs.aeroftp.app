# Azure Blob Storage

AeroFTP connects to Microsoft Azure Blob Storage using access key authentication. Azure Blob is an enterprise-grade object storage service suitable for large-scale data storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Account Name | Your storage account name | e.g. `mystorageaccount` |
| Access Key | Primary or secondary access key | From Azure Portal > Storage Account > Access Keys |
| Container | Target container name | Must already exist |

## Features

- **Container Operations**: Browse, upload, download, rename, and delete blobs within a container.
- **XML Parsing**: Directory listings are parsed using `quick-xml` (event-based parser) for reliable handling of Azure's XML responses.
- **Pagination**: `NextMarker`-based pagination handles containers with large numbers of blobs.
- **Blob Versioning**: If enabled on the storage account, previous blob versions are accessible.
- **SAS Tokens**: Generate Shared Access Signature URLs for temporary access to specific blobs.
- **Server-Side Encryption**: Azure encrypts all blobs at rest by default (SSE with Microsoft-managed keys).

## Tips

- Azure Blob Storage is pay-as-you-go with no free tier beyond the initial Azure credits ($200 for 30 days).
- For the best performance, choose a storage account in a region close to your location.
- If you get `AuthenticationFailed` errors, verify that the access key has not been rotated. Azure allows two keys for zero-downtime rotation.
- Azure Blob does not have a native trash/recycle bin. Deleted blobs are gone unless soft delete is enabled on the storage account.
- For AeroSync, use **size + modification time** compare mode. Azure provides `Content-MD5` headers when set during upload.
