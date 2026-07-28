# AeroRsync - Native rsync Protocol in Pure Rust

**AeroRsync** is AeroFTP's implementation of the rsync **wire protocol 31**, written from scratch in Rust. It powers AeroFTP's delta sync path on SFTP without requiring an external `rsync` binary on the client - not on Linux, not on macOS, not on Windows. It is the engine behind the [Delta Sync](/features/delta-sync) feature you see in AeroSync.

> **Status**: Production since v3.6.1, the first cross-OS file manager to speak native rsync protocol 31 in pure Rust. No `rsync.exe` bundle. No WSL requirement. Verified byte-identical against a stock `rsync --server` in CI.

AeroRsync **does not replace rsync**. It *talks to* rsync: on the far end there is still a standard `rsync --server`. What it removes is the dependency on the rsync binary **on your machine**.

*Page last verified against the code on 28 July 2026.*

## Why It Exists

Before AeroRsync, AeroFTP shelled out to the local `rsync` binary over an SSH channel. That worked on Linux and macOS, where `rsync` is universally installed, and it left two bad options on Windows:

1. **Bundle a GPL `rsync.exe`** - license complexity, larger download, manual updates every release.
2. **Require WSL** - a barrier most Windows users reject outright.

Either would have permanently split AeroFTP into a first-class Unix product and a second-class Windows one. We chose neither and wrote a native rsync client in Rust instead.

## Feature Matrix vs rsync

🟢 present · 🟡 partial or conditional · 🔴 not present

Where a row is 🔴 for AeroRsync, the **Why** column says whether that is a deliberate boundary or unfinished work. Conflating those two is the fastest way to misread this table.

### Protocol and wire

| Capability | rsync | AeroRsync | Why |
|---|---|---|---|
| Wire protocol 31 | 🟢 | 🟢 | Speaks bytes-on-wire to stock `rsync --server` |
| Protocols 27-30 | 🟢 | 🔴 | Deliberate: protocol-31-only. Older endpoints are served by the stock binary |
| Rolling Adler-32 signatures | 🟢 | 🟢 | Identical algorithm |
| Block strong hash: md5 | 🟢 | 🟢 | Live-verified |
| Block strong hash: md4 | 🟢 | 🟢 | Live-verified. Seeding mirrors rsync 3.2.7 `checksum.c` |
| Block strong hash: sha1 | 🟡 | 🟢 | AeroRsync implements it; **rsync dropped sha1 after 3.2.7**, so a 3.4.1 peer refuses it |
| Block strong hash: xxh64 / xxh3 / xxh128 | 🟢 | 🟢 | Live-verified, all three |
| Whole-file checksum trailer verify | 🟢 | 🟢 | Computed and verified in both directions |
| Literal compression: zstd | 🟢 | 🟢 | Tokens compatible with `token.c::send_zstd_token`. Only rsync 3.2.0 and later offer it |
| Literal compression: zlibx | 🟢 | 🟢 | Raw deflate, one session-wide stream, `Z_SYNC_FLUSH` per record. Pinned against captured **rsync 3.1.3** bytes, which is the pre-zstd vintage that NAS firmware ships |
| Literal compression: lz4 | 🟢 | 🔴 | No codec here, and **not advertised**, which is the point: see the note below |
| Literal compression: zlib | 🟢 | 🔴 | Declined structurally, not for effort. `zlib` feeds matched block data through the compressor history on both ends (`token.c::see_deflate_token`), so decoding it needs `inflateIncomp`, a function rsync patches into the zlib it bundles and which exists in neither the system zlib nor any Rust crate. Upstream split `zlibx` out precisely for this reason |
| Negotiates only codecs it can drive | 🟢 | 🟢 | True for rsync by construction: it advertises the list it was compiled with. True for AeroRsync only since it stopped copying that list verbatim, which is the note below |
| Multiplexed I/O framing | 🟢 | 🟢 | |

### Transport and session

| Capability | rsync | AeroRsync | Why |
|---|---|---|---|
| SSH remote-shell transport | 🟢 | 🟢 | |
| Daemon mode `rsync://` | 🟢 | 🔴 | Deliberate: a different transport, not a missing piece of a wire-31 client |
| Local pipe / batch files | 🟢 | 🔴 | Deliberate |
| SSH key auth | 🟢 | 🟢 | |
| SSH password auth | 🟢 | 🟢 | With cross-leg host-key pinning |
| SSH agent auth | 🟢 | 🟡 | Unix via `SSH_AUTH_SOCK`; Windows Pageant is a follow-up |
| GSSAPI / keyboard-interactive | 🟢 | 🔴 | Deliberate |
| Mandatory host-key pinning | 🔴 | 🟢 | Part of the module flow, not left to `known_hosts` |
| One session for many files | 🟢 | 🟢 | `AerorsyncBatch` reuses one SSH session for N files |
| Recursive tree in one invocation | 🟢 | 🔴 | **Unfinished work.** AeroSync owns the tree today; tracked as capstone Y-RSC.7 |

### Metadata preserved

| Capability | rsync | AeroRsync | Why |
|---|---|---|---|
| Modification time | 🟢 | 🟢 | |
| Permissions | 🟢 | 🟢 | Applied at atomic finalize |
| Symlinks | 🟢 | 🟢 | Unix, both directions. Never followed; target sanitised against a hostile server |
| `user.*` extended attributes (`-X`) | 🟢 | 🟢 | Unix, single-file **and** batch. Windows off: no direct `user.*` analogue |
| Other xattr namespaces | 🟢 | 🔴 | Deliberate: `user.*` only |
| POSIX ACL (`-A`) | 🟢 | 🔴 | **Unfinished work** - the next real candidate |
| Owner / group (`-o` / `-g`) | 🟢 | 🔴 | **Unfinished work.** uid/gid already travel on the wire; nothing applies them. Needs a privileged receiver |
| Devices and special files | 🟢 | 🔴 | **Unfinished work.** Unix-only, privileged create |
| Hardlinks (`-H`) | 🟢 | 🔴 | **Structurally blocked** until recursive scope: detecting that two paths share an inode needs the whole file list |

### Transfer behaviour

| Capability | rsync | AeroRsync | Why |
|---|---|---|---|
| Single-file block delta | 🟢 | 🟢 | The core capability |
| Atomic destination write | 🟢 | 🟢 | `.aerotmp` + rename, with a kill-9 invariant |
| Streaming, RSS bounded | 🟢 | 🟢 | Both directions; no in-memory file cap |
| Sparse destination writes | 🟢 | 🟢 | Opt-in hole-punched writes; output reads back byte-identical |
| `--delete` / `--backup` / `--link-dest` | 🟢 | 🔴 | Deliberate: deletion and retention belong to the sync layer, which has its own safety gates |
| Filters `--exclude` / `--include` | 🟢 | 🔴 | Deliberate: AeroFTP filters one layer up with `.aeroignore` |
| `--inplace` / `--append` / `--partial-dir` | 🟢 | 🔴 | Deliberate: `--inplace` would weaken the atomic-rename invariant |
| `--mkpath` (create remote parents) | 🟢 | 🔴 | **Not implemented.** Earlier documentation claimed it was; that was wrong |

### Deployment

| Capability | rsync | AeroRsync | Why |
|---|---|---|---|
| Works with no client binary installed | 🔴 | 🟢 | The reason the module exists |
| Windows without WSL / MSYS2 / Cygwin | 🔴 | 🟢 | The only delta path AeroFTP has on Windows |
| In-process, no fork+exec | 🔴 | 🟢 | Linked inside the app |
| Memory-safe implementation | 🔴 | 🟢 | Rust, no `unsafe` in the module beyond thin libc xattr wrappers |
| Usable as a standalone library | 🟢 | 🔴 | The `aerorsync` crate on crates.io is a **name reservation** with no public API |

## Performance vs stock rsync

Measured 28 July 2026 on an idle 24-core machine: both engines back-to-back, same 50 MB fixtures, same container, SSH over loopback.

**How the comparison was made fair.** The rsync side ran with `-logDtprcz`, the client flags that produce `--server -logDtprcze.iLsfxCIvu` - byte-for-byte the argument string AeroRsync sends. That was verified, not assumed: a wrapper script on the container logged the actual server command line for each candidate flag set.

The everyday `-az` was deliberately **not** used for the published numbers. With it the delta scenarios measure nothing: the two 50 MB fixtures share a size *and* an mtime, so rsync's quick check declares them identical and skips the transfer entirely. The `c` (`--checksum`) in the strict set is what forces a real comparison.

| Scenario | AeroRsync | stock rsync 3.2.7 | Bytes on the wire |
|---|---|---|---|
| Cold upload, 50 MB incompressible | **1.068 s** | 1.367 s | 52 436 493 vs 52 440 795 |
| Delta upload, 640 × 4 KiB regions changed | 2.000 s | **1.358 s** | 3 748 322 vs 3 743 589 |
| Delta download, same change set | **1.310 s** | 1.344 s | 43 481 sent vs 50 737 |
| Redundant upload, nothing to do | **0.461 s** | 1.260 s | 49 B vs 82 B |
| 20 × 256 KiB, one session per file | **4.981 s** | 25.249 s | - |
| 20 × 256 KiB, one recursive `rsync` call | *no recursive scope* | **1.308 s** | - |

Three different results, and the reading matters more than the score:

1. **AeroRsync wins wherever a process would have to be spawned.** Cold upload, no-op, and twenty small files transferred one at a time. `rsync` pays a fresh `ssh` plus `rsync` fork per file - roughly 1.25 s each - while AeroRsync opens an in-process session. That is the 5.1× on the small-file batch and the 2.7× on the no-op.
2. **AeroRsync loses the delta upload by about 30%, while putting the same work on the wire.** 3 748 322 bytes against 3 743 589 is a 0.13% difference, so the protocol decisions agree; the gap is CPU in the Rust encode path against thirty years of tuned C.
3. **The real gap is the row that has no AeroRsync number.** rsync does the whole 20-file tree in *one* invocation in 1.308 s - 3.8× better than the per-file path. That is recursive scope, and `AerorsyncBatch` is what closes it at the transport layer. This benchmark exercises the per-file path on purpose, so it does not show the batch improvement.

**Reproducibility.** Across three runs the wall-clock figures move by a few percent - AeroRsync's cold upload measured 1.005, 1.049 and 1.068 s - while the byte counts are identical every time, which is what you would expect from a deterministic protocol on a fixed payload.

**A caveat that works against us, stated anyway.** The delta fixtures are compressible - `A_base.bin` compresses 9.1:1, and its mutated regions are largely reconstructible from blocks elsewhere in the basis, so rsync reports only 119 800 bytes of literal data on the download. Real-world delta ratios on incompressible payloads will be worse. The *comparison* stays valid, because both engines see identical bytes. The cold-upload fixture is genuinely incompressible (1.0:1), so that row is a clean transport measurement.

## Validation

AeroRsync is not theoretical. The wire format is pinned at several levels, all of which run in CI.

| Layer | What it proves | Count |
|---|---|---|
| Unit tests on the module | Encode/decode round-trips against frozen byte transcripts captured from rsync 3.2.7, plus a captured-wire oracle from rsync 3.1.3 for the deflate token path | **605** |
| CI lane 3, live | End-to-end against a real `rsync --server` in Docker: byte-identical upload (sha256 match), streaming upload, symlinks both directions, `user.*` xattrs inline / out-of-band / binary-with-NUL / empty, the batch path over one session, and a symlink proving it does not inherit its target attributes | **11** |
| Checksum matrix, live | The production upload and download transports driven once per negotiated algorithm: xxh128, xxh3, xxh64, md5, md4, sha1 | **8** |
| Product path, live | `integration_delta_sync` confirms the real product selects the native transport for a host-key-pinned SFTP profile | in CI |
| Cross-OS | `cargo check` and `cargo test --lib` on `windows-2022` every push, plus a `--no-default-features` gate proving the classic-only fallback surface still compiles | in CI |

**Which rsync, precisely.** Three fixtures, three versions, and the distinction is worth stating because this page used to blur it:

| Fixture | Port | rsync | Base image | Serves |
|---|---|---|---|---|
| `aeroftp-rsync-real` | 2224 | **3.2.7** | Debian 12 bookworm | CI lane 3 and the checksum matrix |
| `aeroftp-delta-sync-fixture` | 2222 | **3.4.1** | Alpine 3.19 | the `integration_delta_sync` product-path job |
| `aeroftp-rsync-313-deflate` | 2225 | **3.1.3** | SHA-pinned source build | the deflate oracle: both peers pinned to protocol 31 with no zstd, so `zlibx` is what the negotiation actually picks |

So "byte-identical" is verified against **rsync 3.2.7**. Version 3.4.1 is also exercised in CI, by the product-path job rather than by the byte-identical test. Version 3.1.3 is there for a different reason: it is old enough to predate zstd, which is the only way to exercise the deflate token path against a real peer rather than against our own assumptions about it.

## Architecture

AeroRsync lives in [`src-tauri/src/aerorsync/`](https://github.com/axpdev-lab/aeroftp/tree/main/src-tauri/src/aerorsync) - 23 files, roughly 36 870 lines.

| Module | Lines | Role |
|---|---|---|
| `native_driver.rs` | 9 760 | Session state machine: preamble exchange → file list → signatures → delta → summary |
| `real_wire.rs` | 8 050 | Wire encode/decode: varint, varlong, preamble, file list, `sum_head`, `sum_block`, delta ops, summary frame, multiplex |
| `delta_transport_impl.rs` | 5 060 | `AerorsyncDeltaTransport` and `AerorsyncBatch`, bridging the driver to the production `DeltaTransport` trait |
| `tests.rs` | 2 790 | Unit tests against frozen rsync 3.2.7 transcripts, plus the captured rsync 3.1.3 deflate wire oracle |
| `engine_adapter.rs` | 2 540 | Streaming signature and delta application |
| `ssh_transport.rs` / `russh_session_transport.rs` | 2 400 | The two SSH legs, with pinned host-key fingerprints |
| `events.rs` | 875 | Progress, warnings, completion |
| `xattr_fs.rs`, `streaming_writer.rs`, `live_tests.rs`, and 14 more | ~5 390 | xattr read/apply, atomic writes, live lanes, types, planner, fallback policy, remote command, mocks |

The production entry point is [`SftpProvider::delta_transport()`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/src/providers/sftp.rs). On Unix it dispatches to AeroRsync or to the classic `RsyncBinaryTransport`; on Windows only AeroRsync exists, and when it declines the transfer drops cleanly to plain SFTP with no delta optimisation.

## Configuration

The Cargo feature `aerorsync` is **compiled by default**, and the runtime toggle has been **ON by default in `Auto` mode since v3.8.0** - the host-key algorithm negotiation asymmetry between the `ssh2` leg and the `russh` leg was resolved in May 2026, and the default was flipped after that.

From the GUI: **Settings → Advanced → Delta backend**. From the CLI:

```bash
aeroftp-cli aerorsync mode get          # auto | native | classic
aeroftp-cli aerorsync mode set native
```

`Auto` attempts the native engine first and keeps the classic binary as a fallback on Unix. **Soft** conditions - file below the minimum size, no key on disk, no remote `rsync` - route back to a plain upload silently. **Security** failures - host-key mismatch, permission denied - are hard errors and are never silently downgraded.

## Limitations

Stated as boundaries rather than as a backlog, because they are not the same thing.

**Deliberate.** One file per invocation: AeroRsync is a delta accelerator, not a tree walker. Enumeration, deletion and retention stay with AeroSync, which carries its own safety gates - implementing `--delete` at wire level would install a second, weaker deletion authority underneath the hardened one. Filters are applied one layer up by `.aeroignore`. The destination write strategy belongs to the atomic writer. No `rsync://` daemon mode. Protocol 31 only.

**Unfinished.** ACL is the next real candidate. Owner/group are emitted on the wire but never applied, and doing so needs a privileged receiver that rarely matches a desktop deployment. Device and special files are unimplemented. Hardlinks are structurally blocked until recursive scope exists.

**Version-dependent.** Upstream rsync dropped `sha1` from the negotiated checksum list between 3.2.7 and 3.4.1. AeroRsync still implements it and it works against peers that still offer it, but a modern rsync will refuse it - that is the peer declining, not AeroRsync failing. The compression side cuts the other way: zstd arrived in 3.2.0, so anything older negotiates `zlibx` instead, which is why that path is driven and pinned rather than left to the fallback.

**Why the advertised list is shorter than rsync's.** The negotiated winner is the first name in *your own* advertised list that the peer also offers, computed the same way on both sides (`compat.c::parse_negotiate_str`). That makes the list a promise rather than a wish: every name in it is one the peer may hand you. Mirroring stock rsync's `zstd lz4 zlibx zlib none` verbatim was a real defect, because stock ranks `lz4` above `zlibx` and AeroRsync has no lz4 codec at all: a peer built with lz4 but without zstd made the negotiation settle on a codec we could not drive, and the transfer fell back to the classic wrapper while a working `zlibx` sat one position lower. AeroRsync now advertises `zstd zlibx none` and drives all three. The trailing `none` is what keeps the two lists from ever failing to intersect, so a peer offering only codecs we decline still gets a delta transfer, just an uncompressed one, instead of dropping off the native path. A test sweeps every subset of stock's list and fails if any of them can negotiate something undrivable.

**Not yet a library.** The `aerorsync` crate on crates.io is a reserved name at `0.0.x` with no public API. Extraction depends on three gates: stock-rsync interop green end to end, the dependency direction inverted from AeroFTP to aerorsync, and a separate clean-room commit history. No date is attached to that.

## Origin Story

AeroRsync started as **Strada C**, the third option at a fork in the road:

- **Strada A**, the wrapper: use the local `rsync` binary. Worked on Unix, blocked Windows.
- **Strada B**, rclone-style block hashing: write our own delta primitives in the `StorageProvider` trait. Wide compatibility, but it requires every provider to expose remote partial-block read/write, and most do not.
- **Strada C**, this one: reimplement the rsync wire protocol natively in Rust. Narrow scope, SFTP only, but a real cross-OS delta path with no client-side dependency.

Strada C took about ten days of wire-protocol archaeology to converge on byte-identical behaviour. Three composed wire bugs - the algorithm-list separator, protocol min-negotiation, and the sender phase loop - had to be unpicked with wire-dump tooling before the first end-to-end live upload came back with a matching sha256.

The name is the sixth member of the Aero family, alongside **AeroSync** (sync UX), **AeroVault** (encryption), **AeroPlayer** (audio), **AeroAgent** (AI) and **AeroTools** (developer surface).

## Related Pages

- [Delta Sync](/features/delta-sync) - the user-facing UI built on top of AeroRsync
- [AeroSync](/features/aerosync) - the higher-level sync workflow
- [SFTP](/protocols/sftp) - the underlying protocol
- [MCP Overview](/mcp/overview) - `aeroftp_sync_tree` uses this engine when applicable
- [CLI Commands](/cli/commands) - `aeroftp-cli sync --watch` activates the delta path when eligible
