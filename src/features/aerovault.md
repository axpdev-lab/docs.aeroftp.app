# AeroVault

AeroVault is AeroFTP's encrypted container system. It creates portable `.aerovault` files that can store any number of files and directories under strong authenticated encryption.

## Encryption Architecture

AeroVault v2 uses a layered cryptographic design:

| Layer | Algorithm | Purpose |
|-------|-----------|---------|
| Key derivation | **Argon2id** (128 MiB, t=4, p=4) | Derives master key from password |
| Key wrapping | **AES-256-KW** (RFC 3394) | Protects the content encryption key |
| Content encryption | **AES-256-GCM-SIV** (RFC 8452) | Nonce-misuse-resistant file encryption |
| Filename encryption | **AES-256-SIV** | Deterministic encrypted filenames in manifest |
| Header integrity | **HMAC-SHA512** | Tamper detection on vault header |
| Cascade (optional) | **ChaCha20-Poly1305** | Defense-in-depth second encryption layer |

Data is encrypted in 64 KB chunks for optimal streaming performance.

> **Note:** The Argon2id parameters exceed OWASP 2024 recommendations, providing strong resistance against GPU-based brute force attacks.

## Creating a Vault

1. Click the AeroVault icon in the titlebar or use the View menu.
2. Select **Create New Vault** and choose a save location.
3. Set a master password. Optionally enable ChaCha20-Poly1305 cascade mode.
4. Add files or folders via drag-and-drop or the file picker.

## Working with Vaults

- **Open** — enter the master password to browse vault contents
- **Add files** — drag files into an open vault, or use the Add button
- **Create directories** — organize files into folders within the vault
- **Extract** — extract individual files or the entire vault contents
- **Delete entries** — remove files or directories (recursive delete supported)
- **Change password** — re-encrypt the vault with a new master password

## Remote Vault Support

Open `.aerovault` files stored on remote servers. AeroFTP downloads the vault, performs operations locally, and uploads the modified vault on "Save & Close". Path traversal and symlink attacks are validated before any operation.

## Folder Encryption

Right-click any local directory and select **Encrypt as AeroVault** to create a vault containing the entire directory tree. A progress indicator shows the recursive scan and encryption status.

## Recent Vaults

AeroVault tracks recently opened vaults in a SQLite database. The home screen displays recent vaults with security badges and last-opened timestamps for one-click reopening.

## TOTP Second Factor

Optionally protect vault access with a TOTP code in addition to the master password. See [TOTP 2FA](../security/totp.md) for setup instructions.

## Cryptomator Compatibility

AeroVault can open Cryptomator vault format 8 containers (read-only via context menu). This uses scrypt KDF + AES-KW + AES-SIV + AES-GCM, matching Cryptomator's specification. This is provided as legacy support — AeroVault v2 is recommended for new vaults.

## File Format

The `.aerovault` binary format consists of:

```
[512-byte header] [AES-SIV encrypted manifest] [AES-256-GCM-SIV chunked data...]
```

AeroVault files are registered as a MIME type on all platforms, with dedicated icons for Linux, Windows, and macOS. Double-clicking a `.aerovault` file opens it directly in AeroFTP.
