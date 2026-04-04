# AeroVault

AeroVault is AeroFTP's encrypted container system. It creates portable `.aerovault` files that can store any number of files and directories under strong authenticated encryption. AeroVault v2 provides military-grade cryptography with seven distinct layers, surpassing Cryptomator in key derivation strength, nonce-misuse resistance, and optional cascade encryption.

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
<!-- SCREENSHOT: Create vault dialog showing the vault name field, password input with strength indicator, optional cascade mode toggle, and optional TOTP 2FA checkbox -->

1. **Choose a save location** — select where the `.aerovault` file will be stored using the native file dialog.
2. **Set a master password** — this password is the sole key to your vault. AeroVault derives the encryption key using Argon2id with parameters that exceed OWASP 2024 recommendations (128 MiB memory, 4 iterations, 4 parallel lanes).
3. **Enable cascade mode** (optional) — adds a second encryption layer using ChaCha20-Poly1305 on top of AES-256-GCM-SIV. This provides defense-in-depth: even if one algorithm is compromised, the other still protects your data.
4. **Enable TOTP 2FA** (optional) — require a 6-digit time-based one-time password in addition to the master password every time the vault is opened. See [TOTP 2FA](../security/totp.md) for setup instructions.

After creation, the vault opens immediately and you can begin adding files.

## Opening a Vault

Click **Open Vault** or select a recent vault to enter the password prompt.

![Vault open dialog with security badges](/images/aerovault-open.png)
<!-- SCREENSHOT: Vault password entry screen showing the password field, TOTP field (if enabled), and security badges for AES-256-GCM-SIV, Argon2id, AES-KW, and HMAC-SHA512 -->

The open screen displays security badges confirming the cryptographic algorithms protecting the vault:

- **AES-256-GCM-SIV** — content encryption (nonce-misuse resistant, RFC 8452)
- **Argon2id** — key derivation (128 MiB / t=4 / p=4)
- **AES-256-KW** — key wrapping (RFC 3394)
- **HMAC-SHA512** — header integrity verification

If TOTP 2FA is enabled, a second field appears for the 6-digit code. Rate limiting with exponential backoff protects against brute-force attempts (5 attempts before lockout, escalating from 30 seconds to 15 minutes).

## Browsing a Vault

Once unlocked, the vault browser presents the contents in a familiar file-list interface.

![Vault browser with files and folders](/images/aerovault-browse.png)
<!-- SCREENSHOT: Vault browser showing a list of encrypted files and folders with names, sizes, and dates, plus toolbar buttons for Add Files, Create Folder, Extract, and Delete -->

### Available Operations

- **Add files** — drag files into the vault browser or click the Add button to select files via the native dialog. Files are encrypted and added immediately.
- **Add files to subdirectory** — navigate to a folder within the vault and add files directly into it.
- **Create directories** — organize vault contents into a hierarchical folder structure with breadcrumb navigation. Intermediate directories are created automatically.
- **Extract individual files** — select one or more files and extract them to a local directory. Decryption happens on-the-fly.
- **Extract all** — decrypt and extract the entire vault contents at once.
- **Delete entries** — remove files or entire directory trees from the vault (recursive deletion supported).
- **Change password** — re-encrypt the vault with a new master password without extracting and re-adding files.

### Vault Inspection

The `vault_peek` command (also available as an AeroAgent tool) inspects a vault header without requiring the password, revealing the vault version, encryption parameters, and file count.

## Remote Vault Support

AeroVault can open `.aerovault` files stored on remote servers across any of AeroFTP's 22 supported protocols.

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

> **Recommendation:** AeroVault v2 is recommended for new vaults. It provides stronger key derivation (Argon2id vs. scrypt), nonce-misuse resistance (GCM-SIV vs. GCM), optional cascade encryption, and TOTP 2FA support.

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
| TOTP 2FA | Yes | Not available |
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

- **Header** (512 bytes) — contains the vault version, Argon2id salt, wrapped key material, and HMAC-SHA512 integrity tag
- **Manifest** — an AES-256-SIV encrypted index of all files and directories with their encrypted filenames, sizes, and offsets
- **Data** — file contents encrypted in 64 KB chunks using AES-256-GCM-SIV (and optionally ChaCha20-Poly1305 in cascade mode)

AeroVault files are registered as a MIME type on all platforms with dedicated icons in 8 PNG sizes (16 px to 512 px), SVG, ICO, and ICNS. Double-clicking a `.aerovault` file opens it directly in AeroFTP via the deep-link handler, with single-instance argv forwarding for already-running instances.

## Standalone Crate

The AeroVault v2 encryption engine is published as a standalone Rust crate on [crates.io](https://crates.io/crates/aerovault), available for use in any Rust project. A companion CLI (`aerovault-cli`) provides 8 commands for creating, listing, adding, extracting, and managing vaults from the terminal.

For Rust API documentation, code examples, and integration guides, see the [AeroVault Crate Reference](/advanced/aerovault-crate.html).
