# Archives

AeroFTP includes a full archive management system for browsing, creating, and extracting compressed archives. Both local and remote archives are supported across all 27 protocols. The system handles seven archive formats with optional AES-256 encryption for ZIP and 7z.

## Supported Formats

| Format | Create | Extract | Encryption | Compression | Notes |
| ------ | ------ | ------- | ---------- | ----------- | ----- |
| ZIP | Yes | Yes | AES-256 (WinZip AE-2) | Deflate | Most widely compatible format |
| 7z | Yes | Yes | AES-256 | LZMA2 | Best compression ratio, strong encryption |
| TAR | Yes | Yes | -- | None | Uncompressed tape archive, preserves Unix permissions |
| GZ | Yes | Yes | -- | Gzip (Deflate) | Single-file compression, commonly paired with TAR |
| XZ | Yes | Yes | -- | LZMA2 | High compression ratio, slower than GZ |
| BZ2 | Yes | Yes | -- | Bzip2 | Good compression, moderate speed |
| RAR | -- | Yes | -- | RAR | Extract only (no creation due to proprietary format) |

## Archive Browser

Double-click any archive (local or remote) to open the Archive Browser. The browser displays the archive contents in a navigable file tree without extracting the entire archive to disk.

![Archive Browser showing ZIP contents](/images/archive-browser.png)
<!-- SCREENSHOT: Archive Browser showing the contents of a ZIP file with a folder hierarchy, file names, sizes, dates, and compression ratios in columns. Include the toolbar with Extract Selected and Extract All buttons -->

### Browsing Features

- **Directory navigation** -- browse into folders within the archive as if it were a regular directory tree
- **File metadata** -- view file sizes (both compressed and uncompressed), modification dates, and compression ratios for each entry
- **Sorting** -- click column headers to sort by name, size, date, or compression ratio
- **Selective extraction** -- select individual files or folders and extract only those items, without unpacking the entire archive

### Remote Archives

When you double-click an archive on a remote server, AeroFTP downloads the archive to a temporary location and opens it in the Archive Browser. This works across all 23 supported protocols.

## Creating Archives

Right-click one or more files or directories and select **Compress** to open the CompressDialog.

![CompressDialog with format and password options](/images/compress-dialog.png)
<!-- SCREENSHOT: CompressDialog showing the format selector (ZIP selected), compression level slider, password field with show/hide toggle, file count and estimated size summary, and the Compress button -->

### Step-by-Step

1. **Select files** -- choose one or more files or directories in the file list. The dialog displays the total file count and estimated uncompressed size.
2. **Choose format** -- select the output format from the dropdown: ZIP, 7z, TAR, GZ, XZ, or BZ2.
3. **Set compression level** -- adjust the compression slider where applicable. Higher levels produce smaller files but take longer to compress.
4. **Set a password** (optional) -- for ZIP and 7z formats, enter a password to encrypt the archive contents. The password field includes a show/hide toggle.
5. **Review and compress** -- verify the summary (file count, format, encryption status) and click **Compress** to create the archive.

### Encryption Details

- **ZIP encryption** uses the WinZip AE-2 standard with AES-256. This is compatible with most modern archive tools (7-Zip, WinRAR, macOS Archive Utility, and others).
- **7z encryption** uses the native 7z AES-256 encryption header, which encrypts both file contents and filenames. This provides stronger metadata protection than ZIP, where filenames remain visible even when encrypted.

> **Security note:** ZIP passwords are handled with the `secrecy` crate and zeroized from memory after use, preventing password leakage through memory dumps.

## Encrypted Archives

When opening a password-protected archive, AeroFTP prompts for the password before displaying the contents.

### 7z Password Detection

Detecting whether a 7z archive is encrypted is non-trivial because the format does not expose a simple encryption flag in its header. AeroFTP uses a content probe approach via `for_each_entries` to reliably identify encrypted archives: if iterating entries fails with an encryption error, the password prompt is shown.

### ZIP Password Detection

ZIP archives include encryption flags in their local file headers, making detection straightforward. AeroFTP checks these flags before attempting extraction.

## AeroAgent Integration

AeroAgent includes two archive tools that let you create and extract archives using natural language:

| Tool | Safety | Description |
| ---- | ------ | ----------- |
| `archive_compress` | medium | Create ZIP/7z/TAR archives with optional AES-256 password |
| `archive_decompress` | medium | Extract archives with automatic format detection and password support |

### Examples

- *"Compress all .log files in /var/log into a password-protected ZIP"*
- *"Extract the backup.7z archive to ~/restored/"*
- *"Create a tar.gz of the src/ directory"*

AeroAgent selects the appropriate format, handles password prompts, and reports the result with file count and compressed size.

## Format Selection Guide

| Scenario | Recommended Format | Reason |
| -------- | ------------------ | ------ |
| Sharing with non-technical users | ZIP | Universal compatibility |
| Maximum compression | 7z (LZMA2) | Best ratio, but slower |
| Encrypted archive with hidden filenames | 7z | Encrypts filenames and content |
| Unix system backups | TAR + GZ or TAR + XZ | Preserves permissions and ownership |
| Fast compression of large files | GZ | Good speed/ratio balance |
| Compatibility with Linux package managers | XZ | Standard for `.tar.xz` distribution |
