# Encryption

AeroFTP uses encryption at multiple layers to protect data at rest, in transit, and during credential storage. All cryptographic operations execute locally in the Rust backend — no data is ever sent to external services for encryption or key management.

## Encryption Architecture Overview

AeroFTP applies encryption across four distinct layers:

| Layer | Purpose | Primary Algorithm |
| ----- | ------- | ----------------- |
| AeroVault v2 | Encrypted file containers | AES-256-GCM-SIV (RFC 8452) |
| Archive encryption | Password-protected ZIP/7z | AES-256 |
| Credential storage | vault.db secrets | AES-256-GCM + Argon2id |
| Transport security | Wire encryption | TLS 1.2/1.3, SSH |

Each layer operates independently, meaning a vulnerability in one layer does not compromise the others.

## AeroVault v2

AeroVault v2 is AeroFTP's proprietary encrypted container format (`.aerovault` files), designed with a defense-in-depth architecture using seven cryptographic primitives:

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

AES-256-GCM-SIV (RFC 8452) is a nonce-misuse-resistant AEAD cipher. Unlike standard AES-GCM, accidental nonce reuse does not catastrophically compromise security — it only leaks whether two plaintexts are identical. This provides a significant safety margin for file encryption where nonce management across thousands of chunks is critical.

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

## Archive Encryption

AeroFTP supports creating and extracting password-protected archives:

| Format | Encryption Algorithm | Key Derivation | Notes |
| ------ | -------------------- | -------------- | ----- |
| ZIP | AES-256 (WinZip AE-2) | PBKDF2-SHA1 | Industry-standard, wide compatibility |
| 7z | AES-256-CBC | SHA-256 based (2^19 rounds) | Strong encryption, 7-Zip compatible |
| RAR | AES-256-CBC | PBKDF2-HMAC-SHA256 | Extract-only (no creation) |

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
