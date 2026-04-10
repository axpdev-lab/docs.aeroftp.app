# Credential Management

AeroFTP stores all sensitive data - server passwords, OAuth tokens, API keys, AI provider keys, and application configuration - in an encrypted vault backed by SQLite. This page describes the vault architecture, key derivation, storage scope, import/export, and platform-specific behavior.

## Unified Keystore (vault.db)

The primary credential store is `vault.db`, located in the application data directory:

| Platform | Path |
| -------- | ---- |
| Linux | `~/.config/aeroftp/vault.db` |
| macOS | `~/Library/Application Support/aeroftp/vault.db` |
| Windows | `%APPDATA%\aeroftp\vault.db` |

### Database Architecture

| Component | Detail |
| --------- | ------ |
| Database engine | SQLite 3, WAL (Write-Ahead Logging) mode |
| Encryption | AES-256-GCM, per-entry encryption |
| Nonce generation | Random 96-bit nonce per entry (never reused) |
| Key derivation | HKDF-SHA256 for per-purpose subkeys |
| Master key source | Argon2id from master password, or 512-bit CSPRNG auto-generated passphrase |

Each entry in the vault is individually encrypted with AES-256-GCM using a unique random nonce. This means that even if two entries have identical plaintext values, their ciphertexts differ. The per-entry nonce is stored alongside the ciphertext in the same database row.

### Key Derivation Chain

```text
Master Password (user-provided)
  │
  ├─ Argon2id (128 MiB, t=4, p=4, 32-byte salt)
  │    │
  │    └─ Master Key (256-bit)
  │         │
  │         ├─ HKDF-SHA256 (info="vault-encryption")
  │         │    └─ Vault Encryption Key (for AES-256-GCM)
  │         │
  │         ├─ HKDF-SHA256 (info="vault-auth")
  │         │    └─ Authentication Key (for vault unlock verification)
  │         │
  │         └─ HKDF-SHA256 (info="export-key")
  │              └─ Export Key (for .aeroftp-keystore files)
```

If no master password is set, a 512-bit passphrase is generated using the operating system CSPRNG (`OsRng`) and stored in the OS keyring. This provides strong encryption without requiring user interaction on every launch.

## What Gets Stored

The vault stores the following categories of sensitive data:

| Category | Examples | Encryption |
| -------- | -------- | ---------- |
| Server passwords | FTP, SFTP, WebDAV credentials | AES-256-GCM per entry |
| OAuth tokens | Google Drive, Dropbox, OneDrive, Box, Zoho, kDrive, Koofr, Internxt access + refresh tokens | AES-256-GCM per entry |
| OAuth1 tokens | 4shared access + request tokens | AES-256-GCM per entry |
| API keys | S3 access/secret keys, Azure keys, Filen keys, FileLu keys, OpenDrive session, MEGA passwords | AES-256-GCM per entry |
| AI provider keys | OpenAI, Anthropic, Gemini, xAI, Groq, Mistral, Perplexity, Cohere, Together, etc. | AES-256-GCM per entry |
| Server profiles | Host, port, username, protocol type, connection parameters | AES-256-GCM per entry |
| Application config | AI settings, sync preferences, theme choice | AES-256-GCM per entry |
| TOTP secrets | 2FA secret bytes for vault unlock | AES-256-GCM, zeroized on drop |

## Master Password

The master password is optional but strongly recommended. It protects the vault against unauthorized access on shared machines.

### With Master Password

- The password is processed through Argon2id (128 MiB, t=4, p=4) to derive the master key
- The master password itself is never stored anywhere - only the derived key is held in memory or the OS keyring
- On each application launch, the user is prompted for the master password
- If TOTP 2FA is enabled, a second factor is required after the password (see [TOTP 2FA](totp.md))

### Without Master Password

- A 512-bit passphrase is auto-generated via `OsRng` (CSPRNG) at first launch
- The passphrase is stored in the OS keyring (`keyring` crate with `linux-native` feature)
- The vault unlocks automatically on launch without user interaction
- Security relies on OS-level access control (user login, screen lock)

## OS Keyring Integration

AeroFTP uses the `keyring` crate to interact with the operating system's credential store:

| Platform | Backend |
| -------- | ------- |
| Linux | Secret Service API (GNOME Keyring, KDE Wallet) via `linux-native` feature |
| macOS | Keychain |
| Windows | Credential Manager |

At startup, AeroFTP probes the OS keyring. If available, the vault decryption key is stored there for seamless unlock on subsequent launches. If the keyring is unavailable (headless systems, CI environments, minimal desktop sessions), AeroFTP falls back to in-memory key storage with a password prompt on each launch.

## OAuth Token Storage

OAuth tokens follow a two-tier storage strategy:

1. **Primary**: Stored in vault.db, encrypted at rest with AES-256-GCM
2. **Fallback**: If the vault is locked or unavailable at the moment of token receipt, tokens are held in an in-memory `Mutex` for the session duration

Tokens are never written to disk unencrypted. All token values across all 22 provider implementations are wrapped in `secrecy::SecretString` to prevent accidental logging or debug output. Tokens are unwrapped (`.expose_secret()`) only at the exact point where they are inserted into HTTP Authorization headers.

## Import and Export

AeroFTP supports credential backup and restore via encrypted `.aeroftp-keystore` files.

### Export

1. Open **Settings > Servers > Export**
2. A checklist dialog appears showing all saved server profiles
3. Select individual servers or use **Select All / Deselect All**
4. Choose a destination file path
5. Enter an export password (used to encrypt the file)

The export file is encrypted with:

| Component | Algorithm |
| --------- | --------- |
| Encryption | AES-256-GCM |
| Key derivation | Argon2id (same parameters as vault) |
| Integrity | HMAC-SHA256 over encrypted payload |

### Import

1. Open **Settings > Servers > Import**
2. Select a `.aeroftp-keystore` file
3. Enter the export password
4. HMAC is verified before decryption proceeds
5. Credentials are merged into the current vault

> **Warning:** The export file contains all credentials for the selected servers, including passwords and OAuth tokens. Store it securely and delete it after a successful import.

### Error Handling

Import and export operations include proper error handling for:
- Vault not initialized (first launch before setup)
- Incorrect export password (HMAC verification failure)
- Corrupted export file
- Missing or inaccessible file paths

All errors are logged with context rather than silently discarded.

## Migration Wizard

When upgrading from older AeroFTP versions that stored credentials in localStorage or the OS keyring directly, a 4-step migration wizard runs automatically on first launch:

| Step | Action | Details |
| ---- | ------ | ------- |
| 1. Detect | Scan for legacy sources | Checks localStorage, OS keyring entries, old config files |
| 2. Preview | Show migration plan | Lists all credentials that will be migrated, grouped by source |
| 3. Migrate | Move into vault.db | Encrypts each credential with AES-256-GCM and inserts into vault |
| 4. Cleanup | Remove legacy stores | Deletes old localStorage entries and keyring items after successful migration |

The wizard is auto-triggered on first launch after an upgrade. It can also be manually invoked from **Settings > Security > Re-run Migration**.

## Windows Credential Persistence

On Windows, `vault.db` is the authoritative credential store, but localStorage is maintained as a **write-through backup**. This dual-write strategy prevents permanent credential loss if the Windows Credential Manager encounters issues (corruption, access denied, service restart).

The `secureStoreAndClean` function is `await`-ed at all 6 call sites in the frontend to prevent race conditions where the vault returns stale data before the write has completed. This was a critical fix - earlier versions used fire-and-forget writes that could silently lose credentials.

## Security Considerations

- **Master password never stored**: Only a derived key is held in memory or the OS keyring. The raw password cannot be recovered.
- **WAL mode**: SQLite WAL provides concurrent read access without database corruption, even during power loss.
- **Failed auth opacity**: Failed authentication attempts do not reveal whether a particular credential exists in the vault.
- **Auto-lock**: The vault locks automatically when the application closes. There is no configurable timeout - the vault remains unlocked for the entire session.
- **No telemetry**: Credential operations are never logged to external services. All operations are local-only.
- **Poison recovery**: Mutex-protected vault state includes poison recovery, preventing application hangs if a thread panics during a vault operation.
