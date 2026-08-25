# The AeroFTP Wrapper Stack

AeroFTP is not only a transfer tool. AeroVault is an encrypted archival format, and the same transformations that protect a sealed `.aerovault` container are the ones AeroSync needs for resilient cloud backup. Rather than implement four ad-hoc features, AeroFTP treats them as a single ordered pipeline of **wrappers**: one stack, one mental model, one audit pass.

::: tip Credit
The structure of this page, the wrapper-versus-step taxonomy, the corrected avalanche framing, the algorithm-versioning clause, the small-file-packing model and the chunking trade analysis are a sustained design contribution by **Ehud Kirsh** in the AeroFTP [COMMUNITY ROADMAP thread (issue #162)](https://github.com/axpdev-lab/aeroftp/issues/162). The conversation shaped both the architecture and this document.
:::

## Wrappers and steps

A precise vocabulary, because it determines what is a public, versioned, auditable surface and what is an internal helper:

- A **wrapper** is a transformation that is useful on its own. There are exactly four: **compression**, **chunking**, **encryption**, **error correction**.
- A **step** is a sub-component that is only meaningful inside a wrapper. It is never exposed as a standalone feature.

| Step | Belongs to | Role |
| ---- | ---------- | ---- |
| Small-file packing (tape-archiving) | compression / chunking | concatenate small files so the chunker and compressor see a wide stream |
| RNG / nonce generation | encryption | produce the per-chunk nonce |
| Content-defined boundary detection | chunking | decide where one chunk ends and the next begins |
| Deduplication (index step) | chunking | use chunk ids to decide which chunks already exist at the destination |

Deduplication is often mistaken for a wrapper. It cannot exist without chunking: it consumes chunk identifiers and decides which chunks to skip. It is the **index step of the chunking wrapper**. It has two scopes, same mechanism, different payoff: **intra-file** (which chunks of this file changed since the last sync) and **cross-file / cross-snapshot** (this chunk already exists because another file or an earlier run produced it).

## The order of the four wrappers, and why

```
plaintext
  -> packing (step: concatenate small files)
  -> chunking (content-defined boundaries; BLAKE3 chunk id; dedup index step)
  -> compression (per chunk)
  -> encryption (AEAD per chunk)
  -> cipher hash (BLAKE3-256, pre-decryption integrity)
  -> error correction (Reed-Solomon parity over cipher blocks)   [AeroVault format v4]
  -> container / object store
```

### Compression before encryption

Picture a spectrum. At one end, perfect order: a file of all zeros. At the other end, complete chaos: data that looks fully random. Compression saves space by recognising structure, so it is very effective near the ordered end and useless near the random end. Encryption is designed to make its output statistically indistinguishable from random, so ciphertext sits at the chaotic end and is essentially incompressible. Data must therefore be **compressed before it is encrypted**.

A note on *why* the ciphertext looks random, stated precisely:

> Cryptographic hashes (Argon2, scrypt, SHA-2/3, BLAKE2/3, RIPEMD) and block ciphers in feedback modes (AES-CBC, AES-CFB) exhibit a full avalanche effect: a single-bit change in the input produces a fully-changed output. AEAD modes built on top of stream-cipher constructions (AES-GCM, AES-GCM-SIV, ChaCha20-Poly1305) do not have this property in their ciphertext body: a single-bit plaintext change produces a single-bit ciphertext change. The avalanche surface in those modes lives in the authentication tag, which detects any tampering or corruption at decrypt time. AeroVault uses AES-256-GCM-SIV, so this is the distinction that applies to its at-rest format.

The "compress before encrypt" rule still holds, because the keystream itself is statistically indistinguishable from random and the ciphertext inherits that property regardless of mode.

### Chunking before compression

A single compression stream over the whole input destroys content-defined chunk boundaries: any byte shift in the source cascades through the compressed stream and relocates every downstream boundary. That defeats deduplication, defeats resume, and breaks the chunk-range semantics AeroSync depends on. AeroFTP chunks first, then compresses each chunk independently. Per-chunk compression also keeps random access cheap. The cost is some compression ratio; for sealed containers where ratio matters most (the `archive` profile) the lever is the chunk size, not the wrapper order.

### Small-file packing comes first

Compression and chunking are both more effective the more data they can look at. The first step concatenates small files into a wider stream, historically called tape-archiving. The pack is a pure concatenation of the small files' bytes; the manifest is the index (offset and length per file). There are no per-file frame headers inside the pack: tar-ish framing without the metadata bloat. Files above an engine-derived threshold keep a per-file path.

## Algorithm versioning is a forward-compatibility clause

A format that lives for years must be able to swap an algorithm without breaking older artifacts. Every wrapper layer carries an explicit `algorithm_id` and `algorithm_version` in the frame header; a reader dispatches on those fields instead of hard-coding primitives.

| Wrapper | AeroVault default | Version |
| ------- | ----------------- | ------- |
| `packing` | `small-file-batching` | 1 |
| `chunking` | `gear-cdc` | 1 |
| `chunk_id` | `blake3-keyed-128` | 1 |
| `compression` | `zstd` | 1 |
| `crypt` | `aes-256-gcm-siv` | 1 |
| `cipher_hash` | `blake3-256` | 1 |
| `ecc` | `reed-solomon` (v4, non-critical extension) | 2 |

::: info ECC here means error-correcting code
The `ecc` wrapper is an **error-correcting code**: the Reed-Solomon parity that repairs a damaged vault. It is not Elliptic Curve Cryptography, which is the usual reading of the abbreviation on a security page. The AeroVault format uses no elliptic-curve primitive at all; its cipher is AES-256-GCM-SIV and its hash is BLAKE3, both named in the table above.
:::

v4 reuses the same header layout and only adds the `ecc` field, so **v3 + error correction = v4** and a v3-only build opens a v4 vault for the data it understands, skipping the non-critical parity extension it does not. The detached form of the parity lives in a sibling `.aerocorrect` sidecar.

A teaching example most Linux users already have on disk: `.tar.gz` and `.pkg.tar.zst`. Both tape-archive (`tar`) before compressing. The Arch package format moved from an older compressor to Zstandard without changing the "archive then compress" shape: exactly the algorithm-versioning move applied to a real-world format.

This page does not predict that AI or quantum computing will reshape lossless general-purpose compression for backup workloads. Lossless compression is bounded by source entropy, and backup data is mostly already-compressed media and archives. The algorithm slot is swappable regardless; we version the slot, we do not predict the swap.

## Chunking in depth

### What chunking buys you

1. **Bypass per-file size caps on free tiers.** Representative free-tier single-file maxima:

   | Provider | Free-tier max single file |
   | -------- | ------------------------- |
   | FileLu | 10 GB |
   | 4shared | 2 GB |
   | Yandex Disk | 1 GB |
   | Uploadcare | 500 MB |
   | Box | 250 MB |
   | OpenDrive | 100 MB |

2. **Metadata obfuscation.** An observer sees similarly sized opaque chunks and cannot tell an executable from a video from a note, assuming names and contents are encrypted.
3. **Parallel transfer** of a large file's chunks.
4. **Deduplication** (the index step above): only changed chunks move.
5. **Cheap resume**: an interrupted transfer only repeats the in-flight chunk.
6. **Pooling (future, `T-POOLING`)**: the manifest addresses chunks by id and does not care where a chunk physically lives, so a placement policy can spread chunk ids across several saved provider profiles, RAID0-like across free tiers. Caveats: durability becomes the product of N providers, not the maximum (pair it with error correction), and a restore needs every pooled profile reachable. Roadmap, not shipped.

### Ideal chunk size: a trade curve, not a constant

Smaller chunks waste less bandwidth on an interrupted transfer and dedup small edits more finely, but cost more per-object overhead, compress worse, and grow the manifest. Larger chunks compress better and need fewer requests, but a small edit re-uploads a whole large chunk and more RAM is held per in-flight chunk. A hard floor overrides preference: S3 multipart requires a 5 MiB minimum for every part except the last. AeroVault's at-rest content-defined chunker runs separately (256 KiB min / 1 MiB avg / 4 MiB max by default; the `archive` profile widens the bounds for ratio without changing the wrapper order).

A counter-intuitive point: the same word "chunk" hides two opposite RAM curves. **Transfer-only chunking** (for example rclone's `--drive-chunk-size`) costs *more* RAM as the chunk grows (the in-flight part buffer scales with part size). **At-rest chunking** costs more RAM as the chunk *shrinks*, because the cost is the manifest, not the chunk buffer: more chunks means a larger chunk-id table and index.

### Transfer chunk-size flags vs an at-rest chunking wrapper

When an at-rest chunking wrapper produces the objects, a transfer-level chunk-size flag is redundant: the unit on the wire is already the wrapper's chunk. When both are set AeroFTP keeps the wrapper boundary authoritative and logs that the transfer flag is inert. The transfer flag stays useful only for the no-wrapper case (a plain large-file upload to a provider with a part-size sweet spot).

## Error correction (AeroVault format v4)

Error correction is the fourth wrapper, and it is structurally different: compression, chunking and encryption transform the data; error correction adds parity *alongside* it, so `v3 + error correction = v4` and a v3 reader simply skips the parity it does not understand. It sits as the outermost layer, over the cipher blocks. It repairs damage *before* decryption; AES-256-GCM-SIV remains the sole authority on tampering. Redundancy is for recovery, not for trust. On cloud backends durability is already redundant; on USB sticks, consumer NAS disks, optical media and cold-storage archives it is the difference between an encrypted backup surviving a bad sector and being gone.

The scheme is **Reed-Solomon parity in a detached, par2-style `.aerocorrect` sidecar** that protects any byte stream: a `.aerovault` container, a synced backup file, or an ordinary file. It is content-addressed (it binds to the SHA-256 of the protected content, not a path or salt) and its v2 framing is self-healing, so a lightly-corrupted sidecar still recovers. Repair is fail-closed and all-or-nothing: rebuilt bytes are re-verified against the bound content hash (and, for a vault, its authenticated header MAC and manifest `cipher_hash`) before the original is replaced, so a foreign or corrupt sidecar can only make a repair fail, never overwrite good data. The operational surface is shipped: standalone `aeroftp correct gen|verify|repair`, vault `scrub` / `repair` / `export-parity` / `strip-parity`, and `sync --error-correction`. The full guide is [Error Correction (`.aerocorrect`)](/security/error-correction).

## Where this is today

- **AeroVault format v3 (shipped, the `Archive` vault tier):** packing, chunking, per-chunk zstd, per-chunk AES-256-GCM-SIV, BLAKE3 chunk id and cipher hash, the extension slot used by the v4 error-correction wrapper. It had its public spec review pass in the [#276 design thread](https://github.com/axpdev-lab/aeroftp/discussions/276) and ships as the `Archive` security tier in the vault-create dialog; the simpler Standard, Advanced and Paranoid tiers stay on v2.
- **The `crypt` wrapper as an overlay:** applied per object on top of a provider instead of inside a container, the encryption wrapper is the [AeroCrypt overlay](/features/aerocrypt) (native, AES-256-GCM-SIV) or [Rclone Crypt](/features/rclone-crypt) (interop). Same wrapper, overlay shape instead of the sealed-container shape. AeroCrypt is not AeroVault: AeroVault seals many files into one `.aerovault`, AeroCrypt encrypts each remote object in place.
- **AeroSync:** the streaming surface inherits the wrappers progressively; chunk-first ordering is non-negotiable there because the product depends on "edit one byte, move one chunk". `sync --error-correction` writes an `.aerocorrect` sidecar alongside each transferred file.
- **Error correction (AeroVault format v4):** shipped. Reed-Solomon parity in a detached, content-addressed, self-healing `.aerocorrect` sidecar, with embedded and `both` placements for vaults. See [Error Correction (`.aerocorrect`)](/security/error-correction).

The authoritative format specifications are [`AEROVAULT-V3-SPEC.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/AEROVAULT-V3-SPEC.md) for the container (section 11 covers the v4 error-correction extension) and [`AEROCORRECT-SPEC.md`](https://github.com/axpdev-lab/aerovault/blob/main/docs/AEROCORRECT-SPEC.md) for the detached `.aerocorrect` sidecar. This page is the intuition; the specs are the contract.
