# Filen

AeroFTP connects to Filen's end-to-end encrypted cloud storage. All file contents and metadata are encrypted client-side with AES-256 before upload. Filen provides 10 GB of free storage.

> **Two ways to connect**: this page covers the **native API** integration (the recommended path - direct, E2E, 2FA-aware). If you have Filen Desktop installed and want to ride its built-in Network Drive bridges, see [Filen Desktop bridges](/providers/filen-desktop) instead.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Email | Your Filen account email | |
| Password | Your Filen password | Used to derive the encryption master key |
| 2FA Code | TOTP code (if enabled) | 6-digit authenticator code |

### 2FA Support

If your Filen account has two-factor authentication enabled, AeroFTP shows a conditional 2FA code field. The TOTP code is sent with the login request. If 2FA is not enabled, AeroFTP sends the default placeholder value `XXXXXX` as required by Filen's API.

### Auth version (v1 / v2 / v3)

Filen has rolled out three generations of credential derivation. AeroFTP supports all three, surfaces a colour-coded **Auth version** badge on the saved server card after the first successful connect, and picks the right path automatically based on the `auth/info` response:

| Auth version | KDF | Status in AeroFTP |
|--------------|-----|-------------------|
| **v1** | SHA-512 | Supported (legacy accounts) |
| **v2** | PBKDF2-SHA512 | Supported |
| **v3** | Argon2id (`t=3`, `m=65536`, `p=4`, `v=0x13`, `dkLen=64`) | Supported since v3.7.1 |

The v3 path matches the official Filen SDK byte-for-byte: hex-decoded salt, the same Argon2id parameters, and the same 64-byte derived key length. New Filen accounts that were rejected with a generic auth error before v3.7.1 connect on the first try now.

## Features

- **End-to-End Encryption**: File contents are encrypted with AES-256 on your device. File metadata (names, paths) is also encrypted. Filen has zero knowledge of your data.
- **Client-Side Key Derivation**: Your password is used locally to derive encryption keys. It is never sent to Filen's servers.
- **Streaming Encryption**: Files are encrypted and decrypted on the fly during transfers.
- **Cipher-strength badge**: AeroFTP shows `E2E 256-bit` next to Filen profiles - AES-256 plus the auth version badge so you can confirm the credential generation at a glance.

## Tips

- Filen's 10 GB free tier includes E2E encryption -- most competitors charge for client-side encryption.
- Filen does not expose a trash or versioning API. Deleted files cannot be recovered through AeroFTP.
- Because all file metadata is encrypted, directory listings require decrypting each entry's metadata. This can be slower than non-encrypted providers for large directories.
- For AeroSync with Filen, use the **size** compare mode since encrypted timestamps may differ from local file times.
- If you also use [Filen Desktop](/providers/filen-desktop), keep the native provider as your primary - it is the only path that gets v3 auth, share links, and the metadata-encrypted listing fast path. The Network Drive bridges are great for tooling that already speaks WebDAV / S3, not as a replacement for the native API.

## Related

- [Filen Desktop bridges](/providers/filen-desktop) - local WebDAV / S3 listeners exposed by the desktop app.
