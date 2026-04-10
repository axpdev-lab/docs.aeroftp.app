# rclone crypt interoperability

`rclone crypt` is one of the most important encryption formats in the cloud storage ecosystem. AeroFTP supports compatibility workflows so you can inspect and decrypt existing rclone-encrypted storage without leaving the app.

## Current scope

The current implementation is a read-only MVP focused on safe access to already encrypted remotes:

- Unlock an existing `rclone crypt` remote locally
- Decrypt filenames for browsing
- Decrypt file content for local read and download flows
- Keep raw encrypted data on the provider untouched

Current limitations:

- No write path yet for creating or updating `rclone crypt` remotes
- No migration wizard that converts `rclone crypt` storage into AeroVault
- Compatibility target is the standard rclone crypt format used in real-world remotes today

## Security model

All cryptographic work happens locally in the Rust backend.

- File content decryption follows the `rclone crypt` data format based on XSalsa20-Poly1305
- Filename decryption supports the standard encrypted-name mode used by rclone
- Keys are derived locally from the user password and optional secondary secret
- Unlocked keys live in backend-managed state and can be explicitly locked again

AeroFTP does not send encryption passwords to any external service. The cloud provider only sees the already encrypted object names and ciphertext that were produced by rclone.

## How this differs from AeroFTP crypt and AeroVault

These features solve different problems:

| Feature | Owner of the format | Current AeroFTP role |
| --- | --- | --- |
| AeroVault | AeroFTP | Native encrypted container format with full product ownership |
| AeroFTP crypt overlay | AeroFTP | Native encrypted overlay for any provider, including upload and download workflows |
| `rclone crypt` | rclone ecosystem | Compatibility layer for browsing and decrypting existing encrypted remotes |

If you want a format that AeroFTP controls end to end, use AeroVault or the AeroFTP crypt overlay. If you already have data encrypted by rclone, use this compatibility layer.

## Recommended use cases

- Audit an existing `rclone crypt` bucket before migration
- Browse encrypted backups without exposing raw credentials to third-party tools
- Download and decrypt specific files from a remote that was originally created with rclone
- Keep one desktop workflow while preserving interoperability with established rclone environments

## Boundaries and expectations

This feature is intentionally conservative. AeroFTP treats `rclone crypt` as an interoperability target, not as an AeroFTP-owned storage format.

That means:

- We document the compatibility layer in both Features and Security
- We avoid over-claiming write support that does not exist yet
- We keep the native AeroFTP encryption story separate from the rclone one

For profile import and export through `rclone.conf`, see [rclone Bridge](/features/rclone).

For the broader encryption architecture, see [Encryption](/security/encryption).
