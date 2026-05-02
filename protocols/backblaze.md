---
title: Backblaze B2 Native API
description: Connect AeroFTP to Backblaze B2 with the native v4 API for first-class behavior — proper folder semantics, atomic renames, file versioning, and 24-hour token reauthorization.
---

# Backblaze B2

Backblaze B2 has been one of AeroFTP's most-used object stores since v1.0, originally through the S3-compatible preset described in [S3-Compatible Storage](/protocols/s3). Starting with the U-05 release, AeroFTP also speaks B2's **native v4 API** as a first-class protocol.

Both options remain available. The native backend is recommended for new connections and for any workflow that uses folders, renames, or versions; the S3-compatible preset stays useful for tools that already standardize on S3 (e.g. shared rclone configs).

## Native vs S3-Compatible

| Capability | Native B2 v4 | S3-compatible |
| ---------- | ------------ | ------------- |
| Auth | `applicationKeyId` + `applicationKey` | Access Key + Secret Key (S3-style) |
| Folders | Real prefix + delimiter listing, `.bzEmpty` placeholders | Emulated via `/` prefix |
| Atomic rename | `b2_copy_file` ≤ 5 GB; chunked `b2_copy_part` workflow > 5 GB up to ~10 TB | Copy + delete, no native rename |
| Large uploads | `start_large_file` workflow (5 MB-5 GB parts, 10 000 part cap) | S3 multipart |
| File versioning | First-class (`b2_list_file_versions`, restore via server-side `b2_copy_file`) | First-class (S3 versioning) |
| Share links | `b2_get_download_authorization` (1s-7d expiration, read-only) | S3 presigned URLs |
| Unfinished upload cleanup | `b2_list_unfinished_large_files` + `b2_cancel_large_file` | S3 abort multipart uploads |
| Token lifecycle | 24-hour token, auto-reauthorized on expiry | Per-request signing, no session token |
| Throughput limits | Up to ~1 GB/s per file with chunked uploads | Same; multipart limits apply |
| Cost surface | Dashboard storage + download bytes | Same |

The native backend gives you a properly typed view of B2: when you list `/photos/` you get back the entries that actually live under that prefix, not whatever S3-emulation layer the gateway happens to materialize. Renames map onto a single `b2_copy_file` API call rather than a download-upload-delete round trip.

The S3-compatible preset is unchanged — it continues to dispatch through AeroFTP's S3 stack and benefits from the same multi-tab, multipart, and retry hardening as AWS S3.

## Connection Settings (Native)

| Field | Value | Notes |
| ----- | ----- | ----- |
| Application Key ID | The `keyID` shown next to your application key in the B2 dashboard | Stored encrypted in the OS keyring |
| Application Key | The `applicationKey` value (only shown once at creation) | Stored encrypted in the OS keyring |
| Bucket | The bucket name (not the bucket ID) | AeroFTP resolves the bucket ID on connect |

There is **no endpoint field**. The native backend calls `b2_authorize_account`, which returns the regional `apiUrl` and `downloadUrl` for your account; AeroFTP routes every subsequent call through those URLs automatically.

To create an Application Key:

1. Sign in at the [Backblaze B2 dashboard](https://secure.backblaze.com/b2_buckets.htm).
2. Open **Application Keys** under the App Keys menu (`https://secure.backblaze.com/app_keys.htm`).
3. Click **Add a New Application Key**.
4. Give the key a name, scope it to a single bucket if possible, and select the permission set that matches your workflow (read, read+write, etc.).
5. Copy the `keyID` and `applicationKey` immediately — the application key is shown only once.
6. In AeroFTP, choose **Backblaze B2 (Native)** from the protocol selector and paste the values into the Application Key ID, Application Key, and Bucket fields.

Permissions tip: AeroFTP needs `listFiles`, `readFiles`, and (for upload, delete, rename) `writeFiles` and `deleteFiles`. The "Read & Write" preset in the dashboard covers the full feature set.

## Folder Semantics

B2 itself does not have folders — every object is identified by its full file name. The native backend follows the convention used by the official Backblaze tooling:

- A "folder" is rendered as a delimiter-listed prefix (e.g. `photos/2024/`).
- An empty folder is materialized as a placeholder file named `.bzEmpty` inside that prefix. AeroFTP creates this on `mkdir` and hides it on `rmdir`.
- `rmdir_recursive` walks the prefix with no delimiter, hiding every file underneath. This is destructive — there is no soft-delete confirmation step.

`.bzEmpty` placeholders are filtered out of directory listings so they don't pollute your folder view, and they don't count against the 10 000-cap-per-listing pagination because they are tiny.

## Uploads

The native backend chooses an upload strategy based on file size:

- **≤ 200 MB** — single-shot `b2_upload_file` POST to a freshly minted `b2_get_upload_url` endpoint. Includes the `x-bz-content-sha1` header for end-to-end integrity, and propagates the local file's modification time via `x-bz-info-src_last_modified_millis`.
- **> 200 MB** — chunked workflow: `b2_start_large_file` → `b2_get_upload_part_url` → repeated `b2_upload_part` (100 MB recommended part size, 5 MB minimum except for the last part) → `b2_finish_large_file`. The implementation enforces B2's 10 000-part hard limit; with 100 MB parts that is a 1 TB ceiling per file.

The chunked workflow is fully streamed — AeroFTP reads the local file part-by-part rather than buffering the whole upload in memory. Each part carries its own SHA-1 checksum for integrity.

## Downloads

Downloads stream from the regional `downloadUrl` returned by `b2_authorize_account`. AeroFTP writes incoming bytes to a `<target>.aerotmp` companion file and renames it atomically on success — partial downloads can never replace a finished local copy. If a download is interrupted, the temp file remains and gets cleaned up on the next attempt; no zero-byte target file is ever produced.

The in-memory variant (`download_to_bytes`, used by previews) issues a `Range: bytes=0-N` request capped to AeroFTP's `MAX_DOWNLOAD_TO_BYTES` budget. Anything larger should go through the streaming path.

## Renames and Server-Side Copy

`rename` is fully server-side regardless of file size — the client never streams bytes. The implementation picks the right B2 endpoint automatically:

- **≤ 5 GB** — single-shot `b2_copy_file` + `b2_delete_file_version` on the source. One round trip per phase.
- **> 5 GB** — chunked `b2_copy_part` workflow: `b2_start_large_file` → loop of `b2_copy_part` with `Range: bytes=N-M` headers (one part per 100 MiB chunk by default) → `b2_finish_large_file` with the part SHA-1 array → `b2_delete_file_version` on the source. The 10 000-part cap and the 5 MB minimum-part rule from upload also apply here, giving an effective ceiling of ~1 TB at the default part size and ~10 TB if part size is bumped to 1 GiB. B2's hard ceiling on single files is 10 TB.

If the chunked workflow fails mid-way, AeroFTP issues `b2_cancel_large_file` to release the parts already copied so they don't accrue storage charges.

If the post-copy delete of the source fails, the new copy is left in place and AeroFTP emits a debug log noting the orphan source version. This matches the small-file path and keeps the rename operation idempotent at the destination.

The `contentSha1` field returned by `b2_copy_part` is the literal string `"none"` whenever the source was itself a chunked-uploaded large file (B2 has no whole-file hash to copy). `b2_finish_large_file` accepts `"none"` entries in `partSha1Array` and AeroFTP rounds them through unchanged.

## Versioning

B2 keeps every version of every file by default — uploading the same key twice produces two `fileId`s with distinct `uploadTimestamp`s. AeroFTP exposes this through the standard versioning API:

- `list_versions(path)` walks `b2_list_file_versions` paginated by `(nextFileName, nextFileId)`, filters to entries matching the requested key, and returns one `FileVersion` per version. Hide markers (B2's soft-delete tombstones) are surfaced with `size = 0` so the UI can render them as `"deleted at <time>"` rows.
- `download_version(_, version_id, local_path)` streams `b2_download_file_by_id` straight to disk via the same atomic `.aerotmp` rename used by regular downloads.
- `restore_version(path, version_id)` replays the chosen version through `b2_copy_file` so it becomes the new latest version under the original `fileName` — no client byte transfer.

There is no time limit on B2 versioning beyond what the bucket lifecycle rule allows. If your bucket is configured to "Keep only the last version", older versions are pruned by B2's lifecycle process and disappear from `list_versions` accordingly.

## Share Links

`create_share_link(path, options)` calls `b2_get_download_authorization` to mint a download token scoped to the file's exact name prefix. The returned URL embeds the token as the `Authorization` query param on the standard download endpoint:

```text
https://<downloadUrl>/file/<bucket>/<key>?Authorization=<token>
```

| Capability | Supported | Notes |
| ---------- | --------- | ----- |
| Custom expiration | Yes | 1 second to 7 days (604,800s); default 24h. Out-of-range values are clamped. |
| Password | No | B2 has no password layer; expiration is the only access control. |
| Permission tiers | No | All B2 tokens grant read-only download. |
| List existing links | No | B2 does not retain a server-side list of issued tokens. |
| Revoke | No | Tokens cannot be invalidated server-side; they expire on schedule. |

The bucket must be private — `b2_get_download_authorization` rejects calls against public buckets with a `bad_request` error. On a private bucket the token replaces the master `applicationKey` for the duration of the request, so the recipient can fetch the file without ever seeing your application key.

## Cleanup of Unfinished Uploads

When a chunked upload starts via `b2_start_large_file` and never finishes (network drop, process kill, app crash), the parts already uploaded continue to count toward stored bytes — and toward your bill — until the session is explicitly cancelled. AeroFTP exposes two B2-specific helpers for this housekeeping:

- `B2Provider::list_unfinished_uploads()` walks `b2_list_unfinished_large_files` to exhaustion and returns one `B2UnfinishedUpload` per session, with the original `fileId`, `fileName`, `uploadTimestamp`, and `contentType`.
- `B2Provider::cancel_unfinished_upload(file_id)` invokes `b2_cancel_large_file` to release the parts. Idempotent at the API level — a 404 means the session was already finalized or cancelled.

These pair with the CLI `cleanup` command, which sweeps both local `.aerotmp` orphans and remote unfinished sessions in one pass.

## Auth Token Lifecycle

The token returned by `b2_authorize_account` is valid for 24 hours. Every native operation transparently retries once on `expired_auth_token` / `bad_auth_token`: the first failure triggers a single re-authorize call, then the original operation is replayed against the refreshed token. If reauthorization fails, the original error is surfaced unchanged. The retry policy applies to listing, navigation, downloads, uploads (small and large bootstrap), folder operations, renames, and stat — see `is_b2_token_failure` and the per-method wiring in [`src-tauri/src/providers/b2.rs`](https://github.com/axpnet/aeroftp/blob/main/src-tauri/src/providers/b2.rs).

The implementation explicitly does **not** retry on:

- Permission denials (mapped to `PermissionDenied`).
- Server-side errors (`5xx`, mapped to `ServerError`).
- Range failures (`416`, mapped to `InvalidConfig`).
- Generic auth-parse errors (e.g. malformed JSON in the token response).

Retrying those would burn HTTP round-trips without changing the outcome.

## Pagination

B2 listings are paginated via `nextFileName`. The native backend follows the cursor until exhaustion with `maxFileCount = 1000` per page, which matches B2's recommended page size. Because the master auth token is refreshed on the first round if needed, multi-page listings of millions of files do not need to plan for token expiry mid-walk.

## CLI Usage

AeroFTP CLI reaches the native backend through the same connection profile selector used by the GUI:

```bash
# List the bucket root through a saved profile
aeroftp ls --profile "My B2 Native" /

# Upload, then verify the round trip
aeroftp put --profile "My B2 Native" ./backup.tar.gz /backups/2026/
aeroftp ls --profile "My B2 Native" /backups/2026/

# Stream a large download to a local tree
aeroftp get --profile "My B2 Native" /archive/2024/ ./local-archive/ --partial

# Rename inside the bucket (server-side copy + source delete, no byte transfer)
aeroftp mv --profile "My B2 Native" /reports/draft.pdf /reports/final.pdf

# Bidirectional sync
aeroftp sync --profile "My B2 Native" ./local /remote --watch
```

For CI/CD, point the CLI at credentials via environment variables and use a dedicated bucket. The integration test harness does this — see [`src-tauri/tests/integration_b2.rs`](https://github.com/axpnet/aeroftp/blob/main/src-tauri/tests/integration_b2.rs) for the end-to-end pattern (connect, upload small + large, download, checksum match, rename, recursive cleanup).

## Common Issues

| Problem | Cause | Solution |
| ------- | ----- | -------- |
| `Bucket '<name>' not found or not accessible` | Application Key is restricted to a different bucket, or the name is misspelled | Verify the bucket name in the B2 dashboard; check the key's bucket scope |
| `applicationKeyId required` / `applicationKey cannot be empty` | Empty value submitted | All three fields (keyID, key, bucket) are required |
| `file name + metadata exceed B2 header budget (7000 bytes)` | The composed file name plus URL-encoded metadata is too large | Shorten the file name or reduce custom metadata; the limit is set by B2's header size cap |
| `source file is N bytes; B2 caps single files at 10 TB` | Tried to rename or upload a file above B2's hard 10 TB ceiling | This is a B2 limit; split the file or store it in a different bucket as multiple objects |
| `rename would require N parts, exceeding B2's 10 000 cap` | File > ~1 TB at default 100 MiB part size | Increase the part size by tuning `LARGE_FILE_PART_SIZE` (max 5 GB per part); covers up to 10 TB |
| `exceeded B2 limit of 10000 parts` | Very large file with too-small a part size | The 100 MB recommended part size handles up to 1 TB; this only triggers on pathological inputs |
| `token expired/invalid` followed by a successful retry (in logs) | Normal 24-hour token rotation | This is expected — AeroFTP reauthorized transparently; no action needed |

## Tips

- Use a dedicated bucket per workflow (backups, builds, dataset shipments). B2 charges by stored bytes regardless of bucket count, and per-bucket Application Keys give you tight scoping.
- B2's free tier covers 10 GB stored and 1 GB of downloads per day. The integration test suite uses ~250 MB in transient storage, well within the free quota.
- For sync workloads, keep `compare_checksum=true` enabled. The native backend records B2's `contentLength` and `uploadTimestamp` in `RemoteEntry` so size-and-mtime comparisons are reliable, and when you opt into checksum compare AeroFTP scans the local side with streaming SHA-256 to match B2's per-object SHA-1 (no full re-download required).
- If you previously connected via the S3-compatible preset and want to migrate, save a new profile against the native backend; existing servers in the registry are renamed "Backblaze B2 (S3-compat)" with a legacy disclaimer but continue to work indefinitely.

## Related Documentation

- [Backblaze B2 setup guide](/providers/backblaze-b2) — quick walkthrough for first-time users.
- [S3-Compatible Storage](/protocols/s3) — the legacy path through AeroFTP's S3 stack.
- [Provider Reference](/advanced/provider-reference) — feature matrix across all 22 providers.
