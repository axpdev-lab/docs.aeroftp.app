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
aerovault = "0.3"
```

Or via cargo:

```bash
cargo add aerovault
```

### As a CLI tool

```bash
cargo install aerovault-cli
```

The CLI provides commands for creating, opening, listing, adding, extracting, and managing vault files from the terminal.

## Cryptographic Features

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Content encryption | AES-256-GCM-SIV (RFC 8452) | Nonce misuse-resistant authenticated encryption |
| KDF | Argon2id (128 MiB / t=4 / p=4) | Password-based key derivation (exceeds OWASP 2024) |
| Key wrapping | AES-256-KW (RFC 3394) | Master key protection |
| Filename encryption | AES-256-SIV | Deterministic filename encryption |
| Header integrity | HMAC-SHA512 | Tamper detection on vault header |
| Cascade mode | ChaCha20-Poly1305 | Optional second encryption layer for defense-in-depth |

Data is encrypted in 64 KB chunks for an optimal balance between security and performance.

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
