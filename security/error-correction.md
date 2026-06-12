# Error Correction (`.aerocorrect`)

AeroVault v4 adds a fourth wrapper to the stack: **error correction**. It writes a detached, par2-style Reed-Solomon recovery sidecar, the `.aerocorrect` file, that can repair bit rot in any byte stream: a sealed `.aerovault` container, a synced backup file, or an ordinary standalone file. On cloud backends durability is already redundant; on USB sticks, consumer NAS disks, optical media, and cold-storage archives, a single bad sector is the difference between an encrypted backup surviving and being gone. Error correction closes that gap.

::: tip Credit
Error correction is the fourth wrapper in the design contributed by **Ehud Kirsh** in the AeroFTP [COMMUNITY ROADMAP thread (issue #162)](https://github.com/axpdev-lab/aeroftp/issues/162) and refined in the [Error Correction discussion (#276)](https://github.com/axpdev-lab/aeroftp/issues/276). The unified one-format-for-any-file `.aerocorrect` design, the placement model, and the overhead levels are his calls.
:::

## What `.aerocorrect` is

`.aerocorrect` is a detached Reed-Solomon parity sidecar for **any** byte stream. It protects the bytes of the target without embedding anything into it, so the same format repairs `.aerovault` containers, synced files, or ordinary files. The sidecar is **content-addressed**: it binds to the **SHA-256 of the protected content**, not to a path, vault salt, account, or provider identity. Move the file, rename it, copy it to another disk, and the same sidecar still verifies and repairs it.

The magic bytes are `AEROCORR`. The format is shared byte-for-byte between the AeroFTP application (v4) and the standalone [`aerovault` crate](/advanced/aerovault-crate.html) (0.5.0), pinned by a cross-implementation fixture: a sidecar produced by one verifies and repairs with the other for the same file and overhead level.

## Where it sits in the wrapper stack

Error correction is the **last wrapper** in the AeroVault pipeline. It runs after encryption, so it protects the ciphertext bytes and never has to decode the format. It adds parity *alongside* the data rather than transforming it, which is why `v3 + error correction = v4`: a v3-only reader simply skips the parity it does not understand and still opens the container.

![Where error correction sits in the wrapper stack](/images/error-correction/01-where-ec-sits.png)

Because parity sits over the cipher blocks, redundancy is strictly for **recovery, not for trust**. Repair fixes damage *before* decryption; AES-256-GCM-SIV remains the sole authority on tampering. A repaired stream that an attacker forged still fails the authenticated decrypt.

The definitive stage sequence of the full wrapper stack is:

```
packing
  -> chunking (Gear-CDC, content-defined boundaries)
  -> keyed-BLAKE3 chunk id (dedup key)
  -> compression (zstd, per chunk)
  -> encryption (AES-256-GCM-SIV, per chunk)
  -> cipher hash (BLAKE3-256, pre-decryption integrity)
  -> error correction (Reed-Solomon parity over the cipher blocks)
```

Compression runs **before** encryption (ciphertext is incompressible) and **after** chunking (a single compression stream over the whole input would destroy content-defined chunk boundaries). See [The AeroFTP Wrapper Stack](/security/wrapper-stack) for the full reasoning behind the ordering.

## Placement: detached, embedded, or both

For a vault the parity can live in three places (`RecoveryPlacement`):

| Placement | Where parity lives | Effect on the container |
| --------- | ------------------ | ----------------------- |
| `detached` (default) | Sibling `.aerocorrect` file next to the container | Container stays byte-identical to a plain v3 vault |
| `embedded` | A non-critical extension inside the container, recomputed on every seal | One self-contained file, parity travels with it |
| `both` | Sidecar **and** in-container extension | Redundant recovery surfaces |

![Parity placement: detached sidecar by default](/images/error-correction/02-placement.png)

The default is the detached sidecar because it keeps the container byte-identical to a plain v3 vault and lets you add or refresh parity later without rewriting the encrypted data. For `secret.aerovault` the default sidecar path is `secret.aerovault.aerocorrect`.

A vault writes **exactly three segments** (windows) over its container file, in a fixed order, so each region's parity is found by position: a header window, a manifest (locator) window, and a data window. The header and manifest travel outside the container on purpose: a damaged header or manifest cannot self-locate its own recovery (a chicken-and-egg problem), so the sidecar lets the reader rebuild them and prove correctness by the header MAC and the manifest cipher.

For a standalone file or a synced backup there is no three-region structure: the sidecar simply tiles the whole stream into bounded windows and protects each one.

## Self-healing (format v2)

The `.aerocorrect` v2 format is **self-healing**: a lightly-corrupted sidecar still recovers instead of being rejected wholesale.

![.aerocorrect v2 sidecar layout](/images/error-correction/04-aerocorrect-layout.svg)

The split is deliberate:

- The tiny metadata that *locates* everything (the segment directory, the content hash, and the per-window geometry) is stored in **triplicate with per-copy checksums**. A single rotted directory copy is detected and the read falls back to a good copy; if no single copy verifies, the locator is reconstructed by byte-majority across the three copies and then validated against the content binding. A reconstruction that does not satisfy the binding is rejected.
- The **bulk parity carries no wholesale checksum**. Every Reed-Solomon shard (data and parity) already carries its own checksum, so a rotted parity shard is simply treated as an erasure and routed around at repair time.

This is the key correctness fix over the pre-v2 framing, which used a single all-or-nothing envelope checksum that rejected the entire sidecar on any flip. Self-healing costs about **360 fixed bytes** regardless of file size: it does **not** eat into the main file's parity budget. v1 sidecars are still read; all new sidecars are written as v2.

## Overhead levels

CLI levels map to storage-overhead targets. The exact Reed-Solomon grid is stored in each payload, so a reader reconstructs from the payload metadata rather than from a CLI-level assumption.

| Level | Target overhead | Reed-Solomon grid |
| ----- | --------------- | ----------------- |
| `low` | ~7% | approx `K=14, P=1` |
| `medium` | ~15% | approx `K=13, P=2` |
| `quartile` | ~25% | `K=8, P=2` |
| `high` | ~30% | approx `K=7, P=2` |
| numeric | 5-50% | clamped into the supported range |

Higher overhead survives more damage at the cost of a larger sidecar. `medium` (~15%) is a sensible default for cold media; raise it for media you expect to degrade.

## CLI

### Standalone files: `correct gen | verify | repair`

The `aeroftp-cli correct` subcommand protects any file, vault or not:

```bash
# Generate a detached recovery sidecar (writes report.bin.aerocorrect)
$ aeroftp correct gen report.bin --ec medium
Wrote report.bin.aerocorrect (31543 bytes, 1 segment(s), 15 shards, 15.5% overhead) for report.bin

# Verify without modifying the file
$ aeroftp correct verify report.bin
Verified: report.bin matches report.bin.aerocorrect

# ...after a 4 KiB run in report.bin is overwritten with zeros...
$ aeroftp correct verify report.bin
Corruption detected in report.bin: run `correct repair` to recover from report.bin.aerocorrect

# Repair in place from the sidecar
$ aeroftp correct repair report.bin
Repaired report.bin from report.bin.aerocorrect (1 shard(s) reconstructed)
```

### Vaults: `scrub`, `repair`, and parity management

A vault can be created with error correction enabled, scrubbed (verified) on demand, and repaired from whichever parity source is available:

```bash
# Create an Error Correction vault at a chosen overhead level
aeroftp vault create secret.aerovault --error-correction --recovery-level medium

# Verify the container against its parity (embedded or sidecar)
aeroftp vault scrub secret.aerovault

# Repair damaged regions; --dry-run reports without writing
aeroftp vault repair secret.aerovault
aeroftp vault repair secret.aerovault --dry-run

# Write or refresh a detached sidecar for an existing vault, without rewriting the container
aeroftp vault export-parity secret.aerovault

# Drop the embedded parity copy (refuses unless a sidecar exists, or --force)
aeroftp vault strip-parity secret.aerovault
```

`export-parity` is the add-later win: it reads the encrypted container and writes a sidecar without rewriting the vault, so you can enable recovery on a container that was sealed without it. `strip-parity` refuses to leave a vault with no recovery at all unless you pass `--force`. For scrub and repair the parity source resolves in order: an explicit `--parity` path, then the `<vault>.aerocorrect` sidecar, then the embedded extension; the chosen source is reported.

### Sync: `sync --error-correction`

AeroSync shares the same `.aerocorrect` sidecar and overhead levels. Enable it on a sync job so each transferred file gets a sidecar:

```bash
# Generate sidecars alongside the synced files
aeroftp sync ./local remote:backup --error-correction

# Cap the parity overhead a small file is allowed to add (skips parity below the benefit threshold)
aeroftp sync ./local remote:backup --error-correction --ec-max-overhead 25
```

A bit-rotted remote backup is then repaired on the next pull from its sidecar, without needing the original.

## Security and repair model

Repair is **fail-closed and all-or-nothing**.

![Recovery: file only versus file and sidecar both damaged](/images/error-correction/03-recovery.png)

- **Re-verify before replace.** The rebuilt stream is re-verified against the bound content hash before the original is replaced. For a vault, every reconstructed region is additionally re-verified against the container's authenticated values (the header MAC and the manifest `cipher_hash`) before being persisted.
- **A foreign or corrupt sidecar can only make a repair fail, never overwrite good data.** Because the gate is the authenticated re-verify, a stale or attacker-supplied sidecar cannot push bad bytes into a healthy file.
- **Atomic writes.** Repair writes to a temporary file and renames it into place, so a crash mid-repair never leaves a half-written original.
- **All-or-nothing for vaults.** A vault is re-sealed only if *every* repaired block re-verifies; otherwise the file is left byte-for-byte untouched.

## Bounded memory

Generation and repair run in **64 MiB windows** and read sidecar parity on demand, so memory is bounded to one window plus that window's parity payload, regardless of file size. The `.aerocorrect` file is capped at 1 GiB.

## Specifications

- [`AEROCORRECT-SPEC.md`](https://github.com/axpnet/aerovault/blob/main/docs/AEROCORRECT-SPEC.md) is the full v2 binary layout for the detached sidecar.
- [`AEROVAULT-V3-SPEC.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/AEROVAULT-V3-SPEC.md) section 11 covers the vault-side placement and the `v3 + error correction = v4` evolution.
- [The AeroFTP Wrapper Stack](/security/wrapper-stack) is the intuition for why error correction is the fourth wrapper and where it sits in the pipeline.
