# aerorsync - Native rsync Protocol in Pure Rust

**aerorsync** is AeroFTP's native implementation of the rsync wire protocol 31 written in pure Rust. It powers AeroFTP's delta sync path on SFTP without requiring any external `rsync` binary on the client - neither on Linux/macOS nor on Windows. This is the engine behind the [Delta Sync](/features/delta-sync) feature you see in AeroSync.

> **Status**: Production, shipped in v3.6.1 as the **first cross-OS file manager with native rsync protocol 31 support in pure Rust**. No `rsync.exe` bundle. No WSL requirement. Byte-identical to stock rsync 3.4.1 in CI.

> **As of v3.6.6** the delta path is wired into three product entry points, not just AeroSync:
>
> - **AeroSync** delta transfers (the original entry point).
> - **Cross-Profile Transfer** SFTP-to-SFTP with key-based auth, so only the bytes that differ from the destination travel on the wire.
> - **AeroTools Code Editor** save against a remote SFTP file, so a one-line change to a 5 MB file ships only the diff.

## Why It Exists

Before aerorsync, AeroFTP shelled out to the local `rsync` binary over an SSH channel for delta sync. That worked on Linux and macOS where `rsync` is universally installed, but it created two ugly choices on Windows:

1. **Bundle a GPL `rsync.exe`** - license complexity, large download, manual updates per release
2. **Require WSL** - barrier-to-entry that most Windows users reject outright

Both options would have permanently divided AeroFTP into a "first-class Unix" and "second-class Windows" product. We chose neither. Instead we wrote our own native rsync client in Rust.

## What It Does

aerorsync re-implements the rsync remote-shell protocol - the wire format that `rsync -e ssh` speaks to a remote `rsync --server` peer - entirely in Rust:

- **Wire protocol 31** - the protocol every modern rsync server (3.0+) speaks
- **Block signatures + rolling checksums** - the algorithm that lets the receiver tell the sender which 64 KiB chunks are missing
- **Multiplexed I/O** - the message framing that interleaves data, errors, and progress on a single SSH channel
- **xxh128 file-level checksum** - the trailing integrity check
- **zstd literal compression** - the on-the-wire compression negotiated with the server
- **Cross-OS** - same binary on Linux, macOS, Windows (`#![cfg(unix)]` removed surgically, only the Unix-specific *fallback* to the legacy classic-binary wrapper stays gated)

The result: when you run AeroSync against a remote SFTP server with `rsync` installed, AeroFTP transfers only the bytes that actually changed - and the entire delta computation happens in a Rust process you trust, with no shell-out, no subprocess, no binary bundle.

## How It Compares

| | Classic rsync wrapper | aerorsync (this) |
|---|---|---|
| Client requires `rsync` binary | Yes (Unix only - Windows blocked entirely) | **No** |
| Cross-OS support | Unix only | **Linux + macOS + Windows** |
| Bundle size impact | ~5 MiB extra binary on Windows | **0** (pure Rust, statically linked) |
| Delta savings on small edits | Yes | **Yes** |
| Wire compatibility with stock `rsync --server` | N/A | **Byte-identical to rsync 3.2.7 / 3.4.1** |
| Memory profile | Streaming via subprocess pipes | Currently in-memory up to 256 MiB per file (P3-T01 will remove this cap) |
| Process model | spawn + IPC | In-process, async |

## Validation

aerorsync is not theoretical. The wire format is pinned against real-rsync behavior on multiple levels:

- **386 unit tests** verify encode/decode round-trips against frozen byte transcripts captured from rsync 3.2.7
- **CI lane 3** runs a full end-to-end upload against rsync 3.2.7 in Docker and asserts the result is **byte-identical** (sha256 match) - fails the build on any regression
- **Live integration tests** target rsync 3.4.1 (Alpine + OpenSSH stock) for both upload and download
- **Cross-OS CI** (`windows-native` job in `delta-sync-integration.yml`) runs `cargo check` + `cargo test --lib` on `windows-latest` - keeps the Windows path green on every push

## Architecture

aerorsync lives in [`src-tauri/src/aerorsync/`](https://github.com/axpdev-lab/aeroftp/tree/main/src-tauri/src/aerorsync) (~20 600 LOC across 23 files):

| Module | LOC | Role |
|---|---|---|
| `real_wire.rs` | 5 700 | Wire format encode/decode (varint, varlong, preamble, file-list, sum_head, sum_block, delta ops, summary frame, multiplex) |
| `native_driver.rs` | 3 700 | Session state machine (preamble exchange → file list → signatures → delta → summary) |
| `tests.rs` | 3 700 | 300+ unit tests against frozen rsync 3.2.7 transcripts |
| `delta_transport_impl.rs` | 1 100 | `AerorsyncDeltaTransport` - bridges the driver to the production `DeltaTransport` trait |
| `ssh_transport.rs` | 800 | SSH exec channel with pinned host key fingerprint |
| `events.rs` | 900 | Event bus for progress, warnings, completion |
| Other 17 files | ~4 700 | types, planner, engine adapter, fallback policy, remote command, mock, fixtures |

The integration point in production is [`SftpProvider::delta_transport()`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/src/providers/sftp.rs):

- On Unix, it can dispatch to either aerorsync (when the runtime toggle `native_rsync_enabled` is on) **or** the classic `RsyncBinaryTransport` wrapper (the legacy path)
- On Windows, only aerorsync exists - there is no classic-binary fallback because there is no `rsync.exe` to fall back to. If aerorsync declines (file too large for the 256 MiB cap), the transfer drops cleanly to plain SFTP without delta optimization

## Configuration

The Cargo feature `aerorsync` is **compiled by default** since v3.6.1, but the **runtime toggle stays OFF by default** - there is one outstanding host-key-algorithm negotiation asymmetry between the SSH library used for classic SFTP (`ssh2`) and the one used by aerorsync (`russh`) that needs to be resolved before flipping the first-run default to ON. The toggle is stored in `~/.config/aeroftp/native_rsync.toml`:

```toml
enabled = true
```

You can also flip it from the AeroFTP GUI: **Settings > AeroSync > Delta backend**.

When enabled, aerorsync activates for any SFTP session that meets the [Delta Sync eligibility rules](/features/delta-sync) (key auth, remote `rsync` available). Otherwise the transfer takes the classic SFTP path automatically. **Soft fallbacks** (file too small, no key on disk, missing remote helper) silently route back to the classic upload path; security-critical failures (host-key mismatch, permission denied) are treated as hard errors and never silently downgraded.

## Limitations (Today)

The first production wave is intentionally narrow. aerorsync **does not** currently:

- Stream files larger than **256 MiB** without going through memory - above that threshold, AeroFTP falls back to the classic wrapper on Unix or to plain SFTP on Windows. **P3-T01 (planned for v3.7.x)** removes this cap by introducing chunked streaming I/O for both upload and download (see [Roadmap](#roadmap-p3-t01))
- Reuse the SSH session across files - every file in a batch opens its own channel. Visible overhead on syncs of *many small* files. P3-T01 also addresses this with batch session reuse
- Support `--delete*`, `--inplace`, `--append`, `--mkpath`, `--partial-dir`, `--sparse`, xattrs, ACLs, hard links, devices, special files
- Run the rsync **daemon** mode (`rsync://`) - only the SSH remote-shell mode is implemented
- Cross-provider delta - aerorsync is SFTP-only by design

These limitations are the natural scope of "delta accelerator on top of SSH for typical SFTP servers". They are **not** blockers for the current production use case (incremental backups to NAS, deploys to web servers, sync against rsync-equipped Linux/BSD hosts).

## Roadmap: P3-T01

The next major aerorsync milestone is **P3-T01 - Industrializzare native rsync** (planned for v3.7.x, ~24 working days across 4 waves):

1. **W1 - Streaming upload**: rolling-checksum producer with chunked source reading. Removes the cap on the upload side
2. **W2 - Streaming download**: chunked baseline reader + writer-driven `apply_delta`. Removes the cap on the download side. **At the end of W1+W2 the 256 MiB limit is gone.**
3. **W3 - Trait extension `DeltaBatch`**: opens one SSH session for N files within a sync batch (~80% RTT saving on 100-small-file syncs against typical 50 ms latency)
4. **W4 - `sync_tree_core` integration**: the AeroSync product path opens/closes batches around the sync loop and surfaces `delta_session_count` + `delta_bytes_on_wire` in the report

The full executable plan lives in the engineering appendix: [APPENDIX-Y P3-T01 Piano Esecutivo](https://github.com/axpdev-lab/aeroftp/blob/main/docs/dev/roadmap/APPENDIX-C-Y-D/APPENDIX-Y/tasks/2026-04-25_P3-T01_Piano_Esecutivo_Dettagliato.md).

## Origin Story

aerorsync started as **Strada C** - the third option in a fork in the road. We had:

- **Strada A** (the wrapper): use the local `rsync` binary. Worked on Unix, blocked Windows.
- **Strada B** (rclone-style block hashing): write our own delta primitives in the `StorageProvider` trait. Wide compatibility but requires every provider to expose remote read/write of partial blocks - most don't.
- **Strada C** (this): re-implement the rsync wire protocol natively in Rust. Narrow scope (SFTP only), but unlocks a real cross-OS delta path with no client-side dependencies.

Strada C took ~10 days of intense wire-protocol archaeology to converge on byte-identical behavior with stock rsync - three composed wire bugs (algo list separator, protocol min-negotiation, sender phase loop) had to be unblocked via wire-dump tooling before the first end-to-end live upload to rsync 3.4.1 turned green with a sha256 match.

The codename `aerorsync` was adopted as the 6th member of the Aero family - the others being **AeroSync** (the sync UX), **AeroVault** (encryption), **AeroPlayer** (audio), **AeroAgent** (AI), and **AeroTools** (developer surface). The crate stub is published on [crates.io](https://crates.io/crates/aerorsync) at the official name.

## Related Pages

- [Delta Sync](/features/delta-sync) - the user-facing UI built on top of aerorsync
- [AeroSync](/features/aerosync) - the higher-level sync workflow
- [SFTP](/protocols/sftp) - the underlying protocol (the only target aerorsync currently runs against)
- [MCP Overview](/mcp/overview) - the `aeroftp_sync_tree` MCP tool uses this engine when applicable
- [CLI Commands](/cli/commands) - `aeroftp-cli sync --watch` activates the delta path automatically when eligible
