# Credential Management

AeroFTP stores saved server passwords, OAuth tokens and AI provider keys in its Universal Credential Vault. This credential store is separate from the encrypted `.aerovault` file containers.

## Storage and key modes

The credential store consists of `vault.db` and `vault.key` in the application configuration directory. Despite its filename, **`vault.db` is a JSON envelope, not a SQLite database**. Secret entries are encrypted individually with AES-256-GCM and a fresh random 96-bit nonce. Writes use a temporary file and replacement; Windows has fallback write paths when replacement is unavailable.

| Installation | Credential directory |
| --- | --- |
| Linux release | `~/.config/aeroftp/` |
| macOS release | `~/Library/Application Support/aeroftp/` |
| Windows release | `%APPDATA%\aeroftp\` |
| Windows portable | `data\aeroftp\` beside the executable |
| Development build | Separate `aeroftp-dev` directory |

Packaged installations can use their own platform-specific configuration root. The [privacy guide](/security/privacy) covers removal and the keyring reference.

A random 64-byte passphrase supplies the vault key material. HKDF-SHA256 with the context `aeroftp-vault-v2` derives the 256-bit entry-encryption key.

| Mode | How the passphrase is protected |
| --- | --- |
| Automatic, with available OS keyring | The passphrase is in the OS credential store; `vault.key` records the mode and keyring reference |
| Master password | Argon2id derives a wrapping key from the password and a random salt; AES-256-GCM encrypts the passphrase in `vault.key` |
| Automatic, without a working OS keyring | A file-permission-protected `vault.key` holds the passphrase on disk |

The last mode preserves credentials on portable or restricted systems. It does **not** provide the same protection against someone who can read the whole configuration directory. Set a master password when that threat matters. A missing or unreadable keyring reference is reported rather than replaced by a different vault's passphrase.

Master-password wrapping uses Argon2id with **128 MiB memory, four iterations, parallelism four and a 32-byte salt** in release builds. The raw password is not stored. Unlocking makes the vault key available in process memory for the session. The OS keyring does not hold the user's master password.

## OS credential store

| Platform | Credential backend |
| --- | --- |
| Linux | Secret Service, such as GNOME Keyring or KDE Wallet |
| macOS | Keychain |
| Windows | Credential Manager |

The system keyring protects the automatic-mode passphrase. Individual provider tokens are persisted in the encrypted vault, rather than as a separate direct keyring entry per token. Portable, Flatpak and Snap scopes have separate keyring identities; multiple vaults must not overwrite one another's key.

## Saved data and locking

Vault entries can include saved profiles, server secrets, OAuth and OAuth1 tokens, API keys, native Proton sessions, AI keys and protected configuration. Other application state, such as interface layout and history databases, has its own storage. Do not assume every application file is encrypted merely because credentials are.

Security settings offer a master password, optional [TOTP second factor](/security/totp), manual locking and an inactivity auto-lock timeout. A timeout of zero disables the timer. The lock state and any outstanding security prompt must be respected before accessing saved secrets.

Existing versions have compatibility and migration paths for legacy frontend credential state. Those paths are not a reason to preserve an extra credential copy manually. Use the supported backup tools before moving or removing an installation.

## App settings in 4.2.5

Confirmed application-settings writes keep the settings blob in the encrypted vault and remove the legacy `aeroftp_settings` WebView-storage copy. Migration writes only when the vault has no settings; an unavailable or corrupt vault is not treated as an empty one. Failed writes preserve the migration source so a later attempt can recover it.

Until vault initialization or unlock completes, the interface can show default preferences. The vault-ready refresh then applies the saved preferences without requiring a restart. Other application files and nonsecret caches keep their own storage contracts; this change does not encrypt every file in the configuration directory.

## Two backup formats

| Format | Scope | Use |
| --- | --- | --- |
| `.aeroftp` | Selected server profiles; saved credentials are optional | Move or back up connection profiles |
| `.aeroftp-keystore` | Vault entries, or a full application backup including supported databases, files and settings | Recover the keystore or a broader application snapshot |

Both formats use password-based encryption with Argon2id and AES-256-GCM. AES-GCM authenticates the encrypted content; there is no separate HMAC-SHA256 layer to verify first. Full keystore v2 backups compress their payload with zstd before encryption; legacy backups remain readable.

Use the application's import/export dialogs for the intended scope. CLI profile backups are also available:

```bash
aeroftp-cli profile-export --output servers.aeroftp
aeroftp-cli profile-import --input servers.aeroftp
```

Saved credentials are opt-in with `profile-export --include-credentials`. Profile import skips existing profiles instead of overwriting them. Full keystore import presents a recovery plan and can change more application state than a profile import. Review that plan before applying it.

An encrypted backup containing tokens or native provider sessions authorizes access to those accounts after decryption. Keep its password separate and protect the backup accordingly. For native Proton sessions shared with rclone, see the [bridge limitations](/features/rclone#proton-drive-sessions).

## Related documentation

- [Privacy and removal](/security/privacy)
- [Encryption](/security/encryption)
- [TOTP](/security/totp)
- [CLI backup commands](/cli/commands)
