---
title: FileLu with AeroFTP
description: Connect to FileLu in AeroFTP using S3, WebDAV, API, FTP, or FTPS depending on your workflow and account setup.
---

# FileLu

FileLu is unusual because AeroFTP supports it through multiple connection modes. Depending on your workflow, you can use FileLu through its API integration, S3-compatible storage, WebDAV, FTP, or FTPS.

## Supported Connection Modes

| Mode | Supported in AeroFTP | Best For |
| --- | --- | --- |
| FileLu API | Yes | Native FileLu-specific features |
| S3 | Yes | Bucket-style object workflows |
| WebDAV | Yes | File-style browsing |
| FTP | Yes | Basic compatibility workflows |
| FTPS | Yes | Encrypted FTP workflows |

## Which Mode Should You Use?

Choose **FileLu API** if you want the FileLu-specific integration path.

Choose **S3** if you want object-storage workflows.

Choose **WebDAV** if you want a more file-oriented setup.

Choose **FTPS** only if you specifically need FTP-style compatibility.

## Recommended Starting Point

For most users, start with one of these:

- **FileLu API** for the native provider integration
- **FileLu S3** for object storage workflows
- **FileLu WebDAV** for file browsing workflows

## What You Need

The exact fields depend on the mode:

- API mode: FileLu account credentials or API-specific details
- S3 mode: access key, secret key, bucket name, endpoint
- WebDAV mode: username, password, WebDAV endpoint
- FTP or FTPS mode: hostname, username, password, and port

## Related Documentation

- [S3-Compatible Storage](/protocols/s3)
- [WebDAV](/protocols/webdav)
- [FTP / FTPS](/protocols/ftp)
