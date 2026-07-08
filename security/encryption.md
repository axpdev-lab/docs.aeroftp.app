# Encryption

AeroFTP uses encryption at multiple layers to protect data at rest, in transit, and during credential storage. All cryptographic operations execute locally in the Rust backend - no data is ever sent to external services for encryption or key management.

## Encryption Architecture Overview

AeroFTP applies encryption across several distinct layers:

| Layer | Purpose | Primary Algorithm |
| ----- | ------- | ----------------- |
| AeroVault format v2 | Stable encrypted file containers (default) | AES-256-GCM-SIV (RFC 8452) |
| AeroVault format v3 (Archive tier) | Wrapper-stack container with content-defined chunking, dedup and per-chunk zstd | AES-256-GCM-SIV (RFC 8452) over zstd chunks |
| AeroVault format v4 (v3 + Error Correction) | v3 container plus a detached `.aerocorrect` recovery sidecar over the ciphertext (repair, not confidentiality) | Reed-Solomon parity, SHA-256 content binding |
| AeroCrypt overlay (native) | Per-file encryption on top of any provider profile (`AECR` format) | AES-256-GCM-SIV content, AES-256-KW DEK wrap, AES-256-SIV filenames |
| Archive encryption | Password-protected ZIP/7z | AES-256 |
| rclone crypt interoperability | Full read/write interoperability with existing rclone crypt remotes | XSalsa20-Poly1305 content + EME filename encryption |
| Credential storage | vault.db secrets | AES-256-GCM + Argon2id |
| Transport security | Wire encryption | TLS 1.2/1.3, SSH |

Each layer operates independently, meaning a vulnerability in one layer does not compromise the others.

## AeroVault v2 (stable default)

AeroVault v2 is AeroFTP's stable encrypted container format (`.aerovault` files) and the default tier in the vault-create dialog. It is designed with a defense-in-depth architecture using seven cryptographic primitives:

| Component | Algorithm | Specification | Purpose |
| --------- | --------- | ------------- | ------- |
| Key derivation | Argon2id | 128 MiB memory, t=4, p=4 | Password-to-key derivation |
| Key wrapping | AES-256-KW | RFC 3394 | Master key protection |
| Content encryption | AES-256-GCM-SIV | RFC 8452, 64 KB chunks | File data encryption |
| Filename encryption | AES-256-SIV | RFC 5297 | Deterministic filename obfuscation |
| Header integrity | HMAC-SHA512 | RFC 2104 | Tamper detection on vault header |
| Cascade mode (optional) | ChaCha20-Poly1305 | RFC 8439 | Second encryption layer for defense-in-depth |
| Random number generation | OsRng | CSPRNG | Nonce and key generation |

### Container Format

An AeroVault v2 file has the following structure:

```text
[512-byte header]
  - Magic bytes: "AEROVAULT2"
  - Argon2id salt (32 bytes)
  - Wrapped master key (AES-256-KW)
  - HMAC-SHA512 over header fields

[AES-SIV encrypted manifest]
  - JSON directory listing
  - Per-file metadata (name, size, offset, is_dir)

[Chunked encrypted data]
  - 64 KB chunks, each independently encrypted with AES-256-GCM-SIV
  - Per-chunk random nonce
  - Optional ChaCha20-Poly1305 second layer (cascade mode)
```

### Why AES-256-GCM-SIV

AES-256-GCM-SIV (RFC 8452) is a nonce-misuse-resistant AEAD cipher. Unlike standard AES-GCM, accidental nonce reuse does not catastrophically compromise security - it only leaks whether two plaintexts are identical. This provides a significant safety margin for file encryption where nonce management across thousands of chunks is critical.

### Argon2id Parameters

The key derivation parameters exceed OWASP 2024 minimum recommendations:

| Parameter | AeroVault v2 | OWASP 2024 Minimum |
| --------- | ------------ | ------------------ |
| Memory | 128 MiB | 47 MiB (Argon2id) |
| Iterations (t) | 4 | 1 |
| Parallelism (p) | 4 | 1 |
| Salt length | 32 bytes | 16 bytes |

### AeroVault v2 vs Cryptomator

| Feature | AeroVault v2 | Cryptomator v8 |
| ------- | ------------ | -------------- |
| Content encryption | AES-256-GCM-SIV (RFC 8452) | AES-256-GCM |
| Nonce misuse resistance | Yes | No |
| Key derivation | Argon2id (128 MiB, t=4, p=4) | scrypt (N=32768, r=8, p=1) |
| Key wrapping | AES-256-KW (RFC 3394) | AES-256-KW (RFC 3394) |
| Filename encryption | AES-256-SIV | AES-256-SIV |
| Header integrity | HMAC-SHA512 | HMAC-SHA256 |
| Cascade encryption | ChaCha20-Poly1305 (optional) | Not available |
| Chunk size | 64 KB | 32 KB |
| Container format | Single `.aerovault` file | Directory tree with encrypted files |
| Directory support | Yes (hierarchical paths in manifest) | Yes (directory nodes) |
| Remote vault support | Yes (download, edit, re-upload) | Read-only in AeroFTP |

AeroFTP can also create and browse Cryptomator vault format 8 containers, using scrypt + AES-256-KW + AES-256-SIV + AES-256-GCM.

## AeroVault v3 (Archive tier)

AeroVault v3 is the first wrapper-stack vault format. It keeps the single-file `.aerovault` portability of v2 while adding content-defined chunking, per-chunk zstd compression, deduplication, and a forward-compatible extension directory used by the v4 error-correction layer. It ships as the **`Archive`** security tier in the vault-create dialog (the simpler Standard, Advanced and Paranoid tiers stay on v2), after its public spec review pass in the [#276 design thread](https://github.com/axpdev-lab/aeroftp/discussions/276). v2 remains the default for the other tiers and there is no automatic v2 → v3 migration.

The canonical reference is the in-repo specification at [`docs/AEROVAULT-V3-SPEC.md`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/AEROVAULT-V3-SPEC.md).

### Pipeline order

The v3 write pipeline is **chunk-first**, not compress-first:

```text
plaintext
  -> content-defined chunking (Gear-CDC)
       -> keyed BLAKE3 chunk id (dedup key)
  -> zstd compress each chunk independently
  -> AES-256-GCM-SIV encrypt each compressed chunk
  -> BLAKE3-256 over the ciphertext (pre-decryption integrity)
  -> manifest + block table
  -> optional extension blocks (reserved for v4 ECC)
```

Chunking must precede compression: running a single zstd stream over the whole plaintext destroys content-defined chunk boundaries because a byte shift in the source cascades through the compressed output and relocates every boundary the chunker would have found. That defeats deduplication, defeats resume, and breaks the chunk-range semantics that AeroSync depends on. Per-chunk zstd also keeps random access cheap because a reader can decompress one logical block without inflating the rest of the vault.

### Wrapper identifiers

Every wrapper layer carries both an algorithm id and an algorithm version. Readers dispatch on these fields, not on the container version alone, which is what lets v4 add ECC blocks as a non-critical extension without breaking v3 readers.

| Wrapper | v3 default | Version | Notes |
| ------- | ---------- | ------- | ----- |
| `packing` | `small-file-batching` | 1 | Logical packing of small files |
| `chunking` | `gear-cdc` | 1 | 256 KiB min / 1 MiB avg / 4 MiB max, table seeded from `blake3(b"AeroVault v3 gear-cdc table")` |
| `chunk_id` | `blake3-keyed-128` | 1 | 32-byte keyed BLAKE3 truncated to 16 bytes, doubles as dedup key |
| `compression` | `zstd` | 1 | Per chunk, profile-selected level: `fast=3`, `balanced=9` (default), `archive=19` |
| `crypt` | `aes-256-gcm-siv` | 1 | RFC 8452, 96-bit random nonce per chunk, AAD bound to block index + chunk id |
| `cipher_hash` | `blake3-256` | 1 | Stored per block, verified before decryption (also the hook point for v4 ECC scrub) |
| `ecc` | absent in v3, `reed-solomon` in v4 | 2 | Non-critical extension; v4 fills the slot v3 reserves |

### Key schedule

The password unlocks two independent working keys, not one shared key reused across roles:

1. Argon2id with `m = 128 MiB, t = 4, p = 4` derives the root key material from the password and the per-vault salt.
2. HKDF expands that material into two distinct key-encryption keys (KEKs): one for content encryption, one for the header MAC.
3. Each KEK unwraps an independent random 256-bit working key via AES-KW (RFC 3394).

Storing two wrapped keys means content encryption and header integrity never share a key, so a compromise of one role does not propagate to the other.

### Header and tamper detection

The 1024-byte fixed header carries an HMAC-SHA512 tag at a fixed offset. `verify_mac()` runs before `unwrap_key()`: if any header byte has been tampered with, the reader stops before Argon2id even runs. This closes the budget-burning attack where an adversary modifies a header on cold media to force a victim's machine through a multi-hundred-MiB KDF on every open attempt.

The header also reserves an extension directory and an extension payload region. v3 writers emit an empty extensions array; v3 readers reject unknown extensions only when they are marked `critical = true` and silently skip non-critical ones. That structural contract is what lets v4 ship as "v3 plus ECC blocks in the extension area" with no header or manifest layout change.

### Manifest

The manifest is encrypted with the same cipher as the chunks but with a distinct AAD, and contains:

- the chunk table (offsets, sizes, cipher hashes, dedup-keyed chunk ids),
- the entry list (directory tree, filenames, per-entry chunk ranges),
- a `wrappers` block that records every algorithm id and version so a future reader picks the right primitives without hard-coding them.

### DoS defenses

A handful of size caps prevent the simplest resource-exhaustion shapes against a v3 reader:

| Cap | Limit |
| --- | ----- |
| Manifest size | 128 MiB |
| Extension directory | 16 MiB |
| Per-block size | 64 MiB |
| Directory walk on `vault_v3_add_directory` | 500 000 entries |
| Offset arithmetic | `checked_add` (refuses vaults with corrupted overflowing offsets) |

These do not replace a hardened deserializer, but they make the easy "give the reader a 10 GB manifest and watch it OOM" pattern not work.

### Error correction (v4, shipped)

v4 is intentionally shaped as "v3 plus ECC". The cipher chain (chunk → compress → encrypt) and the chunk hash trail (keyed BLAKE3-128 for dedup, BLAKE3-256 for pre-decryption integrity) do not change for v4. The error-correction wrapper ships as:

1. **Reed-Solomon parity**, carried as a non-critical extension. No refactor of v3 primitives, so a v3-only reader skips it and still opens the container.
2. **A detached, content-addressed `.aerocorrect` sidecar** as the default placement (`embedded` and `both` are also available), shared byte-for-byte with the standalone `aerovault` crate and with AeroSync. The sidecar binds to the SHA-256 of the protected content and its v2 framing is self-healing.
3. **The scrub path**: on open, walk the manifest, recompute the per-block cipher hash, identify damaged blocks, pull recovery data from the parity source, repair, and re-verify. The cipher hash is stored per block precisely so damaged ciphertext can be detected before decryption.
4. **Fail-closed, all-or-nothing repair**: every reconstructed region is re-verified against the container's authenticated values (header MAC and manifest `cipher_hash`) before the vault is re-sealed, so a foreign or corrupt sidecar can only make a repair fail, never overwrite good data. A dedicated repair dialog surfaces damaged-block, recovered, and lost counts rather than silently fixing.

The operational surface is `vault scrub` / `vault repair` / `vault export-parity` / `vault strip-parity` plus the standalone `aeroftp correct gen|verify|repair`. See [Error Correction (`.aerocorrect`)](/security/error-correction) for the full guide.

### AEAD primitive selection

AeroVault v3 uses AES-256-GCM-SIV by default. The wrapper stack is designed so the AEAD primitive is selectable per profile, not hard-coded into the format: XChaCha20-Poly1305 is the planned alternative for environments where AES-NI is not available (low-end mobile ARM SoCs, secure elements with ARX-only coprocessors). Switching primitive does not require a format fork because the `crypt` wrapper id and version are stored in the manifest and dispatched on by readers.

### Tauri command surface

Fifteen Tauri commands cover the v3 lifecycle and are exposed via the `Archive` tier: `vault_v3_create`, `vault_v3_open`, `vault_v3_add_files`, `vault_v3_add_files_to_dir`, `vault_v3_create_directory`, `vault_v3_extract_entry`, `vault_v3_delete_entry`, `vault_v3_delete_entries`, `vault_v3_move_entry`, `vault_v3_rename_entry`, `vault_v3_copy_entry`, `vault_v3_change_password`, `vault_v3_add_directory`, `vault_v3_security_info`, `is_vault_v3`.

## AeroVault container vs AeroCrypt overlay

AeroVault and AeroCrypt are two different shapes for two different needs, and the choice between them depends on whether you want a sealed object or an ongoing transformation. They are not the same thing: AeroVault is a container, AeroCrypt is a per-file overlay. See [AeroCrypt Overlay](/features/aerocrypt) for the full overlay guide.

| Property | AeroVault (`.aerovault`) | AeroCrypt overlay |
| -------- | ------------------------ | ----------------- |
| Shape | Single sealed file, OS-integrated MIME type, double-clickable | Per-file overlay on top of any provider profile |
| Granularity | Whole-container operation, manifest indexes all entries | Per-file: each remote object is independently encrypted |
| Best for | Sharing several files as one bundle (email, instant messenger, USB stick, cold-storage snapshot) | Ongoing folder mirror on a provider you do not trust at rest |
| Visibility | Browseable in AeroFTP and (for v3) addressable through the vault commands | Browsed like a normal server in the dual panel once unlocked; encrypted blobs if you open the underlying provider panel directly |
| Single-file aspect | Yes (the load-bearing feature) | No |
| Format owner | AeroFTP (v2 and v3 specs) | AeroFTP (`AECR` format: per-file AES-256-GCM-SIV under a random DEK wrapped with AES-256-KW, AES-256-SIV filenames, `.aeroftp-crypt.json` config with a key-bound MAC) |

The mental model: if the question is "send a sealed bundle to one person" or "shelve a snapshot on portable media", that is AeroVault. If the question is "keep this folder continuously mirrored on kDrive but the server must never see plaintext", that is the AeroCrypt overlay. The two coexist on purpose. There is no default cipher: you actively pick AeroCrypt (native) or [Rclone Crypt](/features/rclone-crypt) (interop).

Cipher-strength badges in the connection UI follow this distinction: `E2E 128-bit` / `E2E 256-bit` for providers whose vendor performs client-side end-to-end encryption (MEGA, Filen, Internxt), and a plain `128-bit` / `256-bit` (no `E2E` prefix) for AeroCrypt overlaid on a server-side-encrypted backend, because the server holds no key but the cipher is ours, not the vendor's.

## rclone crypt interoperability

AeroFTP also includes a compatibility layer for existing `rclone crypt` remotes.

- Full read/write: browse and decrypt existing data, and re-encrypt on upload, so files written by AeroFTP open cleanly in the rclone CLI
- Crypto runs locally in the Rust backend
- This is documented separately from AeroVault because AeroFTP does not own the `rclone crypt` format

For product-level guidance and current limitations, see [rclone crypt interoperability](/features/rclone-crypt).

## Archive Encryption

AeroFTP supports creating and extracting password-protected archives:

| Format | Encryption Algorithm | Key Derivation | Notes |
| ------ | -------------------- | -------------- | ----- |
| ZIP | AES-256 (WinZip AE-2) | PBKDF2-SHA1 | Industry-standard, wide compatibility |
| 7z | AES-256-CBC | SHA-256 based (2^19 rounds) | Strong encryption, 7-Zip compatible |
| RAR | AES-256-CBC | PBKDF2-HMAC-SHA256 | Extract-only, no creation, because the RAR format is proprietary |

RAR is the one archive format AeroFTP cannot create: its format is proprietary and only the closed WinRAR/`rar` tool can write .rar, so AeroFTP is limited to reading and decrypting existing RAR archives. See the [format openness snapshot](/features/archives) on the Archives page for how each format compares.

Archive passwords are zeroized in memory immediately after use via the `secrecy` crate's `SecretString` type. The password is unwrapped only at the point of use (passing to the compression library) and automatically zeroed when the `SecretString` is dropped.

## Credential Storage

All credentials are stored in `vault.db`, an encrypted SQLite database:

| Component | Algorithm | Detail |
| --------- | --------- | ------ |
| Encryption | AES-256-GCM | Per-entry encryption with random 96-bit nonce |
| Key derivation | HKDF-SHA256 | Derives per-purpose keys from master key |
| Master password KDF | Argon2id | 128 MiB, t=4, p=4 (same as AeroVault) |
| Database mode | SQLite WAL | Concurrent reads without corruption |
| Passphrase entropy | 512-bit CSPRNG | Auto-generated if no master password set |

See [Credential Management](credentials.md) for the full credential lifecycle, import/export, and migration details.

## Transport Security

Every protocol uses transport-layer encryption where available:

| Protocol | Encryption | Key Exchange | Authentication |
| -------- | ---------- | ------------ | -------------- |
| SFTP | SSH (AES-256-GCM, ChaCha20-Poly1305) | Diffie-Hellman, ECDH | Ed25519, RSA, ECDSA keys |
| FTPS | TLS 1.2/1.3 (explicit or implicit) | ECDHE | Certificate-based |
| WebDAV | TLS 1.2/1.3 (HTTPS) | ECDHE | Certificate-based |
| S3 | TLS 1.2/1.3 (HTTPS) | ECDHE | HMAC-SHA256 (SigV4) |
| Google Drive | TLS 1.2/1.3 (HTTPS) | ECDHE | OAuth2 Bearer token |
| Dropbox | TLS 1.2/1.3 (HTTPS) | ECDHE | OAuth2 Bearer token |
| OneDrive | TLS 1.2/1.3 (HTTPS) | ECDHE | OAuth2 Bearer token |
| MEGA | TLS 1.2/1.3 + client-side E2E | ECDHE + RSA | Password-derived key |
| Internxt | TLS 1.2/1.3 + client-side E2E | ECDHE | OAuth2 + zero-knowledge |
| Filen | TLS 1.2/1.3 + client-side E2E | ECDHE | Password + optional 2FA |
| Plain FTP | None (cleartext) | None | Plaintext password |

### SFTP Host Key Verification (TOFU)

For SFTP connections, AeroFTP implements Trust On First Use (TOFU) host key verification. On the first connection to a new server, a PuTTY-style dialog displays the SHA-256 fingerprint of the server's host key. The user must explicitly accept the key before the connection proceeds. Subsequent connections verify the stored fingerprint and warn if the key has changed (potential MITM attack).

### FTP TLS Downgrade Detection

When connecting via FTP with `ExplicitIfAvailable` TLS mode, AeroFTP attempts a TLS upgrade. If the upgrade fails (server does not support STARTTLS), the connection falls back to plaintext FTP. In this case, a `tls_downgraded` flag is set internally and a security warning is logged. The UI displays a TLS badge that dynamically hides when encryption is set to "none".

> **Warning:** Plain FTP transmits credentials and data in cleartext. Always prefer SFTP or FTPS when available.

## OAuth Token Protection

OAuth access tokens and refresh tokens for all cloud providers are protected with multiple layers:

1. **SecretString wrapping**: All token values are wrapped in Rust's `secrecy::SecretString` across every provider implementation. This prevents tokens from appearing in debug output, logs, or error messages.

2. **Vault storage**: Tokens are stored encrypted in `vault.db` (AES-256-GCM) at rest.

3. **In-memory fallback**: If the vault is locked or unavailable, tokens are held in an in-memory `Mutex` for the session duration. They are never written to disk unencrypted.

4. **Unwrap-at-use**: Tokens are only exposed (via `.expose_secret()`) at the exact point where they are inserted into HTTP request headers.

5. **Error sanitization**: The `sanitize_error_message()` function uses 5 compiled regex patterns to strip API keys (Anthropic `sk-ant-*`, OpenAI `sk-*`), Bearer tokens, and `x-api-key` values from any error message before it reaches logs or the UI.

## Memory Zeroization

AeroFTP uses the `secrecy` crate for zero-on-drop semantics on all sensitive values:

- **Passwords**: Master password, archive passwords, server passwords
- **OAuth tokens**: Access tokens, refresh tokens
- **API keys**: AI provider keys (OpenAI, Anthropic, etc.)
- **Cryptographic keys**: AES keys, HMAC keys, derived keys
- **TOTP secrets**: 2FA secret bytes (see [TOTP 2FA](totp.md))

When a `SecretString` or `Secret<Vec<u8>>` is dropped, the underlying memory is overwritten with zeros before deallocation. This prevents sensitive data from lingering in freed memory where it could be recovered by memory forensics tools.
