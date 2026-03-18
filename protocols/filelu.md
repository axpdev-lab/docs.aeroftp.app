# FileLu

AeroFTP connects to FileLu via their native REST API with API key authentication. FileLu provides 1 GB of free storage with unique file-level security features.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| API Key | Your FileLu API key | Generate at filelu.com > Account > API |

FileLu also supports FTP, FTPS, WebDAV, and S3 access. These can be configured as separate connections using the respective protocol presets.

## Features

- **File Passwords**: Set a password on individual files to restrict access. Recipients must enter the password to download.
- **File Privacy**: Toggle files between public and private visibility.
- **File Cloning**: Duplicate files server-side without re-uploading.
- **Folder Passwords**: Protect entire folders with a password.
- **Folder Settings**: Configure per-folder options (description, password, privacy).
- **Trash Management**: List deleted files, restore individual files/folders, or permanently delete items via the Trash Manager.
- **Remote URL Upload**: Upload files to FileLu by providing a URL. FileLu downloads the file server-side.
- **Share Links**: Files have shareable download links.

## Tips

- FileLu's free tier provides 1 GB. Premium plans offer up to 500 TB.
- The API key is the only credential needed -- no OAuth flow, no email/password.
- FileLu's alternative access methods (FTP, FTPS, WebDAV, S3) can be configured as separate connections in AeroFTP if you prefer a standard protocol.
- For AeroSync, FileLu provides file size metadata for the **size** compare mode. The **remote URL upload** feature can be useful for server-to-server transfers.
