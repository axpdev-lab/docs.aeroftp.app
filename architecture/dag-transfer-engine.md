---
title: DAG Transfer Engine
description: How AeroFTP schedules file transfers through a shared, provider-agnostic node-graph engine. Architecture, shapes, multipart orchestration, server-side copy, AIMD backpressure, provider trait surface.
---

# DAG Transfer Engine

*Released in v4.0.0 (2026-05-24). Status: production.*

Router-selected single-file transfers, batches, non-dry-run sync, segmented downloads and same-provider copies schedule through one shared, provider-agnostic node-graph engine. Outside it stay plain WebDAV and Nextcloud single-file downloads, which the router sends to the provider-direct path; any single-file transfer forced onto that path with `--transfer-engine legacy` or `AEROFTP_TRANSFER_ENGINE=legacy`; the CLI's `--partial` resume path; cross-profile transfers, which download to a temporary file and upload from it; and local-to-local copies. A sync dry-run only plans, so it builds no graph. This page is the
long-form architectural walk-through. The summary tier lives next to
the code at [`docs/DAG-TRANSFER-ENGINE.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/DAG-TRANSFER-ENGINE.md).

## At a glance

::: tip One-line summary
AeroFTP builds a typed directed acyclic graph per transfer, dispatches
nodes through a shared resource manager + AIMD backpressure
controller, and binds each node kind to provider I/O through a thin
runner. Capabilities pick the shape; the executor enforces the budget.
:::

The engine ships as three layers:

| Layer                | Responsibility                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| `transfer_dag` core  | Pure, provider-free graph engine: executor, graph, resources, AIMD, observers. |
| `TransferDagBuilder` | Single source of truth for every production graph shape.               |
| Runners              | Thin bridges (single-file, batch, sync, copy, ranges) that bind nodes to provider I/O. |

The CLI (`aeroftp-cli`), the desktop app and the MCP server (`aeroftp-mcp`) share these runners where their call paths reach them. Wire behavior still depends on the provider, the operation and each surface's adapter, so it is not identical across surfaces by construction.

## Why a DAG engine

::: info What the engine is for
A file-transfer client cannot add channels: the protocol, the server and the link decide how many are useful. [Parallelism on a fixed pipe](/architecture/dag-fixed-pipe) explains what the engine does inside that budget, where it helps, where it costs, and which direct routes exist.
:::

Three converging needs justified the convergence:

1. **One lifecycle model.** Before v4.0.0 each transfer surface ran
   its own ad-hoc orchestrator with its own idea of start, completion
   and failure. The engine gives every graph one node lifecycle
   (`DagObserver`) and one failure model. Byte progress still comes
   from the surface adapters and the provider callbacks, not from node
   events.

2. **Capability-aware shape.** A provider that advertises
   `multipart_upload`, `server_side_copy`, or
   `strict_concurrent_range_download` deserves a different transfer
   shape than one that does not. Pre-DAG, that choice was buried
   inside `provider.upload()` / `provider.download()` and the runner
   could not arbitrate. With the shaped builders the engine sees the
   capability snapshot and picks the right shape per transfer.

3. **One scheduler, one place to fix.** Every scarce resource (file
   slot, checker slot, chunk slot, http slot, api slot, disk read,
   disk write, hash slot, part-buffer memory)
   lives in `transfer_dag/resources` and is governed once for every
   transfer. Backends pick what they reserve (a one-line
   `ResourceRequest` per node kind); they no longer own a scheduler
   of their own.

## The seven-node envelope

Every shape in the engine carries the same structural envelope:

```
Discover(Local|Remote)
       │
       ▼
AcquireResource
       │
       ▼
   transfer core
       │
       ▼
VerifyChecksum
       │
       ▼
PreserveMetadata
       │
       ▼
  CommitTemp
       │
       ▼
 EmitProgress
```

- `Discover{Local,Remote}`: a structural anchor in the current
  runners. The size comes from the listing or from the caller's own
  stat and travels with the file, so no per-file probe is needed.
  Sync no longer has a global discover/compare prefix in the graph:
  the scan and the plan run before it, and each per-file subgraph's
  discover node is a no-op.

- `AcquireResource`: a structural anchor. Reserved for the future
  resume-checkpoint fetch; runs as a no-op today.

- *transfer core*: the only nodes that perform real I/O. The
  capability snapshot picks which kind: `DownloadFile`,
  `UploadFile`, `UploadPart` × N, `DownloadRange` × N,
  `ServerSideCopy`, or a `DownloadFile` + `UploadFile` pair for the
  no-server-side-copy fallback. See [Transfer-core shapes](#transfer-core-shapes).

- `VerifyChecksum`: joins every transfer-core node, so it cannot run
  until the last part or segment lands. On the durable single-file
  multipart path it checks that every part receipt is present and that
  the local source is unchanged, then records a `Verified` fact. It is
  not a remote checksum comparison, and on the other paths it is
  structural.

- `PreserveMetadata`: restores the remote mtime on a downloaded
  file. A no-op on the upload direction; the upload's mtime is the
  one the remote backend assigns.

- `CommitTemp`: finalize the transfer atomically. For a single
  transfer core this is a no-op (the provider's own `.aerotmp`
  finalize is internal). For multipart it submits the ordered receipts
  to `complete_multipart_upload`; on the durable single-file path it
  refuses to do so until `Verified` is recorded.

- `EmitProgress`: terminal node. Its completion is the signal a
  `DagObserver` maps onto the GUI `complete` event or the CLI's
  final result line.

Only the transfer-core nodes carry scarce resources. The structural
anchors hold no `ResourceRequest`, so the graph cannot deadlock
against its own budget.

## Transfer-core shapes

The shaped builders pick the transfer-core shape per transfer from
the provider's `TransferCapabilities` and the source object's size.

<DagShapes />

### Single transfer core

A `DownloadFile` (download direction) or `UploadFile` (upload
direction) below the multipart-capability threshold. Reserves one
`file_slot`, optionally one `api_slot` on
`rate_limited_api` providers.

```
… → AcquireResource → DownloadFile → VerifyChecksum → …
                       (or UploadFile)
```

### Multipart upload fan-out

For an upload above the provider's multipart threshold on a provider that gives each part an independent worker (S3, Backblaze B2, Azure Blob, Nextcloud chunked v2, Dropbox, Box, Filen, Drime, Uploadcare). The transfer core fans out into N `UploadPart`
nodes, one per chunk. Each part node reserves one `chunk_slot`, so
the shared chunk budget governs how many parts upload in parallel. A provider whose upload session takes parts only in order (Google Drive, OneDrive, Yandex Disk) declares one chunk slot and gets a strict chain instead. A provider that allows parallel parts but cannot give each one an independent worker (pCloud today) keeps the fan-out shape and runs the parts one at a time on its single session: N part nodes are N scheduled operations, not N concurrent requests.
`VerifyChecksum` joins every `UploadPart` node, so it cannot fire
until the last part lands.

```
                       ┌→ UploadPart 1 ─┐
                       ├→ UploadPart 2 ─┤
… → AcquireResource ──┼→ UploadPart 3 ─┼→ VerifyChecksum → …
                       ├→ UploadPart 4 ─┤
                       └→ UploadPart 5 ─┘
```

Part-number to node-id mapping is a dense, 1-based `HashMap` built at
runner setup time. The receipts are sorted
by `part_number` ascending before submission to
`complete_multipart_upload`, matching the S3 / B2 contract. The
protocol cap (S3 and B2 both ceiling at 10000 parts) is enforced by
the builder profile, not the runner.

### Server-side copy

For copies between two keys on the same provider when the backend
advertises `server_side_copy` (S3 `x-amz-copy-source`, B2
`b2_copy_file`, WebDAV `COPY`, ImageKit `copyFile`, plus 14 other
native providers). The transfer core collapses into a single
`ServerSideCopy` node that holds only an `api_slot`. No disk I/O,
no file slot, no chunk slot: the server moves the bytes.

```
… → AcquireResource → ServerSideCopy → VerifyChecksum → …
```

When the capability is absent the graph degrades honestly:

```
… → AcquireResource → DownloadFile → UploadFile → VerifyChecksum → …
```

Two real transfers, two file slots, two real round-trips. When the capability is advertised but the server rejects the native copy with a recoverable error, the copy node completes as an observed fallback and the same two-node payload graph runs. Permission, not-found, authentication, quota and transport errors fail the copy instead of falling back.

### Segmented intra-file download

When `strict_concurrent_range_download` is available the segmented
download runner builds a fan-out of `DownloadRange` nodes with no
inter-segment dependencies. Each node reserves one `range_chunk`
resource (chunk + http + disk_write = 1 each), so the shared chunk
/ http / disk-write budget governs how many ranges run at once. The
node id zero-based ordering matches the range plan, so the runner
indexes the plan by `node.id`.

```
DownloadRange 0 ─┐
DownloadRange 1 ─┤
DownloadRange 2 ─┼→ (all converge in a single .aerotmp file)
DownloadRange 3 ─┤
DownloadRange 4 ─┘
```

The segmented download is intra-file (downloading one object via N
parallel `Range` requests against the same key), distinct from the
batch fan-out (downloading N different objects concurrently). Both
benefit from the same resource manager.

## Builder methods

The builder lives at `src-tauri/src/transfer_dag/builder.rs` and is
the single source of truth for every shape:

| Builder method                       | Used by                                  | Outputs                                  |
| ------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| `shaped_file(direction, caps, size)` | Single-file runner (GUI and CLI), and every file the batch and sync streaming frontier admits | `ShapedFileDag` (single core, N × UploadPart, or an ordered part chain) |
| `shaped_copy(caps)`                  | `execute_copy_dag` (GUI copy, CLI `cp`, CLI WebDAV `COPY`) | `CopyDag` (server-side or download+upload) |
| `shaped_ranges(N)`                   | `providers::multi_thread::run_ranges_via_graph` | `ShapedRangesDag` (N × DownloadRange) |
| `single_file`, `from_batch`, `from_batch_shaped`, `from_sync_plan`, `from_sync_plan_shaped` | No production caller since the streaming frontier (DAG-P2-04) builds one `shaped_file` subgraph per admitted file | Whole-job graphs, kept for tests |

With `TransferCapabilities::default()` the shaped builders reproduce
the legacy single-transfer-core shape byte-identically. The shaped
path is therefore safe to wire as the only production builder; only
the capability set changes the shape.

## Multipart orchestration in detail

The multipart fan-out is the most active part of the single-file runner. On the durable single-file path each upload goes through a checkpointed lifecycle:

1. **Begin, lazily.** The first `UploadPart` node to run opens the session with `begin_multipart_upload`; the others reuse the handle.
2. **Send each part from disk.** The executor first acquires the part's disk and buffer-byte lease, then hands the part to the provider as a `PartBody` disk slice through `upload_part_body`. Providers that can stream a part (WebDAV and Nextcloud, Dropbox, Google Drive, OneDrive and others) read it one bounded window at a time; providers that must own the whole part to hash, sign or encrypt it (S3 signed payloads, B2, Box, Azure, MEGA, Filen) hold it in memory, inside the same lease.
3. **Checkpoint each receipt.** Every successful receipt is written atomically to a durable checkpoint before its node completes.
4. **Verify.** `VerifyChecksum` compares the checkpoint with a fresh look at the local source (every part present, source unchanged) and records `Verified`.
5. **Commit, fail-closed.** `CommitTemp` sorts the receipts by part number, calls `complete_multipart_upload` only if `Verified` is recorded, and records `Committed` before the graph can report success.

<DagCompletion />

### Failure and restart

A failed or cancelled durable upload keeps its session and its valid receipts. The checkpoint identity binds the local path, size and mtime, the provider, the endpoint account, the remote path and the part layout, so a matching restart restores only validated receipts and sends only the missing parts. A conservative scavenger aborts a matching session only after its TTL has expired, and removes the record only after the abort succeeds.

Multipart inside a batch shares the part layout and the begin, part and complete steps, but not this checkpoint: there a failed file is aborted once, after its in-flight parts have drained.

## Resource governance

The resource manager arbitrates dispatch against a per-operation
budget:

| Class             | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `file_slots`      | Concurrent whole-file transfers.                       |
| `chunk_slots`     | Concurrent multipart parts or range segments.          |
| `http_slots`      | Concurrent HTTP request bodies in flight.              |
| `disk_read_slots` | Concurrent fs reads (one per `UploadPart` chunk read). |
| `disk_write_slots` | Concurrent fs writes (one per `DownloadRange` write). |
| `api_slots`       | Rate-limited API requests.                             |
| `checker_slots`   | Concurrent pre-transfer checks (`--checkers`).         |
| `hash_slots`      | Concurrent hashing.                                    |
| `buffer_bytes`    | Part memory, in 64 KiB credits from one process-wide pool. |

Each `ResourceRequest` is a one-line declaration on a node kind:

```rust
// Whole-file upload / download: one direction of local disk only.
ResourceRequest::upload_file()    // { file_slots: 1, disk_read_slots: 1, .. }
ResourceRequest::download_file()  // { file_slots: 1, disk_write_slots: 1, .. }

// Multipart upload part: chunk slot, disk read, and its part buffer.
ResourceRequest::upload_part(buffer_bytes)
// = { chunk_slots: 1, disk_read_slots: 1, buffer_bytes, .. }

// Segmented range download:
ResourceRequest::range_chunk()    // { chunk_slots: 1, http_slots: 1, disk_write_slots: 1, .. }

// Server-side copy: API only, no disk, no buffer.
ResourceRequest::server_copy(api_slots)
```

The executor only dispatches a node when:

1. Every predecessor completed.
2. The node's `ResourceRequest` can be satisfied from the manager's
   current budget.
3. The AIMD controller's per-class dispatch target permits one
   more node of this kind.

<DagDispatch />

### Many files: the streaming frontier and the shared governor

Batches and sync do not build one graph for the whole job. Work items stream from the source (the entry list, or the sync plan once the scan has finished) into a bounded backlog, 10,000 items by default (`--max-backlog`), which pauses the source when full. At most a window of file slots plus a little headroom is admitted at a time; each admitted file gets its own `shaped_file` subgraph, which is dropped when the file is done. Resident graph memory therefore follows the active window, not the size of the job. A failed file is recorded without stopping the others, and sync deletions start only after the last transfer.

Above every job sits one process-wide governor. An endpoint lease keyed by protocol, host and account caps concurrent jobs per endpoint (256 by default, foreground jobs first, a waiting background job served after eight bypasses); it counts jobs, not network connections. The user speed limit (`--limit-rate`, `--bwlimit`, the GUI setting) arms one upload bucket and one download bucket shared by all jobs, `AEROFTP_GLOBAL_BANDWIDTH_BPS` adds an optional cap over both directions combined, one memory pool holds every multipart part buffer, and each local disk device has its own read and write slots (8 per direction by default). The governor lives in one process: the desktop app and a separate CLI process do not share it.

<DagFrontier />

## AIMD backpressure

Where a path exposes real concurrency, an `AimdController` governs four classes (file, chunk, http, api). With AIMD enabled, the default (an operator can switch it off), it classifies failures into three buckets:

- **Congestion signal** (429, 503, request timeout, connection
  reset, an FTP `421` too-many-connections refusal): the per-class
  dispatch target halves. A server `Retry-After` holds regrowth for
  its cooldown.
- **Non-congestion failure** (`InvalidPath`, `PermissionDenied`,
  `AuthenticationFailed`, …): the target is left untouched. The
  failure is not a load signal.
- **Quiet stretches**: after each quiet window without congestion
  the target grows by the regrowth step (one by default, operator-tunable), up to the ceiling. After a congestion
  event regrowth stops one below the level that failed until the
  recovery window has passed.

On a fresh endpoint, or once its cached profile has expired, the
controller starts every class at its ceiling, so a transfer with no
congestion dispatches every node immediately, identical to the
pre-AIMD path. An endpoint that congested recently seeds the next job
below the ceiling, as the next paragraph explains. It only ever shrinks the in-flight set under a real
congestion signal, where a smaller dispatch target is the safer,
faster choice.

Within one process, the target an endpoint was pushed down to seeds the next job to that endpoint for ten minutes (DAG-P2-06). From the release after 4.2.1, only congestion and the recovery after it write that memory: a loop that also learned from job throughput spiralled down and was removed ([aeroftp#1021](https://github.com/axpdev-lab/aeroftp/pull/1021)). Version 4.2.1 and earlier still have that loop. Nothing persists across processes. AIMD is a congestion controller, not a search for the fastest width: a slowdown that produces no classified signal does not move it.

<DagAimd />

## Provider trait surface

A provider participates in the engine by advertising its capabilities
and implementing the matching trait methods. Three families:

### Capability advertisement

```rust
fn transfer_capabilities(&self) -> TransferCapabilities { … }
fn supports_server_side_copy(&self) -> bool { … }
```

The capability snapshot is read once per transfer, before the graph
is built. Providers populate it from their wire-protocol knowledge
(S3 advertises multipart + server-side copy; SFTP advertises file
parallelism + session pool; WebDAV advertises COPY + sometimes
range download, etc.).

### Multipart upload

```rust
async fn begin_multipart_upload(
    &mut self,
    remote_path: &str,
    total_size: u64,
    content_type: Option<&str>,
) -> Result<MultipartHandle, ProviderError>;

async fn upload_part(
    &mut self,
    handle: &MultipartHandle,
    part_number: u32,
    data: Vec<u8>,
) -> Result<UploadedPart, ProviderError>;

// What the runner calls. The default materializes the slice and
// delegates to upload_part; streaming providers override it and
// return true from multipart_streams_part_body().
async fn upload_part_body(
    &mut self,
    handle: &MultipartHandle,
    part_number: u32,
    body: PartBody,
) -> Result<UploadedPart, ProviderError>;

fn multipart_streams_part_body(&self) -> bool;

async fn complete_multipart_upload(
    &mut self,
    handle: MultipartHandle,
    parts: Vec<UploadedPart>,
) -> Result<(), ProviderError>;

async fn abort_multipart_upload(
    &mut self,
    handle: MultipartHandle,
) -> Result<(), ProviderError>;
```

`MultipartHandle` is opaque: `upload_id` (whatever the backend uses
to identify a session: S3 `UploadId`, B2 `fileId`, …) plus
`remote_path` (so the runner can correlate handles with shaped-graph
nodes).

### Server-side copy

```rust
async fn server_side_copy(&mut self, from: &str, to: &str)
    -> Result<(), ProviderError>;
```

Default delegates to the legacy `server_copy`. New code reaches for
`server_side_copy` because it matches the
`TransferCapabilities::server_side_copy` slot one-to-one.

The default implementations of every method above return
`ProviderError::NotSupported`, so a provider that never advertises
the capability never reaches them.

## What changed in v4.0.0

| Before v4.0.0                                          | After v4.0.0                                          |
| ------------------------------------------------------ | ----------------------------------------------------- |
| Flag-gated DAG path: `AEROFTP_TRANSFER_ENGINE_DAG_*`   | DAG path unconditional, three env vars removed.       |
| Hand-rolled `JoinSet` sliding-window batch orchestrator | `execute_batch_dag` is the only batch path.          |
| Multipart upload was internal to `provider.upload()`   | Multipart is an engine concern: N `UploadPart` nodes governed by the shared chunk budget. |
| Server-side copy was an ad-hoc per-provider method     | One `ServerSideCopy` node, one `api_slot`, one shape. |
| Five distinct routing shims (`if dag_enabled { … }`)   | The three rollout flags are gone. Batch, sync, copy and segmented download go through the shared core. A single-file legacy override and a few adapters remain. |

## Source map

| File                                              | Role                                  |
| ------------------------------------------------- | ------------------------------------- |
| `src-tauri/src/transfer_dag/mod.rs`               | Public exports.                       |
| `src-tauri/src/transfer_dag/builder.rs`           | All eight shape constructors.         |
| `src-tauri/src/transfer_dag/executor.rs`          | `execute_dag` + dispatch loop.        |
| `src-tauri/src/transfer_dag/capabilities.rs`      | `TransferCapabilities` definitions.   |
| `src-tauri/src/transfer_dag/resources.rs`         | Budget + request + manager.           |
| `src-tauri/src/transfer_dag/adaptive.rs`          | AIMD controller + congestion classifier. |
| `src-tauri/src/transfer_dag/observer.rs`          | Observer pipeline (Noop / Gui / Journal / Ordered). |
| `src-tauri/src/transfer_dag_single_file.rs`      | Single-file runner.                   |
| `src-tauri/src/transfer_dag_batch.rs`             | Batch runner.                         |
| `src-tauri/src/transfer_dag_sync.rs`              | Sync runner.                          |
| `src-tauri/src/providers/multi_thread.rs`         | Segmented download runner.            |
| `src-tauri/src/transfer_dag/work_source.rs`       | Streaming frontier for batch and sync. |
| `src-tauri/src/transfer_dag/governor.rs`          | Process-wide governor: endpoint leases, bandwidth, buffer pool, disk slots. |
| `src-tauri/src/transfer_dag/checkpoint.rs`        | Durable multipart checkpoint.         |
| `src-tauri/src/transfer_multipart.rs`             | Shared multipart layout and `PartBody`. |
| `src-tauri/src/transfer_router/hints.rs`          | Single-file engine routing table.     |

The code lives in the [`aeroftp` repo](https://github.com/axpdev-lab/aeroftp).
The summary that tracks the code lives at
[`docs/DAG-TRANSFER-ENGINE.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/DAG-TRANSFER-ENGINE.md).

## Measured results, September 2026

Campaign results. Each table names the date, the link, the binary and the number of repetitions. A single run stays a single run. Two results from this campaign are omitted on purpose: a download "resume" whose file had already finished, and a claimed 17 percent upload gain on one mixed tree that a later pass measured at -2.0 points against a 13.4 percent noise floor.

### SFTP, 5,000 files of 4 KiB

Wired gigabit, RTT 47.4 ms, 8 September 2026, `--parallel 4`. One run per cell. Before is `3417fcb46`. After is `38d5c0b96`, the build that reuses the SFTP session across the tree. rclone on the same link barely moved, which is the check that the window itself did not drift.

![Five thousand small files over SFTP, before and after session reuse](/images/dag-sftp-smallfiles-2026-09-08.png)

| Operation | AeroFTP before | AeroFTP after | rclone before | rclone after |
|---|---:|---:|---:|---:|
| Upload | 1391.20 s | 330.52 s | 687.47 s | 643.64 s |
| Download | 1294.21 s | 272.76 s | 421.92 s | 431.57 s |

The same binary at `--parallel 16` stayed flat (upload 316.02 s, download 264.41 s) because the session ceiling on that build was 4. rclone at 16 streams went to 344.00 s upload and 109.89 s download. Since 4.2.0 the ceiling is 16 ([aeroftp#761](https://github.com/axpdev-lab/aeroftp/pull/761)) and the default parallelism is still 4, so this table is the binary with the ceiling of 4, not a timing of today's ceiling. On that build, at 16 streams, the download was still behind rclone (264 s against 110 s) and the upload had moved ahead (316 s against 344 s). With the ceiling raised and the `stat` and `open` round trips overlapped ([aeroftp#782](https://github.com/axpdev-lab/aeroftp/pull/782)), the download at `--parallel 16` measured 101.54 s against rclone's 107.5 s in the same window, two runs; the [review record](/test-reports/dag-review/2026-09) has every run.

### S3 and WebDAV, same day, two repetitions

Same station and link, 5,000 files of 4 KiB, two interleaved repetitions. Each uploaded tree was read back by the other tool. The quiet-window spread on AeroFTP was 3.3 percent on S3 and 4.9 percent on WebDAV. A third binary, `7336fa6b5`, removed an extra size probe that had doubled small-file downloads on the middle build (S3 download mean 68.35 s, then 126.35 s, then 68.54 s). Upload did not move.

| Cell | AeroFTP upload, two runs | rclone upload, two runs |
|---|---|---|
| S3, before `3417fcb46` | 62.98 s, 66.19 s | 119.79 s, 114.23 s |
| S3, third `7336fa6b5` | 70.49 s, 65.15 s | 124.37 s, 123.62 s |
| WebDAV, before | 62.27 s, 67.16 s | 199.81 s, 191.58 s |
| WebDAV, third | 62.35 s, 60.78 s | 195.16 s, 198.24 s |

Upload of this tree is about twice rclone on S3. On WebDAV the before build is about 3.0 times rclone and the third build is about 3.2 times.

### One resume the review kept

5 September 2026, the before build `3417fcb46`, a laptop on Wi-Fi over a wide-area link of about 53 ms, one 300 MiB S3 upload. The kill arrived at 60 s of a transfer that takes about 128 s. AeroFTP resumed in 82.8 s. rclone started over and took 128.4 s. One run. The download rows from that session are omitted: the download had already finished.

### Not a current S3 download time

On 19 September a 300 MiB S3 download read 31.51 s against rclone at 16.95 s while the client announced four streams and used one. The size probe read `content_length` from a HEAD response, which is 0. Those seconds describe that broken path. They are not a before and they are not an after.

## See also

- [Provider Reference](/advanced/provider-reference): capability
  matrix per backend.
- [Wrapper Stack](/security/wrapper-stack): how AeroVault and
  rclone-crypt overlays integrate with the engine.
- [Contributing → Architecture](/contributing/architecture):
  developer-facing layout walk-through.
