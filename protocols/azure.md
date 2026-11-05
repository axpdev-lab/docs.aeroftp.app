# Azure Blob Storage

> Azure Blob Storage is an HTTP API for blobs inside containers on a storage account. Microsoft announced Windows Azure storage in October 2008, and the service became generally available in February 2010.
>
> The client signs each request with the account's shared key (HMAC), or presents a Shared Access Signature that already carries the permission and the expiry. AeroFTP connects with an account name plus an access key, or with a SAS token. Listings page with `NextMarker`.

Azure Blob is the enterprise object store on Microsoft Azure. AeroFTP connects with the account key.

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
