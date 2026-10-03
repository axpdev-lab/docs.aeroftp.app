---
title: Parallelism on a fixed pipe
description: Why a DAG in a file-transfer client is a scheduler under a fixed budget, not a scale-out engine. Where the channel ceiling comes from, what the engine does inside it, where it helps, where it costs, and which direct routes exist.
---

# Parallelism on a fixed pipe

This page explains what the [DAG transfer engine](/architecture/dag-transfer-engine) is for, and what it is not for. The engine page describes how it is built.

## The short answer

A DAG is a directed acyclic graph: it describes which operations must finish before others can start. The graph itself supplies neither machines nor bandwidth. In a compute platform it can expose independent tasks to more workers; in a file-transfer client it exposes independent files, parts or ranges to the resources already available.

The difference is where those resources come from. In a compute platform, adding workers adds capacity. In file transfer the number of useful channels is decided outside the client: by the protocol, by the server's connection limits, by the provider's API rate limits, and by the link. Opening more channels than the endpoint wants does not make a transfer faster. Past a point it makes it slower, and many servers answer by refusing the client.

The AeroFTP DAG can enable useful parallelism, especially within one multipart upload, but it cannot increase the link's capacity. Its job is to use the available transfer budget well:

1. choose a supported transfer shape using capabilities and size thresholds;
2. run the steps of a transfer in the only order that leaves a correct file;
3. dispatch ready work within the configured file, part and request budgets;
4. narrow down when the endpoint pushes back, and recover when it stops;
5. coordinate concurrent jobs through shared process resources.

::: tip Definition
The AeroFTP DAG engine is a scheduler, not an accelerator. It runs transfer operations in dependency order inside explicit resource budgets. It cannot add capacity: it saves time by exposing independent work and removing idle time, and adds reliability by coordinating completion and failure. It stays within the client's effective limits and backs off on congestion, but it does not know the server's true limit in advance and does not search for the fastest width.
:::

## Where the analogy holds and where it breaks

| | Scale-out DAG (pipelines, builds, compute) | AeroFTP transfer DAG |
|---|---|---|
| A node is | a compute task | a protocol operation: one file, one multipart part, one byte range, one server-side copy |
| Workers | may scale across machines, subject to platform limits | bounded by client settings, provider workers and endpoint behavior |
| The bottleneck | compute, storage, network or task dependencies | link bandwidth, round-trip time, storage and CPU, connection limits, API rate limits |
| More width gives | more throughput until the cluster is full | more throughput only until the pipe is full, then contention, then refusals |
| Going too wide costs | queueing | errors: FTP `421`, HTTP `429` and `503`, dropped connections, temporary bans |
| What the graph buys | dependency scheduling and potential parallel speedup | dependency scheduling, supported transfer shapes, resource control and shared lifecycle handling |

The structure is the same in both worlds: nodes, dependencies, a ready frontier. What changes is where the speed comes from. Here a fixed pipe means a finite capacity during a transfer, not a constant speed or a server limit the client already knows.

## Where the ceiling comes from

Three limits are at work: the provider implementation's ceiling, the concurrency the user asked for, and what the server and the link can use productively. The first two bound the client's budget; the third is only discovered, through measurements and congestion signals, and can be lower.

| Endpoint | What limits parallel work | What AeroFTP does |
|---|---|---|
| FTP and FTPS | Each parallel channel is a separate FTP connection, control plus data. Servers cap connections per address and answer `421` when the cap is reached. | Multi-file pool of up to 5 independent connections. One large download can split into up to 16 byte ranges. A `421` counts as congestion. |
| SFTP | Each worker is its own SSH connection with its own handshake. Servers limit concurrent sessions and connection attempts. | Pool ceiling of 16 connections, 4 by default. The effective count is the lower of the ceiling and `--parallel`. |
| WebDAV | Plain WebDAV has no multipart upload: one file is one request. | Up to 8 parallel transfers. On Nextcloud, chunked upload v2 splits one large file into parallel chunks. |
| S3, Backblaze B2, Azure Blob | The friendliest case: multipart parts and ranged reads are independent requests. The ceiling is the link and the service's request rate. | One large upload becomes N parts on independent workers, one large download becomes N ranges. |
| HTTP cloud APIs (Dropbox, Box, Filen, Drime, Uploadcare and others) | Rate limits, answered with `429` and often a `Retry-After` header. | Worker pools of up to 4 per provider. `Retry-After` is honoured on the covered retry and AIMD paths. |
| Ordered upload sessions (Google Drive, OneDrive, Yandex Disk) | The session accepts parts only in order. | One chunk slot: the parts form a strict chain. |
| pCloud multipart | Concurrent parts on one upload session fail on the server side (result `2068`). | The graph keeps the fan-out shape and the single locked session runs the parts one after another. |
| MTP devices | One device, one transfer at a time. | One file slot. |
| The link itself | Once it is full, more channels share the same bytes. | Nothing a client does changes this. |

These are different units: files in flight, multipart parts, download ranges, API requests and physical connections are not interchangeable. `--parallel` controls file-level work where the selected path exposes it; `--multi-thread-streams` controls eligible single-file range downloads. Provider capabilities, size cutoffs and other budgets can keep the actual width below either request.

## Measured: parallel channels have a knee

If the pipe is fixed, why open more than one channel at all? Because one stream can leave bandwidth unused through protocol round trips, limited in-flight data, per-request overhead or server throttling. Several independent streams overlap those waits. A single well-tuned stream may already fill the link; latency alone does not mean that more streams will be faster.

The same reason sets the limit. Once the channels together fill the link, or reach what the server accepts, one more channel adds a handshake and contention and no bytes.

One 300 MiB download, channel count varied, two passes per point, 8 September 2026, lab targets, build `38d5c0b96`. Seconds, lower is better.

| Target | 1 channel | 4 channels | 8 channels |
|---|---|---|---|
| SFTP | 146.61 / 142.89 | 47.30 / 41.89 | 27.90 / 23.03 |
| WebDAV | 31.62 / 43.58 | 17.40 / 14.83 | 13.80 / 13.10 |
| FTP | 29.65 / 32.95 | 16.81 / 17.22 | 19.83 / 15.99 |

The same sweep had an S3 row, left out here: on that build every S3 download ran on one stream whatever channel count was requested, because the size probe read 0 from a `HEAD` response ([aeroftp#881](https://github.com/axpdev-lab/aeroftp/pull/881)). Its points measured noise, not channels. S3 ranged downloads on a fixed build are in the [comparative battery](/test-reports/comparison/2026-10-03).

A finer FTP curve on the same file, mean of two repetitions, with rclone as the control. AeroFTP ran over explicit TLS and rclone in plain FTP, so the two rows compare shapes, not tools:

| Channels | 1 | 2 | 4 | 6 | 8 | 12 |
|---|---:|---:|---:|---:|---:|---:|
| AeroFTP | 52.95 | 26.99 | 22.82 | 17.23 | 13.50 | 14.46 |
| rclone | 42.88 | 28.50 | 16.61 | | 15.71 | |

- On SFTP and WebDAV, width pays a lot, up to 8 channels.
- The FTP curve has its lowest observed mean at 8 channels, and 12 is about 7 percent slower. Two repetitions on a noisy link do not establish a universal optimum or a hard server ceiling.
- rclone also gains from more FTP channels, which points to the link and the server, though it does not isolate them from client costs.
- These links are noisy: on FTP, identical runs differed by up to 42 percent. The two FTP tables come from different runs and should not be compared at one channel.

These are **channel-count sweeps, not DAG-versus-legacy benchmarks**. They show that usable parallel I/O helps these workloads; they do not show that a graph scheduler beats a direct provider path using the same streams. The numbers describe those runs, not a performance guarantee.

## What the engine does inside a fixed budget

<DagDispatch />

### 1. Picks the shape: change what travels, not how many channels carry it

On a fixed pipe the largest wins do not come from extra channels. They come from sending fewer bytes, making fewer requests, or splitting work only where the protocol allows it.

- **Server-side copy.** Where the provider supports it, a copy is a single node, the server moves the data, and the client's link carries none of it. No number of channels beats not sending.
- **Multipart upload.** Without multipart, one file is one request on one channel. With it, on the providers that give each part an independent worker, one large file uses several channels at once.
- **Segmented download.** One object read as N byte ranges, each written at its offset in the same file.
- **When the protocol cannot split.** Ordered sessions get a strict chain, and a provider without independent workers runs its parts one at a time on one session. N part nodes are N scheduled operations, not N concurrent requests.

The shape follows provider capabilities and size thresholds, not a search over measured alternatives, so a supported shape can still be slower on a particular endpoint. The six shapes are drawn on the [engine page](/architecture/dag-transfer-engine#transfer-core-shapes).

### 2. Enforces order: the dependencies are the safety contract

In a compute pipeline, dependencies are mostly plumbing. In file transfer they decide whether the result is a correct file.

- On the durable single-file multipart path, `VerifyChecksum` waits for every part, checks the recorded receipts and the local source identity, and records `Verified` before `CommitTemp` may complete the upload. It is not a remote checksum comparison, and on other paths the node is structural.
- The same path checkpoints each part receipt, so a matching restart sends only the missing parts ([how](/architecture/dag-transfer-engine#multipart-orchestration-in-detail)). Other multipart paths have their own begin, complete and abort lifecycle.
- In a sync, deletions start only after every transfer has finished, and delta sync keeps one exclusive lane on the primary session.

### 3. Keeps the channels busy: idle time is the real cost

With a fixed number of channels, throughput depends on how much of each channel's time goes to bytes and how much goes to waiting. The engine works on the waiting.

- **Ready frontier.** When a channel frees up, the next ready node starts at once. No batch waits for its slowest file.
- **Streaming frontier.** In multi-file jobs, files enter a bounded active set and their part of the graph exists only while they run, so resident graph memory follows the active window. Entry lists, scan results and sync plans can still be held upstream.
- **Warm channels.** The session pool keeps a connection open across files: one SSH handshake per worker instead of one per file, and on FTP the control connection is reused.
- **No round trip per file that is not needed.** The size already known from the listing travels with each file, so the engine does not ask the server again.

Two measurements show what this is worth. Neither has anything to do with width.

SFTP, 5,000 files of 4 KiB, round-trip time 47.4 ms, `--parallel 4` in both builds, 8 September 2026, one run per cell:

| | Before (`3417fcb46`) | After session reuse (`38d5c0b96`) |
|---|---:|---:|
| Upload | 1391.20 s | 330.52 s |
| Download | 1294.21 s | 272.76 s |

The same four channels, about 4.2 times faster on upload and 4.7 times on download. The gain is session reuse, not proof that a graph beats a loop: both builds already used the transfer architecture, and a direct implementation could reuse sessions too.

The opposite case: in September a build added one size probe before every small-file download (a signed `HEAD` on S3, a one-byte `Range` request on WebDAV). On 5,000 files of 4 KiB the S3 download went from 68.35 s to 126.35 s, and back to 68.54 s once the probe was removed ([aeroftp#757](https://github.com/axpdev-lab/aeroftp/pull/757)). The extra 58 seconds are one round trip per file: 5,000 files over 4 channels is 1,250 files per channel, times 47 ms, about 59 seconds. On a fixed pipe with small files, the currency is round trips, not bandwidth.

### 4. Narrows when the endpoint pushes back

Where a path exposes real concurrency, an AIMD controller (additive increase, multiplicative decrease) governs four classes: file, chunk, http and api. The rules below are its default behavior; an operator can switch it off or change the regrowth step.

- A congestion signal (HTTP `429` or `503`, a timeout, a connection reset, an FTP `421`) halves the width for that class, and a server `Retry-After` holds regrowth for its cooldown.
- Each quiet window adds one back, up to the ceiling; for a while regrowth stops one below the level that just failed.
- An error that is not about load (wrong path, permission denied, failed authentication) leaves the width alone.

<DagAimd />

The controller starts at the effective ceiling, or lower if the same endpoint congested in the last ten minutes. From the release after 4.2.1, only congestion and the recovery after it write that memory: an earlier loop that also learned from job throughput spiralled down until a server ran one file at a time, and was removed ([aeroftp#1021](https://github.com/axpdev-lab/aeroftp/pull/1021)). Version 4.2.1 and earlier still have that loop. This is a congestion controller, not a search for maximum throughput: more workers can make a transfer slower through disk contention, CPU load or request overhead without any classified signal, and the controller does not see that.

### 5. Shares process resources across concurrent jobs

Two jobs can compete for the same endpoint, memory, disk and bandwidth. A process-wide governor coordinates them: an endpoint lease per protocol, host and account (256 jobs by default, foreground first); one upload and one download speed limit shared by every job, with an optional combined cap; one memory pool for multipart buffers; and read and write slots per local disk. An endpoint slot is one job, not one network connection, so the governor is not a server-wide connection limit, and it coordinates one process only. Details are on the [engine page](/architecture/dag-transfer-engine#many-files-the-streaming-frontier-and-the-shared-governor).

### And one failure and resume model

The engine gives every transfer the same lifecycle, while retries, resume and error translation still involve provider and surface code. In a batch or a sync, a failed file does not stop the others. The durable single-file multipart path can restart from validated receipts; other shapes do not promise that. One example: a 300 MiB S3 upload, killed at 60 s on a link of about 53 ms, resumed and finished in 82.8 s, where rclone started over and took 128.4 s (one run, 5 September 2026). It shows the value of resume in that run, not a general throughput advantage.

## Where the DAG offers a real advantage

The advantage depends on what the alternative path already does. A graph makes these strategies work together under one scheduler; it does not invent multipart, connection reuse, ranges or server-side copy.

| Workload | Useful contribution | When to expect little throughput gain |
|---|---|---|
| Many small files over a high-latency link | Reuse warm workers, overlap independent files, avoid redundant metadata round trips | The direct path already has the same pool and request pattern, or the provider serializes I/O |
| One large multipart-capable upload | Expose independent parts, bound their resources and order completion; durable resume on the single-file path | One stream already fills the link, parts must be sequential, or setup and checkpoint overhead dominates |
| One large ranged download | Schedule independent ranges and coordinate offset writes, failure and final commit | One stream is already enough, the file is below the cutoff, or the server ignores ranges |
| Same-provider copy | Pick native copy, and fall back observably when the server rejects it | The direct provider path already uses native copy; the gain comes from not moving the payload |
| Large batches and sync | Bound the active graph, admit ready files, isolate file failures, run deletions after transfers | Listing or planning dominates, the source is slow, or the provider has no independent workers |
| Several concurrent jobs | Share speed limits, part memory and disk; arbitrate endpoint slots | One isolated job is the only workload; sharing can deliberately slow it |

Correctness, bounded memory and restartability can be worth having even when elapsed time is unchanged, and they are reported separately from speed.

## If the DAG is slower: what can be fixed, and what bypass exists

Here **legacy** means calling the provider's upload or download method directly, without the outer single-file graph. It does not mean one connection, no multipart, or no DAG anywhere below that call: a provider can implement those internally. The useful comparison is between two concrete paths with the same settings and guarantees.

**Specific regressions can be removed; a promise that the DAG is always faster cannot be made. AeroFTP already bypasses the outer graph for selected single-file downloads, but it has no automatic switch to an older engine based on measured speed.**

| Cause of a slower result | Remedy | Does choosing legacy solve it? |
|---|---|---|
| Extra network probes or repeated handshakes | Remove the redundant requests and reuse sessions, as in the fixes above | Only if the direct path avoids the faulty code; shared provider code makes both pay |
| Bookkeeping around one indivisible operation | A minimal direct path, or a fast path with the same lifecycle guarantees | It can remove the outer graph's cost; this is why WebDAV downloads take the direct route |
| Too many parts or ranges for the file or endpoint | Adjust cutoffs, part sizes and concurrency, and measure at the same settings | Not necessarily: the direct path may call the same multipart or range helper |
| Session locks, missing clones, ordered parts | Independent workers where the protocol allows them; otherwise stay serial | No: a scheduler cannot remove a provider's serialization |
| Endpoint congestion | Fewer admissions, honoured retry delays, a sustainable width | No: removing the graph does not raise a server quota |
| A learned target pinning later jobs | Fix the feedback rule, as in aeroftp#1021 | No: the rule is shared by batch and sync |

The structural case is a single transfer that cannot be split and where the provider already does all the useful I/O. Graph construction and lifecycle work add a cost there and may add no throughput, so the goal is low overhead or a direct route.

### Direct routes that exist today

The single-file router decides **before** a transfer starts, from a fixed policy per provider and direction plus an explicit override. It does not time a transfer, run a legacy trial, or move a slow transfer between engines.

| Path | Default | How to change it |
|---|---|---|
| Single-file download, plain WebDAV or Nextcloud | Direct provider path | `--transfer-engine dag` forces the graph |
| Other single-file network transfers | Graph | CLI `--transfer-engine legacy`; for the desktop app, start it with `AEROFTP_TRANSFER_ENGINE=legacy` |
| Batches and non-dry-run sync | Streaming frontier with one graph per file | Not switched by the single-file override |
| Segmented downloads | Range graph, also when a direct download uses ranges; in the desktop app tried before the router | Not controlled by the override; one stream avoids the fan-out, and the old scheduler exists only in tests |
| Resumed downloads in the desktop app (a partial `.aerotmp`) | Resume path, tried before the router | Not controlled by the override |
| Cross-profile copies, the CLI `--partial` resume path | Their own adapters | Not controlled by the override |
| Single-file SFTP transfers that the delta path (AeroRsync) completes | Delta engine, tried before the router in the CLI and the desktop app | Not controlled by the override; when delta is not possible the transfer continues on the routed path above |

The WebDAV route is an implemented policy backed by earlier benchmarks, not proof that the direct path is faster on every WebDAV server today, and a slowdown outside the routed single-file transfers cannot be fixed with `--transfer-engine legacy`.

## What the engine does not do

- **It does not make one channel faster.** A single file on a protocol without multipart or ranges has one payload operation; the graph around it gives a lifecycle, not parallel work that does not exist.
- **It does not know every endpoint's limit.** Client ceilings bound scheduling; a particular server can refuse or slow down below them.
- **It does not find the fastest width automatically.** Adaptation narrows on classified congestion and recovers toward the ceiling.
- **Graph width is not wire width.** N nodes are N scheduled operations; they become N concurrent requests only where the provider gives independent workers.
- **It does not replace measurement.** Where the knee sits depends on the link and the server. Defaults come from measurements and can be changed: `--parallel`, `--multi-thread-streams`, the GUI speed presets.

## The practical conclusion

In most systems that use a DAG, the graph is how you get more parallelism. In a file-transfer client the amount of parallelism is set by the protocol, the server and the link, and the graph is how you spend it well. The AeroFTP engine picks the shape that moves the fewest bytes, enforces the order that leaves a correct file, keeps every allowed channel busy, backs off when the server objects, and makes concurrent jobs share one budget. It gives real gains where there is independent work to expose or idle time to remove, it can cost a little where a direct call already does everything, and that is exactly where AeroFTP routes around it.

## See also

- [DAG Transfer Engine](/architecture/dag-transfer-engine): shapes, multipart lifecycle, resources, AIMD and the governor.
- [Provider Reference](/advanced/provider-reference): capabilities per backend.
