# Privacy

AeroFTP collects no usage telemetry or analytics. Network activity serves connections and features you use or enable, including configured background work and update checks.

## Data Collection

**AeroFTP has no product telemetry, analytics or automatic crash reporting.** Configured services can receive the data needed for requested or enabled features.

| Category | Status |
| -------- | ------ |
| Usage analytics | None |
| Crash reporting | None |
| Telemetry | None |
| Product telemetry requests | None |
| User tracking | None |

Connections include file transfers, provider authentication, AI requests, update checks and enabled background sync or scheduled work. Automatic update checks and configured background jobs can contact their services without a new click for each request. Enabled AeroShare can use peer discovery and relays; external MCP servers may contact their own endpoints. See the full [repository privacy policy](https://github.com/axpdev-lab/aeroftp/blob/main/PRIVACY.md) for those boundaries.

## Local Storage

Configuration and credentials normally use the following directories. WebView state, caches, downloaded models and logs can use separate platform directories; portable mode redirects state under its own `data` folder:

| Platform | Path |
| -------- | ---- |
| Linux | `~/.config/aeroftp/` |
| macOS | `~/Library/Application Support/aeroftp/` |
| Windows | `%APPDATA%\aeroftp\` |
| Windows portable | `data\aeroftp\` relative to the executable |

| Data | Storage | Encryption |
| ---- | ------- | ---------- |
| Server credentials | `vault.db` | AES-256-GCM per entry |
| OAuth tokens | `vault.db` | AES-256-GCM per entry |
| AI API keys | `vault.db` | AES-256-GCM per entry |
| Application settings | `vault.db` | AES-256-GCM per entry |
| Chat history | `ai_chat.db` | SQLite (local, not encrypted) |
| Agent memory | `agent_memory.db` | SQLite (local, not encrypted) |
| Sync journals | `sync-journal/*.json` | Local JSON run records |
| File tags | `file_tags.db` | SQLite WAL (local) |
| UI state | Browser localStorage | Not encrypted (non-sensitive: window size, panel layout) |

The passphrase for the encrypted credential database is protected by the OS keyring or a master password. Without a working keyring, the local fallback stores it in `vault.key` beside the database. Its protection then depends on filesystem permissions. Windows ACL hardening is best effort and, when successful, grants full control to the current user, SYSTEM and BUILTIN\Administrators. Failures are logged without aborting vault operations; inherited access may remain or be restored. Copying both fallback files can recover the vault key for offline decryption. Opening the vault through AeroFTP still requires a valid TOTP code when that factor is enabled; this application unlock check does not add offline encryption to the copied database. Enable a master password when filesystem permissions cannot be trusted. See [Credential Management](/security/credentials) for the modes.

## AI Provider Connections

When using AeroAgent, the application connects directly to the user's chosen AI provider using the user's own API key. Requests go to the configured provider endpoint. AeroFTP keeps local chat history and can assemble context from the files or tools you use. Examples include OpenAI, Anthropic, Gemini, xAI, OpenRouter, Ollama, Kimi, Qwen, DeepSeek, Mistral, Groq, Perplexity, Cohere, Together, and custom endpoints.

A local Ollama endpoint can process inference on your machine. A remote Ollama endpoint or another tool invoked during the conversation can still use the network.

## Memory Protection

Secret wrappers and explicit zeroization clear many sensitive buffers after use:

- Passwords, API keys, and OAuth tokens are wrapped in `secrecy::SecretString`
- When the wrapper is dropped, the underlying memory is overwritten with zeros before deallocation
- This reduces residual copies; it does not guarantee removal of every copy from process dumps or swap. The unlocked vault key remains in process memory for the session.

## What AeroFTP Is Not

AeroFTP is privacy-enhanced, not anonymous. Network connections to remote servers are visible to network observers. For network-level privacy, combine AeroFTP with a VPN or Tor. AeroFTP's privacy protections focus on local data at rest and minimizing traces on the host system.

## Deletion

To remove all AeroFTP data from a system:

1. Before uninstalling or deleting vault directories, identify and remove the OS keyring entries for each installation and vault you intend to remove. `aeroftp-cli keystore status` reports the exact service/account used by the current automatic-keyring vault in its diagnostic detail; it does not print the passphrase. For multiple vaults, identify each account while its installation and metadata are still available. The service is `com.aeroftp.AeroFTP`. Default accounts are `vault-passphrase`, `vault-passphrase-portable`, `vault-passphrase-flatpak` or `vault-passphrase-snap` (development scopes add `-dev`). A second vault can use a named account with a suffix of a dash and 16 lowercase hexadecimal characters, for example `vault-passphrase-3f9c0a1b2d4e5f60`. Remove the exact relevant account and any such named accounts belonging to that installation using the OS credential manager. Do not delete by a broad prefix that also matches another installation. Per-platform commands and naming rules are in [PRIVACY.md](https://github.com/axpdev-lab/aeroftp/blob/main/PRIVACY.md). Deleting data directories does not remove these keyring entries.
2. Uninstall the application.
3. Delete every AeroFTP data directory that exists. After an update more than one can exist, because a directory named after the previous application identifier is left in place:
   - Linux: `~/.config/aeroftp/`, `~/.local/share/app.aeroftp.AeroFTP/` and `~/.local/share/com.aeroftp.AeroFTP/`
   - macOS: `~/Library/Application Support/aeroftp/`, and any `app.aeroftp.AeroFTP` or `com.aeroftp.AeroFTP` folder under `~/Library/Application Support/`, `~/Library/Caches/` and `~/Library/WebKit/`
   - Windows: `%APPDATA%\aeroftp\`, and any `app.aeroftp.AeroFTP` or `com.aeroftp.AeroFTP` folder under `%APPDATA%` and `%LOCALAPPDATA%`
   - Windows portable: remove the executable-relative `data\aeroftp\` directory for credentials and configuration. Remove the installation's entire `data\` directory to include its WebView state, logs and other portable state. Keep any files you want to retain first.

AeroFTP does not create cloud accounts for you. Transfers and AI requests send the content you select, or enable through tools and background jobs, to the configured servers and providers.
