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

The passphrase for the encrypted credential database is protected by the OS keyring or a master password. Without a working keyring, the local fallback stores it in `vault.key` beside the database. Its protection then depends on filesystem permissions. Windows ACL hardening is best effort and, when successful, grants full control to the current user, SYSTEM and BUILTIN\Administrators. Failures are logged without aborting vault operations; inherited access may remain or be restored. Copying both fallback files is enough to open the database. Enable a master password when filesystem permissions cannot be trusted. See [Credential Management](/security/credentials) for the modes.

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

1. Uninstall the application.
2. Delete every AeroFTP data directory that exists. After an update more than one can exist, because a directory named after the previous application identifier is left in place:
   - Linux: `~/.config/aeroftp/`, `~/.local/share/app.aeroftp.AeroFTP/` and `~/.local/share/com.aeroftp.AeroFTP/`
   - macOS: `~/Library/Application Support/aeroftp/`, and any `app.aeroftp.AeroFTP` or `com.aeroftp.AeroFTP` folder under `~/Library/Application Support/`, `~/Library/Caches/` and `~/Library/WebKit/`
   - Windows: `%APPDATA%\aeroftp\`, and any `app.aeroftp.AeroFTP` or `com.aeroftp.AeroFTP` folder under `%APPDATA%` and `%LOCALAPPDATA%`
3. If the vault is protected by the system keyring rather than by a master password, delete the keyring entry too. It is stored under the service name `com.aeroftp.AeroFTP` (account `vault-passphrase`, or `vault-passphrase-portable`, `vault-passphrase-flatpak` or `vault-passphrase-snap` for those installations), and deleting the directories above does not remove it. The per-platform commands are in [PRIVACY.md](https://github.com/axpdev-lab/aeroftp/blob/main/PRIVACY.md).

AeroFTP does not create cloud accounts for you. Transfers and AI requests send the content you select, or enable through tools and background jobs, to the configured servers and providers.
