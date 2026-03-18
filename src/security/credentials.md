# Credential Management

AeroFTP stores all sensitive data — server passwords, OAuth tokens, API keys, and AI provider keys — in an encrypted vault backed by SQLite.

## Unified Keystore (vault.db)

The primary credential store is `vault.db`, located in the application data directory. It uses:

| Component | Detail |
|-----------|--------|
| Encryption | AES-256-GCM |
| Key derivation | Argon2id |
| Database | SQLite with WAL mode |
| Scope | Server profiles, OAuth tokens, AI configuration |

On first launch, the vault is initialized with a master password. All subsequent reads and writes are encrypted transparently.

## OS Keyring Integration

AeroFTP uses the `keyring` crate (with the `linux-native` feature) to probe the OS keyring at startup. If the OS keyring is available, it stores the vault decryption key there for seamless unlock. If the keyring is unavailable (e.g., headless systems), AeroFTP falls back to in-memory key storage with a password prompt on each launch.

## OAuth Token Storage

OAuth tokens follow a two-tier strategy:

1. **Primary** — stored in vault.db, encrypted at rest
2. **Fallback** — if the vault is locked or unavailable, tokens are held in an in-memory `Mutex` for the duration of the session

Tokens are never written to disk unencrypted. All token values are wrapped in `SecretString` to prevent accidental logging.

## Import and Export

AeroFTP supports credential backup and restore:

- **Export** — saves all server profiles to an encrypted `.aeroftp-keystore` file, protected with a user-chosen password (Argon2id + AES-256-GCM)
- **Import** — restores credentials from a `.aeroftp-keystore` file after password verification
- **Selective export** — choose specific servers to include via a checklist dialog

> **Warning:** The export file contains all credentials for the selected servers. Store it securely and delete it after import.

## Migration Wizard

When upgrading from older AeroFTP versions that stored credentials in localStorage or the OS keyring directly, a 4-step migration wizard runs automatically:

1. **Detect** — scans for legacy credential sources
2. **Preview** — shows which credentials will be migrated
3. **Migrate** — moves credentials into vault.db
4. **Cleanup** — removes legacy credential stores after successful migration

## Windows Credential Persistence

On Windows, `vault.db` is the authoritative store, with localStorage maintained as a write-through backup. This prevents credential loss if the Windows Credential Manager encounters issues. The `secureStoreAndClean` function is awaited at all call sites to prevent race conditions.

## Security Considerations

- Master password is never stored — only a derived key is held in memory or the OS keyring
- Vault.db uses SQLite WAL mode for concurrent read access without corruption
- Failed authentication attempts do not reveal whether credentials exist
- The vault auto-locks after the application closes
