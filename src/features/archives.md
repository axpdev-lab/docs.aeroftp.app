# Archives

AeroFTP includes a full archive management system for browsing, creating, and extracting compressed archives. Both local and remote archives are supported.

## Supported Formats

| Format | Create | Extract | Encryption | Notes |
|--------|--------|---------|------------|-------|
| ZIP | Yes | Yes | AES-256 | Password-protected archives supported |
| 7z | Yes | Yes | AES-256 | Password detection via content probe |
| TAR | Yes | Yes | -- | Uncompressed tape archive |
| GZ | Yes | Yes | -- | Gzip compression |
| XZ | Yes | Yes | -- | LZMA2 compression |
| BZ2 | Yes | Yes | -- | Bzip2 compression |
| RAR | -- | Yes | -- | Extract only (no creation) |

## Archive Browser

Double-click any archive to open the Archive Browser, which displays the archive contents in a navigable file tree. From the browser you can:

- Browse directories within the archive
- View file sizes, dates, and compression ratios
- **Selective extraction** — extract individual files or folders without unpacking the entire archive

## Creating Archives

Use the **CompressDialog** (right-click > Compress) to create new archives:

1. Select one or more files or directories
2. Choose the output format (ZIP, 7z, TAR, GZ, XZ, BZ2)
3. Set compression level (where applicable)
4. Optionally set a password for ZIP and 7z formats
5. Review file count and estimated size before compressing

> **Tip:** AES-256 encryption for ZIP archives uses the WinZip AE-2 standard. For 7z, AES-256 is applied via the native 7z encryption header.

## Encrypted Archives

When opening a password-protected archive, AeroFTP prompts for the password. For 7z files, password detection uses a content probe approach (`for_each_entries`) to reliably identify encrypted archives before extraction.

## AeroAgent Integration

AeroAgent includes two archive tools:
- `archive_compress` — create archives from natural language commands
- `archive_decompress` — extract archives via chat

Example: *"Compress all .log files in /var/log into a password-protected ZIP"*
