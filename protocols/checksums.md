# Checksums and Hashes

Which digests each backend can hand back **without downloading the file**, and which it cannot.

AeroFTP never downloads a remote file in order to hash it. A digest either comes from metadata the backend already holds -- an S3 ETag, a Google Drive `file.hashes` field, an ownCloud `oc:checksums` property -- or from work the *server* does on its own disk, as with `sha256sum` run over an SSH exec channel. Where a backend has nothing to offer, the Properties -> Checksum tab says so on the row itself instead of showing a Calculate button that cannot succeed.

**Local files are different.** AeroFTP reads them itself, so MD5, SHA-1, SHA-256, SHA-512 and BLAKE3 are all available for anything on your own disk, on every platform.

## Support matrix

| Backend | Server-side digests | Notes |
| --- | --- | --- |
| FTP | MD5, SHA-1, SHA-256, CRC32 (negotiated) | Depends on what the server advertises in FEAT: `HASH` (algorithm chosen by the server), or the older `XMD5` / `XSHA1` / `XCRC`. A server advertising none offers no digest. |
| FTPS | MD5, SHA-1, SHA-256, CRC32 (negotiated) | Depends on what the server advertises in FEAT: `HASH` (algorithm chosen by the server), or the older `XMD5` / `XSHA1` / `XCRC`. A server advertising none offers no digest. |
| SFTP | SHA-256 | Computed by the remote host with `sha256sum` over an SSH exec channel: the bytes are read on the server, never sent to us. Omitted if the host has no `sha256sum`. |
| WebDAV | SHA-1, MD5, Adler-32 (negotiated) | Only ownCloud and Nextcloud publish the `oc:checksums` property, and only for files uploaded by a client that sent one. Every other WebDAV server omits it. |
| S3 | MD5 | The ETag is the object MD5 only for single-part, non-SSE-KMS objects. For a multipart or KMS-encrypted object the digest is omitted rather than guessed. |
| Azure Blob | - |  |
| Swift | - |  |
| Google Drive | MD5, SHA-1, SHA-256 | Native Google Workspace documents have no byte stream and therefore no digest. |
| OneDrive | SHA-1, SHA-256, QuickXorHash | Which of the three is present depends on the account: personal OneDrive publishes QuickXorHash, business and SharePoint typically SHA-1 and SHA-256. |
| Dropbox | Dropbox content hash | Not a plain file digest: a SHA-256 over the SHA-256 of each 4 MiB block. Comparable only against another Dropbox content hash. |
| Box | SHA-1 |  |
| pCloud | MD5, SHA-1, SHA-256 |  |
| Yandex Disk | MD5 |  |
| Koofr | Koofr hash | Koofr's own opaque hash. Comparable only against another Koofr hash. |
| Backblaze B2 | SHA-1 | Large files and uploads B2 recorded as `unverified:` carry no usable `contentSha1`; those are omitted. |
| GitHub | Git blob SHA-1 | The git blob SHA-1, computed over `blob <len>\0` + content, so it does not match a plain SHA-1 of the same file. |
| GitLab | - |  |
| Immich | SHA-1 | The asset checksum Immich records at upload time. |
| MEGA | - |  |
| Filen | - |  |
| Internxt Drive | - |  |
| Zoho WorkDrive | - |  |
| kDrive | - |  |
| Jottacloud | - |  |
| Drime Cloud | - |  |
| FileLu | - |  |
| 4shared | - |  |
| OpenDrive | - |  |
| Google Photos | - |  |
| ImageKit | - |  |
| Uploadcare | - |  |
| Cloudinary | - |  |
| MTP | - |  |

A backend's own scheme keeps its own name. Dropbox's `content_hash` is a SHA-256 over the SHA-256 of each 4 MiB block, and GitHub's is a git blob SHA-1 computed over a git header plus the content. Neither equals a plain digest of the same bytes, so AeroFTP reports them as "Dropbox" and "Git SHA-1" rather than aliasing them onto SHA-256 and SHA-1, where they would silently fail every comparison you made with them.

## Reading the table

**"(negotiated)"** means the list is what the *protocol* can carry, not a promise from your particular server. FTP announces its hash commands in the `FEAT` reply, and a server offering only `XCRC` can produce CRC32 and nothing else; AeroFTP narrows the Checksum tab to what your server actually advertised as soon as you connect. WebDAV is the same story: only ownCloud and Nextcloud publish `oc:checksums`, and only for files whose uploading client sent one.

**A dash** means no server-side digest at all. That is not always "not implemented yet": Azure publishes `Content-MD5` only for blobs whose uploader chose to send one, MEGA, Filen and Internxt hash client-side under their own end-to-end encryption scheme, and the media CDNs address assets by id rather than by content.

**A listed algorithm can still come back empty for one particular file.** An S3 ETag is the object MD5 only for single-part, non-SSE-KMS objects; B2 records some uploads as `unverified:`; native Google Workspace documents have no byte stream to hash. In those cases AeroFTP tells you the digest is absent for that object rather than downloading the file to compute one behind your back.

## Inside the Overlays Path

Under a crypt overlay -- AeroCrypt or rclone `crypt` interop -- the server stores ciphertext. A server-side digest therefore covers the **encrypted** bytes and **will not match a hash of your local plaintext file**. That is what encryption means, not a fault.

AeroFTP still shows the digest, because it is a real answer to "has the stored object changed", and labels it as covering the stored ciphertext wherever it appears. Earlier versions refused to compute it at all, which left the tab dead in one of the places an integrity check is most wanted.

To check integrity **against your local files** inside an overlay, use the CLI:

```bash
aeroftp-cli crypt verify --profile myremote --local ~/Documents --remote /Vault
```

It stream-decrypts the remote objects without writing plaintext to disk, hashes the decrypted content, and reports matches, differences and files missing on either side.

::: tip Why sync never uses these
The sync engine asks a different question -- "can this digest be compared with a local one?" -- and for an overlay the answer is no. AeroSync therefore ignores ciphertext digests entirely; if it did not, every unchanged file inside the overlay would compare as different on every single cycle.
:::

## Where this table comes from

It is generated from `src-tauri/src/providers/checksum_matrix.rs`, the same declaration the app itself reads to decide what the Checksum tab offers. A test in the AeroFTP repository fails if the published table and the code disagree, so what you read here is what the build does.
