---
description: "Portable encrypted containers that hold any number of files and folders under authenticated encryption."
---

# AeroVault

AeroVault is AeroFTP's encrypted container system. It creates portable `.aerovault` files that can store any number of files and directories under strong authenticated encryption. Supported AeroVault formats use authenticated encryption and password-based key derivation. Available features depend on the selected format, including optional cascade encryption and error correction; see the [encryption guide](/security/encryption) for the format boundaries.

## Home Screen

When you open AeroVault from the titlebar icon or the View menu, the home screen presents three options: create a new vault, open an existing vault, or reopen a recent vault.

![AeroVault home screen with recent vaults](/images/aerovault-home.png)
<!-- SCREENSHOT: AeroVault home screen showing "Create New Vault" and "Open Vault" buttons, plus the recent vaults list with security badges and last-opened timestamps -->

### Recent Vaults

AeroVault tracks recently opened vaults in a SQLite WAL-backed database. Each entry displays:

- The vault filename and full path
- Security badges showing the encryption algorithms used
- The last-opened timestamp
- A one-click button to reopen the vault directly

Recent vaults are sorted by last access time, making it easy to return to frequently used containers.

## Creating a Vault

Click **Create New Vault** to begin the vault creation workflow.

![Create vault dialog](/images/aerovault-create.png)
<!-- SCREENSHOT: Create vault dialog showing the vault name field, password input with strength indicator, and optional cascade mode controls (historical illustration; current controls depend on the selected format) -->

1. **Choose a save location** - select where the `.aerovault` file will be stored using the native file dialog.
2. **Set a container password** - this file password is separate from the application's credential-vault master password. AeroVault derives the encryption key using Argon2id with parameters that exceed OWASP 2024 recommendations (128 MiB memory, 4 iterations, 4 parallel lanes).
3. **Choose a security level** - the Paranoid v2 tier adds ChaCha20-Poly1305 over AES-256-GCM-SIV; available controls depend on the selected format.

The v4.2.5 container workflow does not offer a TOTP checkbox or a second-factor code on open. [Desktop TOTP](/security/totp#aerovault-containers-are-separate) protects the separate credential vault; it does not change an AeroVault file's password-based protection.

After creation, the vault opens immediately and you can begin adding files.

## Opening a Vault

Click **Open Vault** or select a recent vault to enter the password prompt.

![Vault open dialog with security badges](/images/aerovault-open.png)
<!-- SCREENSHOT: Historical vault illustration showing the password field and security badges for AES-256-GCM-SIV, Argon2id, AES-KW, and HMAC-SHA512 -->

The open screen displays security badges confirming the cryptographic algorithms protecting the vault:

- **AES-256-GCM-SIV** - content encryption (nonce-misuse resistant, RFC 8452)
- **Argon2id** - key derivation (128 MiB / t=4 / p=4)
- **AES-256-KW** - key wrapping (RFC 3394)
- **HMAC-SHA512** - header integrity verification

Enter the container's file password to open it. Credential-vault TOTP, its replay protection and its throttling do not apply to this portable container password.

## Browsing a Vault

Once unlocked, the vault browser presents the contents in a familiar file-list interface.

![Vault browser with files and folders](/images/aerovault-browse.png)
<!-- SCREENSHOT: Vault browser showing a list of encrypted files and folders with names, sizes, and dates, plus toolbar buttons for Add Files, Create Folder, Extract, and Delete -->

### Available Operations

- **Add files** - drag files into the vault browser or click the Add button to select files via the native dialog. Files are encrypted and added immediately.
- **Add files to subdirectory** - navigate to a folder within the vault and add files directly into it.
- **Create directories** - organize vault contents into a hierarchical folder structure with breadcrumb navigation. Intermediate directories are created automatically.
- **Extract individual files** - select one or more files and extract them to a local directory. Decryption happens on-the-fly.
- **Extract all** - decrypt and extract the entire vault contents at once.
- **Delete entries** - remove files or entire directory trees from the vault (recursive deletion supported).
- **Change password** - re-encrypt the vault with a new master password without extracting and re-adding files.

### Vault Inspection

The `vault_peek` command (also available as an AeroAgent tool) inspects a vault header without requiring the password, revealing the vault version, encryption parameters, and file count.

## Changing Mode

**Change Mode** rebuilds an existing vault under a different supported format or security level while keeping its password. It is available beside Change Password in an open vault and through `aeroftp-cli vault change-mode`.

The operation extracts the full plaintext tree into a `.aerovault-repack-*` temporary directory beside the vault, then builds the replacement container. Allow free space for both the plaintext tree and the rebuilt container alongside the original. Normal cleanup removes the temporary directory, but an abrupt interruption can leave plaintext behind. Use a suitable filesystem and check for leftovers after an interrupted operation.

Replacement uses two renames rather than an atomic swap. If the process stops after moving the original to `.<vault-name>.repack-bak-<pid>` but before installing the rebuilt container, restore the original from that backup. A reported failure of the second rename attempts restoration automatically.

Recovery protection must be selected again for the rebuilt file. Converting v3 to v2 drops embedded parity. Every successful repack attempts to remove the old default `<vault>.aerocorrect` sidecar because its bytes no longer match; deletion is best effort, and any leftover old sidecar is stale. CLI `vault change-mode` defaults `--error-correction` to false. For an Archive/v3 target, enable Error Correction in the GUI or pass `--security-level archive --error-correction` in the CLI to build new embedded parity. This EC-enabled wrapper-stack configuration is called v4 in the recovery guide; the container still uses `AEROVAULT3` magic and internal version 3. Change Mode explicitly selects embedded placement; it does not inherit a detached-sidecar default. For a v2 target, generate a fresh standalone sidecar with `aeroftp-cli correct gen` after conversion. Keep a separate verified backup before converting and verify the new recovery data afterward.

## Remote Vault Support

AeroVault can open `.aerovault` files stored on remote servers across any of AeroFTP's 7 transport protocols and 20+ native provider integrations.

The workflow is:

1. Right-click a `.aerovault` file on a remote server and select **Open AeroVault**.
2. AeroFTP downloads the vault to a temporary local location.
3. Enter the master password to unlock and browse the vault contents.
4. Make changes (add, extract, delete files) as needed.
5. Click **Save & Close** to re-encrypt and upload the modified vault back to the remote server.

Security validations run before any operation: null byte rejection, path traversal prevention, symlink resolution, and `canonicalize()` verification. On Unix systems, the temporary file is created with `0o600` permissions (owner read/write only).

## Folder Encryption

Right-click any local directory and select **Encrypt as AeroVault** to create a vault containing the entire directory tree.

AeroFTP performs a recursive `walkdir` scan of the directory, showing a progress indicator as it encrypts each file. The resulting `.aerovault` file is saved alongside the original directory (or at a location you choose). This is useful for encrypting project folders, document archives, or any directory structure you want to protect.

## Cryptomator Compatibility

AeroFTP supports creating and browsing Cryptomator vault format 8 containers. Create new vaults or open existing ones through the right-click context menu.

Cryptomator vaults use a different cryptographic stack:

- **scrypt** for key derivation
- **AES-256-KW** for key wrapping
- **AES-256-SIV** for filename encryption
- **AES-256-GCM** for content encryption

> **Recommendation:** AeroVault v2 is recommended for new vaults. It provides stronger key derivation (Argon2id vs. scrypt), nonce-misuse resistance (GCM-SIV vs. GCM), and optional cascade encryption. The separate credential-vault TOTP feature is not part of the container format.

## Encryption Architecture

AeroVault v2 uses a seven-layer cryptographic design. Each layer addresses a specific threat:

| Layer | Algorithm | Standard | Purpose |
| ----- | --------- | -------- | ------- |
| Key derivation | **Argon2id** (128 MiB, t=4, p=4) | RFC 9106 | Derives master key from password; resists GPU brute-force |
| Key wrapping | **AES-256-KW** | RFC 3394 | Protects the content encryption key (CEK) |
| Content encryption | **AES-256-GCM-SIV** | RFC 8452 | Nonce-misuse-resistant authenticated encryption |
| Filename encryption | **AES-256-SIV** | RFC 5297 | Deterministic encryption of filenames in the manifest |
| Header integrity | **HMAC-SHA512** | RFC 2104 | Tamper detection on the 512-byte vault header |
| Cascade (optional) | **ChaCha20-Poly1305** | RFC 8439 | Defense-in-depth second encryption pass |
| Chunk streaming | 64 KB chunks | -- | Optimal balance of security overhead and I/O performance |

### Argon2id Parameters

The Argon2id configuration uses 128 MiB of memory, 4 time iterations, and 4 parallel lanes. This exceeds the OWASP 2024 minimum recommendation of 19 MiB / t=2, providing significantly stronger resistance against GPU-based and ASIC-based brute-force attacks.

## Comparison with Cryptomator

| Feature | AeroVault v2 | Cryptomator v8 |
| ------- | ------------ | -------------- |
| Key derivation | Argon2id (128 MiB) | scrypt |
| Content encryption | AES-256-GCM-SIV (nonce-misuse resistant) | AES-256-GCM |
| Cascade encryption | ChaCha20-Poly1305 (optional) | Not available |
| Container TOTP factor in AeroFTP v4.2.5 | Not available | Not available |
| Header integrity | HMAC-SHA512 | Not available |
| Chunk size | 64 KB | 32 KB |
| Container format | Single `.aerovault` file | Directory tree |
| Portability | Single file, any filesystem | Requires directory structure |
| Remote support | Open/edit on remote servers | Local only |
| Platform icons | Linux, Windows, macOS MIME registration | Not applicable |

## File Format

The `.aerovault` binary format consists of three sections:

```
[512-byte header] [AES-SIV encrypted manifest] [AES-256-GCM-SIV chunked data...]
```

- **Header** (512 bytes) - contains the vault version, Argon2id salt, wrapped key material, and HMAC-SHA512 integrity tag
- **Manifest** - an AES-256-SIV encrypted index of all files and directories with their encrypted filenames, sizes, and offsets
- **Data** - file contents encrypted in 64 KB chunks using AES-256-GCM-SIV (and optionally ChaCha20-Poly1305 in cascade mode)

AeroVault files are registered as a MIME type on all platforms with dedicated icons in 8 PNG sizes (16 px to 512 px), SVG, ICO, and ICNS. Double-clicking a `.aerovault` file opens it directly in AeroFTP via the deep-link handler, with single-instance argv forwarding for already-running instances.

## AeroVault format v3 and v4 (Error Correction)

AeroVault v2 (described above) is the stable default. Two newer formats extend it without breaking it.

**v3 (the `Archive` tier)** is the first wrapper-stack vault. It keeps the single-file `.aerovault` portability of v2 while adding content-defined chunking (Gear-CDC), per-chunk zstd compression, deduplication, and a forward-compatible extension directory. The write pipeline is chunk-first: chunk → keyed-BLAKE3 chunk id → zstd → AES-256-GCM-SIV → BLAKE3-256 cipher hash. It ships as the `Archive` security tier in the vault-create dialog; the simpler Standard, Advanced and Paranoid tiers stay on v2, and there is no automatic migration.

**v4 = v3 + Error Correction.** v4 adds a fourth wrapper, Reed-Solomon parity, as a non-critical extension, so `v3 + error correction = v4` and a v3-only reader skips the parity it does not understand and still opens the container.

### Error Correction

Error correction repairs bit rot in a sealed vault before decryption: on USB sticks, consumer NAS disks, optical media, and cold-storage archives, a single bad sector is the difference between an encrypted backup surviving and being gone. It does not change confidentiality; AES-256-GCM-SIV remains the sole authority on tampering, and redundancy is strictly for recovery.

- **Placement depends on the operation.** GUI creation and CLI `vault create --error-correction` default to embedded parity; Change Mode explicitly uses embedded parity for an EC-enabled Archive target. CLI creation can choose `--recovery-placement detached` for a sibling `.aerocorrect` file or `both` for embedded parity plus a sidecar. A detached sidecar leaves the container byte-identical to its unmodified v3 file.
- **Content-addressed.** The sidecar binds to the SHA-256 of the protected content, not a path or salt, so it follows the file when you move, rename, or copy it. The same format protects ordinary files and synced backups, not just vaults.
- **Self-healing.** The v2 sidecar framing stores its locator metadata in triplicate with per-copy checksums, so a lightly-corrupted recovery file still works.
- **Fail-closed repair.** Rebuilt bytes are re-verified against the bound content hash and the vault's authenticated header MAC and manifest cipher hash before the original is replaced, so a corrupt or foreign sidecar can only make a repair fail, never overwrite good data.

Create an Error Correction vault with `vault create --error-correction --recovery-level medium`, verify it with `vault scrub`, repair it with `vault repair`, and add or refresh a sidecar for an existing vault with `vault export-parity`. For the full operational guide, overhead levels, and the security model, see [Error Correction (`.aerocorrect`)](../security/error-correction.md) and the [Wrapper Stack](../security/wrapper-stack.md).

## Standalone Crate

Two distinct surfaces share the AeroVault name, and it is worth being clear about which is which:

- **In the app and the CLI.** The AeroVault that ships inside AeroFTP uses the newer container format (v3, and v4 with error correction) and is exposed as a first-class CLI subcommand: `aeroftp vault ...` (equivalently `aftp vault ...`, or `aero vault ...` if you enable the opt-in alias). It is reached through the same single entry point as every other command, so there is no separate `avault` binary to install or remember.
- **The standalone crate.** The `aerovault` crate on [crates.io](https://crates.io/crates/aerovault) is the reusable encryption library, with a companion CLI (`aerovault-cli`) exposing 11 commands for creating, listing, adding, extracting, moving, renaming, copying, and managing vaults from the terminal or any Rust project.

For Rust API documentation, code examples, and integration guides, see the [AeroVault Crate Reference](/advanced/aerovault-crate.html).
