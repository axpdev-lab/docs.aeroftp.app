---
title: DAG Transfer Engine
description: How AeroFTP schedules every file transfer through a shared, provider-agnostic node-graph engine. Architecture, shapes, multipart orchestration, server-side copy, AIMD backpressure, provider trait surface.
---

# DAG Transfer Engine

*Released in v4.0.0 (2026-05-24). Status: production.*

Every file transfer in AeroFTP (single file, batch, sync, intra-file
segmented download, cross-provider copy) schedules through one
shared, provider-agnostic node-graph engine. This page is the
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
| Three runners        | Thin bridges (`single_file`, `batch`, `sync`) that bind nodes to provider I/O. |

The CLI (`aeroftp-cli`), the Tauri GUI (`aeroftp` desktop app), and
the MCP server (`aeroftp-mcp`) all schedule transfers through the
same runners, so wire-level behavior is identical across surfaces by
construction.

## Why a DAG engine

Three converging needs justified the convergence:

1. **One observability surface.** Before v4.0.0 each transfer
   surface emitted slightly different progress / completion events
   through its own ad-hoc orchestrator. The shared engine produces
   one `DagObserver` stream that every surface consumes. The GUI's
   `transfer_event` channel, the CLI's exit-code-and-line semantics,
   and the MCP `notifications/progress` stream are now three sinks
   on top of the same per-node lifecycle.

2. **Capability-aware shape.** A provider that advertises
   `multipart_upload`, `server_side_copy`, or
   `strict_concurrent_range_download` deserves a different transfer
   shape than one that does not. Pre-DAG, that choice was buried
   inside `provider.upload()` / `provider.download()` and the runner
   could not arbitrate. With the shaped builders the engine sees the
   capability snapshot and picks the right shape per transfer.

3. **One scheduler, one place to fix.** Every scarce resource (file
   slot, chunk slot, http slot, disk read, disk write, api slot)
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

- `Discover{Local,Remote}`: resolve the transfer size. The remote
  variant calls `provider.size(path)`; the local variant reads
  `std::fs::metadata(path).len()`. Sync graphs replace this with a
  global `DiscoverLocal` + `DiscoverRemote` → `Compare` prefix and
  hang every per-file chain below `Compare`.

- `AcquireResource`: a structural anchor. Reserved for the future
  resume-checkpoint fetch; runs as a no-op today.

- *transfer core*: the only nodes that perform real I/O. The
  capability snapshot picks which kind: `DownloadFile`,
  `UploadFile`, `UploadPart` × N, `DownloadRange` × N,
  `ServerSideCopy`, or a `DownloadFile` + `UploadFile` pair for the
  no-server-side-copy fallback. See [Transfer-core shapes](#transfer-core-shapes).

- `VerifyChecksum`: post-transfer integrity check. Joins every
  transfer-core node so it cannot run until the last part / segment
  lands.

- `PreserveMetadata`: restores the remote mtime on a downloaded
  file. A no-op on the upload direction; the upload's mtime is the
  one the remote backend assigns.

- `CommitTemp`: finalize the transfer atomically. For a single
  transfer core this is a no-op (the provider's own `.aerotmp`
  finalize is internal). For multipart it submits the accumulated
  parts to `complete_multipart_upload`.

- `EmitProgress`: terminal node. Its completion is the signal a
  `DagObserver` maps onto the GUI `complete` event or the CLI's
  final result line.

Only the transfer-core nodes carry scarce resources. The structural
anchors hold no `ResourceRequest`, so the graph cannot deadlock
against its own budget.

## Transfer-core shapes

The shaped builders pick the transfer-core shape per transfer from
the provider's `TransferCapabilities` and the source object's size.

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

For an upload above one preferred chunk on a multipart-capable
provider (S3, B2). The transfer core fans out into N `UploadPart`
nodes, one per chunk. Each part node reserves one `chunk_slot`, so
the shared chunk budget governs how many parts upload in parallel.
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
runner setup time. The receipts collected by `upload_part` are sorted
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

Two real transfers, two file slots, two real round-trips. The shape
is fixed at build time, so the executor never has to second-guess
the fallback at runtime.

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
| `single_file(direction)`             | Legacy callers (kept for backward compat) | `SingleFileDag` (linear 7-node chain)   |
| `shaped_file(direction, caps, size)` | `transfer_dag_single_file` runner        | `ShapedFileDag` (single-core or N × UploadPart) |
| `from_batch(items)`                  | Legacy batch callers                     | `BatchDag` (one sub-DAG per item)        |
| `from_batch_shaped(items, caps)`     | `transfer_dag_batch` runner              | `BatchDag` with per-item shaping         |
| `from_sync_plan(plan)`               | Legacy sync callers                      | `SyncDag` (global discover/compare prefix + per-file chains) |
| `from_sync_plan_shaped(plan, caps)`  | `transfer_dag_sync` runner               | `SyncDag` with per-file shaping          |
| `shaped_copy(caps)`                  | Cross-bucket / cross-folder copy callers | `CopyDag` (server-side or download+upload) |
| `shaped_ranges(N)`                   | `providers::multi_thread::run_ranges_via_graph` | `ShapedRangesDag` (N × DownloadRange) |

With `TransferCapabilities::default()` the shaped builders reproduce
the legacy single-transfer-core shape byte-identically. The shaped
path is therefore safe to wire as the only production builder; only
the capability set changes the shape.

## Multipart orchestration in detail

The multipart fan-out shape is the most active part of the runner.
For an upload above one preferred chunk on a multipart-capable
provider, the runner allocates a per-transfer `MultipartCtx`:

```rust
struct MultipartCtx {
    /// Lazy session handle. The first UploadPart invocation that
    /// wins the mutex opens the session; the rest reuse it.
    handle: Arc<Mutex<Option<MultipartHandle>>>,
    /// Receipts collected from successful upload_part calls.
    parts: Arc<Mutex<Vec<UploadedPart>>>,
    /// Maps UploadPart node id → 1-based part number.
    node_to_part: Arc<HashMap<usize, u32>>,
    part_size: u64,
    total_size: u64,
    content_type: String,
}
```

### Lifecycle of an `UploadPart` node

1. **Lock `MultipartCtx::handle`.** If the slot is empty, this is
   the first part to enter the runner: open the session through
   `provider.begin_multipart_upload(remote, total_size, Some(content_type))`.
   Subsequent invocations see an initialized handle and skip the call.

2. **Read the part's slice from disk.** The offset is
   `(part_number - 1) * part_size`; the length is the lesser of
   `part_size` and `total_size - offset` (the last part may be smaller).
   The runner opens a fresh `tokio::fs::File`, seeks, and `read_exact`s
   into a `Vec<u8>`.

3. **Upload the part.** Calls
   `provider.upload_part(&handle, part_number, data)`. The returned
   `UploadedPart` receipt is pushed to `MultipartCtx::parts`.

### Lifecycle of `CommitTemp`

For multipart uploads, the commit node:

1. **Takes the handle.** A `take()` on the handle mutex marks the
   session as consumed: the failure-path abort below knows to skip
   when commit already finished.

2. **Sorts the receipts.** Parts are sorted by `part_number`
   ascending, matching the S3 / B2 / Azure contract every multipart
   backend in the matrix happens to follow.

3. **Submits to `complete_multipart_upload(handle, parts)`.** The
   handle is consumed by the call; the session is no longer valid
   afterwards, success or failure.

### Failure path

When the DAG executor returns `Err`, the runner spawns a best-effort
abort:

```rust
if outcome.is_err() {
    if let Some(handle) = ctx.handle.lock().await.take() {
        let _ = provider.abort_multipart_upload(handle).await;
    }
}
```

This is idempotent: if commit already consumed the handle, the
`take()` returns `None` and the abort is skipped. If commit never
ran, the abort releases the session-side state so the provider does
not accumulate orphan upload IDs.

## Resource governance

The resource manager arbitrates dispatch against a per-transfer
budget. Six classes:

| Class             | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `file_slots`      | Concurrent whole-file transfers.                       |
| `chunk_slots`     | Concurrent multipart parts or range segments.          |
| `http_slots`      | Concurrent HTTP request bodies in flight.              |
| `disk_read_slots` | Concurrent fs reads (one per `UploadPart` chunk read). |
| `disk_write_slots` | Concurrent fs writes (one per `DownloadRange` write). |
| `api_slots`       | Rate-limited API requests.                             |

Each `ResourceRequest` is a one-line declaration on a node kind:

```rust
// Single-file transfer:
ResourceRequest::file_transfer()
// = { file_slots: 1, disk_read_slots: 1, disk_write_slots: 1, .. }

// Multipart upload part:
part_request(api_slots)
// = { chunk_slots: 1, disk_read_slots: 1, api_slots: api_slots, .. }

// Segmented range download:
ResourceRequest::range_chunk()
// = { chunk_slots: 1, http_slots: 1, disk_write_slots: 1, .. }

// Server-side copy:
ResourceRequest { api_slots: 1, .. }
```

The executor only dispatches a node when:

1. Every predecessor completed.
2. The node's `ResourceRequest` can be satisfied from the manager's
   current budget.
3. The AIMD controller's per-class dispatch target permits one
   more node of this kind.

## AIMD backpressure

Every shape runs under the same `AimdController`. The controller
classifies failures into three buckets:

- **Congestion signal** (429, 503, network timeout, connection
  reset, SFTP channel disconnect): the per-class dispatch target
  shrinks (multiplicative decrease, default ÷2 with a guard band).
- **Non-congestion failure** (`InvalidPath`, `PermissionDenied`,
  `AuthenticationFailed`, …): the target is left untouched. The
  failure is not a load signal.
- **Success**: the target grows linearly (additive increase, default
  +1 per completed transfer) up to the budget ceiling.

The controller starts every class at its ceiling, so a transfer with
no congestion dispatches every node immediately, identical to the
pre-AIMD path. It only ever shrinks the in-flight set under a real
congestion signal, where a smaller dispatch target is the safer,
faster choice.

Persistence across runs is out of scope for v4.0.0: the controller
dies with the process. Cross-run persistence is a parking-lot item.

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
| Five distinct routing shims (`if dag_enabled { … }`)   | Zero shims; the graph engine is the production path.  |

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

The code lives in the [`aeroftp` repo](https://github.com/axpdev-lab/aeroftp).
The summary tier of this document lives at
[`docs/DAG-TRANSFER-ENGINE.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/DAG-TRANSFER-ENGINE.md);
the internal design history and decision logs live in
[`docs/dev/roadmap/APPENDIX-DAG-ENGINE/`](https://github.com/axpdev-lab/aeroftp/tree/main/docs/dev/roadmap/APPENDIX-DAG-ENGINE).

## See also

- [Provider Reference](/advanced/provider-reference): capability
  matrix per backend.
- [Wrapper Stack](/security/wrapper-stack): how AeroVault and
  rclone-crypt overlays integrate with the engine.
- [Contributing → Architecture](/contributing/architecture):
  developer-facing layout walk-through.
