# rclone crypt interoperability

`rclone crypt` is one of the most important encryption formats in the cloud storage ecosystem. AeroFTP supports compatibility workflows so you can inspect and decrypt existing rclone-encrypted storage without leaving the app.

## Current scope

AeroFTP now provides full read/write interoperability with `rclone crypt` remotes through a transparent crypto overlay session:

- Unlock an existing `rclone crypt` remote locally with the password (and optional secondary salt)
- Decrypt filenames for browsing and decrypt file content for local read and download flows
- **Re-encrypt on the upload path** — files dropped into the overlay are encrypted with the same key derivation, chunking, and filename obfuscation as the standard rclone crypt format, so the provider never sees plaintext
- Rename, delete, and move operations stay within the encrypted overlay; the underlying provider sees only opaque ciphertext blobs and obfuscated names
- Keep raw encrypted data on the provider fully compatible with the rclone CLI and other rclone-aware tools

Limitations:

- No migration wizard yet that converts `rclone crypt` storage into AeroVault (the two formats coexist by design — pick the one whose ecosystem matches your tooling)
- Compatibility target is the standard rclone crypt format (XSalsa20-Poly1305 content + EME filename encryption) as used in real-world remotes today

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
| `rclone crypt` | rclone ecosystem | Full read/write interoperability layer through a transparent overlay session |

If you want a format that AeroFTP controls end to end, use AeroVault or the AeroFTP crypt overlay. If you already have data encrypted by rclone, use this compatibility layer.

## Recommended use cases

- Audit an existing `rclone crypt` bucket before migration
- Browse encrypted backups without exposing raw credentials to third-party tools
- Download and decrypt specific files from a remote that was originally created with rclone
- **Add new files to a shared rclone crypt remote from the GUI without dropping back to the rclone CLI**
- Keep one desktop workflow while preserving interoperability with established rclone environments

## Boundaries and expectations

AeroFTP treats `rclone crypt` as an interoperability target, not as an AeroFTP-owned storage format.

That means:

- We document the compatibility layer in both Features and Security
- We follow the rclone format spec strictly so files written by AeroFTP open cleanly in the rclone CLI
- We keep the native AeroFTP encryption story separate from the rclone one (AeroVault and the AeroFTP crypt overlay are the AeroFTP-owned formats)

For profile import and export through `rclone.conf`, see [rclone Bridge](/features/rclone).

For the broader encryption architecture, see [Encryption](/security/encryption).
