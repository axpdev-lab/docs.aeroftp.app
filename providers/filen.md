# Filen

AeroFTP connects to Filen's end-to-end encrypted cloud storage. All file contents and metadata are encrypted client-side with AES-256 before upload. Filen provides 10 GB of free storage.

## Connection Settings

| Field | Value | Notes |
|-------|-------|-------|
| Email | Your Filen account email | |
| Password | Your Filen password | Used to derive the encryption master key |
| 2FA Code | TOTP code (if enabled) | 6-digit authenticator code |

### 2FA Support

If your Filen account has two-factor authentication enabled, AeroFTP shows a conditional 2FA code field. The TOTP code is sent with the login request. If 2FA is not enabled, AeroFTP sends the default placeholder value `XXXXXX` as required by Filen's API.

## Features

- **End-to-End Encryption**: File contents are encrypted with AES-256 on your device. File metadata (names, paths) is also encrypted. Filen has zero knowledge of your data.
- **Client-Side Key Derivation**: Your password is used locally to derive encryption keys. It is never sent to Filen's servers.
- **Streaming Encryption**: Files are encrypted and decrypted on the fly during transfers.

## Tips

- Filen's 10 GB free tier includes E2E encryption -- most competitors charge for client-side encryption.
- Filen does not expose a trash or versioning API. Deleted files cannot be recovered through AeroFTP.
- Because all file metadata is encrypted, directory listings require decrypting each entry's metadata. This can be slower than non-encrypted providers for large directories.
- For AeroSync with Filen, use the **size** compare mode since encrypted timestamps may differ from local file times.
