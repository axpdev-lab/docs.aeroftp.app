# AeroVault Crate

AeroVault is a standalone Rust crate for creating and managing encrypted vault containers. It uses the `.aerovault` file format with defense-in-depth cryptography.

## Links

- **crates.io**: [aerovault](https://crates.io/crates/aerovault)
- **docs.rs**: [aerovault](https://docs.rs/aerovault)
- **Source**: [github.com/axpnet/aerovault](https://github.com/axpnet/aerovault)
- **License**: GPL-3.0

## Installation

### As a library

```toml
[dependencies]
aerovault = "0.5.0"
```

Or via cargo:

```bash
cargo add aerovault
```

### As a CLI tool

```bash
cargo install aerovault-cli
```

The CLI provides commands for creating, opening, listing, adding, extracting, moving, renaming, copying, and managing vault files from the terminal. Since 0.5.0 it also exposes the `correct` subcommand for generating, verifying, and repairing detached `.aerocorrect` recovery sidecars:

```bash
# Generate a detached recovery sidecar for any file (writes <file>.aerocorrect)
aerovault correct gen my-vault.aerovault --ec medium

# Verify without modifying the file
aerovault correct verify my-vault.aerovault

# Repair in place from my-vault.aerovault.aerocorrect
aerovault correct repair my-vault.aerovault
```

## Cryptographic Features

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Content encryption | AES-256-GCM-SIV (RFC 8452) | Nonce misuse-resistant authenticated encryption |
| KDF | Argon2id (128 MiB / t=4 / p=4) | Password-based key derivation (exceeds OWASP 2024) |
| Key wrapping | AES-256-KW (RFC 3394) | Master key protection |
| Filename encryption | AES-256-SIV | Deterministic filename encryption |
| Header integrity | HMAC-SHA512 | Tamper detection on vault header |
| Cascade mode | ChaCha20-Poly1305 | Optional second encryption layer for defense-in-depth |
| Error correction | Reed-Solomon parity sidecar (`.aerocorrect` v2) | Detached, content-addressed, self-healing recovery from bit rot |

Data is encrypted in 64 KB chunks for an optimal balance between security and performance.

::: tip Container format
Since 0.4.0 the crate writes the **v3** container, which binds a per-file 16-byte `file_id` into the chunk AAD to prevent chunk splicing and reordering. Existing **v2** containers stay fully supported (read, write, and in-place re-encrypt); the cryptographic stack above is shared by both.
:::

## Encryption Modes

```rust
pub enum EncryptionMode {
    AesGcmSiv,    // Default - AES-256-GCM-SIV only
    Cascade,      // AES-256-GCM-SIV + ChaCha20-Poly1305
}
```

In **Cascade** mode, each chunk is encrypted first with AES-256-GCM-SIV, then with ChaCha20-Poly1305. This provides defense-in-depth: if one cipher is compromised, the data remains protected by the other.

## Usage Example

### Creating a vault and adding files

```rust
use aerovault::{Vault, CreateOptions, EncryptionMode};

// Create a new vault
let opts = CreateOptions::new("secrets.aerovault", "my-strong-password")
    .with_mode(EncryptionMode::AesGcmSiv);

let vault = Vault::create(opts)?;

// Add files
vault.add_files(&["document.pdf", "photo.jpg"])?;

// Add files into a subdirectory
vault.create_directory("reports")?;
vault.add_files_to_dir(&["quarterly.xlsx"], "reports")?;

// List contents
for entry in vault.list()? {
    println!("{} ({} bytes, dir={})", entry.name, entry.size, entry.is_dir);
}
```

### Opening and extracting

```rust
use aerovault::Vault;

// Open an existing vault
let vault = Vault::open("secrets.aerovault", "my-strong-password")?;

// Extract a single file
let output_path = vault.extract("document.pdf", "./output/")?;
println!("Extracted to: {}", output_path.display());

// Extract everything
let count = vault.extract_all("./output/")?;
println!("Extracted {} files", count);
```

### Inspecting without decrypting

```rust
use aerovault::Vault;

// Check if a file is an AeroVault container
if Vault::is_vault("secrets.aerovault") {
    // Peek at metadata without the password
    let info = Vault::peek("secrets.aerovault")?;
    println!("Version: {}", info.version);
    println!("Encryption: {:?}", info.mode);
    println!("Created: {}", info.created_at);
}
```

### Managing entries

```rust
use aerovault::Vault;

let vault = Vault::open("secrets.aerovault", "my-strong-password")?;

// Delete a single entry
vault.delete_entry("old-file.txt")?;

// Delete multiple entries (recursive for directories)
vault.delete_entries(&["reports", "temp.log"], true)?;

// Move entry path (file or directory)
vault.move_entry("reports/q1.xlsx", "archive/2026/q1.xlsx")?;

// Rename entry in-place (same parent)
vault.rename_entry("archive/2026/q1.xlsx", "q1-final.xlsx")?;

// Copy file or directory recursively
vault.copy_entry("archive/2026", "backup/2026")?;

// Change the password
vault.change_password("my-strong-password", "new-password")?;

// Compact to reclaim space from deleted entries
let result = vault.compact()?;
println!("Reclaimed {} bytes", result.bytes_reclaimed);
```

### Security info

```rust
use aerovault::Vault;

let vault = Vault::open("secrets.aerovault", "password")?;
let info = vault.security_info();

println!("Mode: {:?}", info.mode);
println!("Chunk size: {} bytes", info.chunk_size);
println!("KDF: {}", info.kdf);         // "Argon2id"
println!("MAC: {}", info.mac);         // "HMAC-SHA512"
```

## API Reference

### `Vault` methods

| Method | Description |
|--------|-------------|
| `Vault::create(opts)` | Create a new empty vault |
| `Vault::open(path, password)` | Open an existing vault |
| `Vault::is_vault(path)` | Check if file is a valid vault |
| `Vault::peek(path)` | Read metadata without password |
| `vault.list()` | List all entries |
| `vault.add_files(paths)` | Add files to root |
| `vault.add_files_to_dir(paths, dir)` | Add files to a subdirectory |
| `vault.create_directory(name)` | Create a directory entry |
| `vault.extract(name, output_dir)` | Extract a single entry |
| `vault.extract_all(output_dir)` | Extract all entries |
| `vault.delete_entry(name)` | Delete a single entry |
| `vault.delete_entries(names, recursive)` | Delete multiple entries |
| `vault.move_entry(from, to)` | Move or rename an entry path |
| `vault.rename_entry(current, new_name)` | Rename entry inside same parent |
| `vault.copy_entry(from, to)` | Copy file or directory recursively |
| `vault.change_password(old, new)` | Change the vault password |
| `vault.compact()` | Reclaim space from deletions |
| `vault.security_info()` | Get encryption parameters |
| `vault.path()` | Get the vault file path |
| `vault.mode()` | Get the encryption mode |
| `vault.chunk_size()` | Get the chunk size in bytes |

### `CreateOptions`

```rust
CreateOptions::new(path, password)
    .with_mode(EncryptionMode::Cascade)   // Default: AesGcmSiv
    .with_chunk_size(65536)               // Default: 65536 (64 KB)
```

## Error Correction (`.aerocorrect`)

Since 0.5.0 the crate ships the unified `.aerocorrect` Reed-Solomon recovery sidecar: a detached, content-SHA-bound recovery file for any byte stream. It protects `.aerovault` containers or ordinary files, repair is atomic and all-or-nothing, and the format v2 sidecar is self-healing so a lightly-corrupted recovery file still recovers. The format is shared byte-for-byte with AeroFTP v4, pinned by a cross-implementation fixture.

```rust
use aerovault::{correct_generate, correct_repair, correct_verify};

fn protect_and_repair() -> Result<(), Box<dyn std::error::Error>> {
    // Generate a sidecar at ~15% overhead (None = default level)
    let report = correct_generate("my-vault.aerovault", 15, None)?;
    println!("wrote {}", report.sidecar);

    // Verify against the bound content hash
    let verified = correct_verify("my-vault.aerovault", None)?;
    if !verified.verified {
        // Repair is fail-closed: the rebuilt stream is re-verified
        // against the bound SHA-256 before the original is replaced
        let repaired = correct_repair("my-vault.aerovault", None)?;
        println!("status: {}", repaired.status);
    }
    Ok(())
}
```

| Function | Description |
|----------|-------------|
| `correct_generate(path, overhead_pct, parity)` | Write a `.aerocorrect` sidecar for the file |
| `correct_verify(path, parity)` | Check the file against its sidecar without modifying it |
| `correct_repair(path, parity)` | Reconstruct damaged regions in place, fail-closed |

Generation and repair run in 64 MiB windows and read parity on demand, so memory is bounded regardless of file size (the sidecar is capped at 1 GiB). Overhead levels map to storage targets: `low` ~7%, `medium` ~15%, `quartile` ~25%, `high` ~30%, or a numeric 5-50%. The full binary layout is in [`AEROCORRECT-SPEC.md`](https://github.com/axpnet/aerovault/blob/main/docs/AEROCORRECT-SPEC.md). For the application-level operational surface (vault scrub/repair, sync sidecars), see [Error Correction (`.aerocorrect`)](/security/error-correction).

## File Format

The `.aerovault` format consists of:

1. **Header** (512 bytes) - magic bytes, version, encryption mode, Argon2id salt, AES-KW wrapped key, HMAC-SHA512 MAC
2. **Manifest** - AES-SIV encrypted JSON index of all entries (filenames, sizes, offsets, timestamps)
3. **Data blocks** - AES-256-GCM-SIV encrypted chunks (64 KB each), optionally double-encrypted with ChaCha20-Poly1305 in cascade mode

The format specification is available in the [GitHub repository](https://github.com/axpnet/aerovault).

## Cross-Platform Implementations

### Java (Android)

The AeroFTP mobile app includes a Java implementation of the AeroVault format using Google Tink and BouncyCastle:

- **Tink** for AES-256-GCM-SIV (RFC 8452)
- **BouncyCastle** for Argon2id KDF, AES-KW, AES-SIV, HMAC-SHA512
- Full read/write compatibility with the Rust crate

::: tip S2V Header Order
When implementing AES-SIV with the `aes-siv 0.7.0` Rust crate, `SivAead` passes S2V headers as `[aad, nonce]` (AAD first, nonce second per RFC 5297 Section 3). Java implementations must match this order: `{ new byte[0], new byte[16] }`.
:::

### Planned Bindings

- **Python** bindings via PyO3
- **WebAssembly** (WASM) bindings for browser-based vault access

## Dependencies

| Crate | Version | Purpose |
|-------|---------|---------|
| `aes-gcm-siv` | 0.11 | Content encryption |
| `aes-kw` | 0.2 | Key wrapping |
| `aes-siv` | 0.7 | Filename encryption |
| `argon2` | 0.5 | Password-based KDF |
| `chacha20poly1305` | 0.10 | Cascade mode |
| `hmac` | 0.12 | Header integrity |
| `sha2` | 0.10 | Hashing |
| `hkdf` | 0.12 | Key derivation |
| `secrecy` | 0.8 | Zeroize-on-drop secrets |
| `zeroize` | 1 | Memory zeroing |
