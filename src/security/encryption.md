# Encryption

AeroFTP uses encryption at multiple layers to protect data at rest, in transit, and during storage. All cryptographic operations run locally in the Rust backend — no data is sent to external services for encryption.

## AeroVault v2

AeroVault v2 is AeroFTP's encrypted container format, designed with a defense-in-depth architecture:

| Component | Algorithm | Specification |
|-----------|-----------|---------------|
| Key derivation | Argon2id | 128 MiB memory, t=4, p=4 |
| Key wrapping | AES-256-KW | RFC 3394 |
| Content encryption | AES-256-GCM-SIV | RFC 8452, 64 KB chunks |
| Filename encryption | AES-256-SIV | Deterministic encryption |
| Header integrity | HMAC-SHA512 | Tamper detection |
| Cascade (optional) | ChaCha20-Poly1305 | Second encryption layer |

The Argon2id parameters exceed OWASP 2024 recommendations. The 64 KB chunk size balances security with streaming performance.

> **Note:** AES-256-GCM-SIV (RFC 8452) is nonce-misuse-resistant, meaning accidental nonce reuse does not catastrophically compromise security — unlike standard AES-GCM.

## Archive Encryption

| Format | Algorithm | Key Derivation |
|--------|-----------|---------------|
| ZIP | AES-256 (WinZip AE-2) | PBKDF2 |
| 7z | AES-256 | SHA-256 based |

Archive passwords are zeroized in memory after use via the `secrecy` crate.

## Credential Storage

All credentials (server passwords, OAuth tokens, API keys) are stored in `vault.db`:

| Component | Algorithm |
|-----------|-----------|
| Encryption | AES-256-GCM |
| Key derivation | Argon2id |
| Storage | SQLite WAL mode |

See [Credential Management](credentials.md) for details on the credential lifecycle.

## OAuth Token Security

OAuth access tokens and refresh tokens are wrapped in Rust's `SecretString` type across all provider implementations. This ensures:

- Tokens are never logged or printed in debug output
- Memory is zeroized when tokens are dropped
- Tokens are only unwrapped at the point of use (HTTP request headers)

## Transport Encryption

| Protocol | Encryption |
|----------|-----------|
| FTPS | TLS 1.2/1.3 (explicit or implicit) |
| SFTP | SSH (Ed25519, RSA, ECDSA) |
| WebDAV (HTTPS) | TLS 1.2/1.3 |
| S3 | TLS 1.2/1.3 |
| Cloud APIs | TLS 1.2/1.3 (HTTPS) |

For SFTP connections, AeroFTP implements TOFU (Trust On First Use) host key verification with a visual fingerprint dialog. See [TOTP 2FA](totp.md) for vault-level second factor authentication.

> **Warning:** FTP without TLS transmits credentials in plaintext. AeroFTP displays a TLS badge and warns when encryption is set to "none".

## Cryptomator Compatibility

AeroFTP can open Cryptomator vault format 8 containers using:
- **scrypt** for key derivation
- **AES-256-KW** for key wrapping
- **AES-256-SIV** for filename encryption
- **AES-256-GCM** for content encryption

This is provided as read-only legacy support. AeroVault v2 is recommended for new encrypted storage.
