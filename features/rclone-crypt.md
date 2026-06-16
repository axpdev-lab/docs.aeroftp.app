# rclone crypt interoperability

`rclone crypt` is one of the most important encryption formats in the cloud storage ecosystem. AeroFTP provides full read/write interoperability so you can browse, decrypt and re-encrypt rclone-encrypted storage without leaving the app, and files written by AeroFTP open cleanly in the rclone CLI.

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

## CLI

`rclone crypt` has a dedicated CLI surface, separate from the native [AeroCrypt](/features/aerocrypt) `crypt` subcommand. `rclone-crypt put` writes the rclone crypt format, and `cryptcheck` verifies a local tree against an encrypted rclone remote:

```bash
# encrypt and upload a file in the rclone crypt format
AEROFTP_RCLONE_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" \
  rclone-crypt put ./report.pdf _ /encrypted

# verify a local directory against an encrypted rclone remote
AEROFTP_RCLONE_CRYPT_PASSWORD=secret aeroftp-cli --profile "S3" \
  cryptcheck _ ./local /encrypted --checksum
```

Passwords come from the environment (`AEROFTP_RCLONE_CRYPT_PASSWORD`, plus an optional secondary salt), never the command line. The GUI provides the full browse, download and upload surface for rclone crypt remotes in the dual panel; the CLI focuses on the write (`put`) and integrity (`cryptcheck`) paths, and `--filename-encryption standard|off|obfuscate` matches rclone's modes. See [CLI Commands](/cli/commands) for the full flags.

## AeroCrypt, rclone crypt and AeroVault

These are three different things, and AeroFTP keeps them apart:

- **`rclone crypt`** (this page) is the **interop** overlay: rclone's own format, so files written by AeroFTP open cleanly in the rclone CLI.
- **[AeroCrypt](/features/aerocrypt)** is the **native** overlay: AeroFTP's own `AECR` format (AES-256-GCM-SIV), the one AeroFTP leads with for new encrypted scopes.
- **[AeroVault](/security/encryption)** is the **container**: a single sealed `.aerovault` file, the Cryptomator-class vault.

For the full side-by-side comparison and the shared-crypto-core note, see [AeroCrypt Overlay](/features/aerocrypt). Use `rclone crypt` when you already have data encrypted by rclone.

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
- We keep the native AeroFTP encryption story separate from the rclone one (AeroVault and the [AeroCrypt overlay](/features/aerocrypt) are the AeroFTP-owned formats)

For profile import and export through `rclone.conf`, see [rclone Bridge](/features/rclone).

For the broader encryption architecture, see [Encryption](/security/encryption).
