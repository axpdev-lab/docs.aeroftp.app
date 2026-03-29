# Privacy

AeroFTP is a privacy-enhanced file manager. It collects no telemetry, sends no analytics, and makes no network requests beyond user-initiated connections.

## Data Collection

**AeroFTP collects nothing.**

| Category | Status |
| -------- | ------ |
| Usage analytics | None |
| Crash reporting | None |
| Telemetry | None |
| Phone-home requests | None |
| User tracking | None |

The application makes network connections only when the user explicitly initiates a file transfer, cloud provider connection, AI chat request, or update check.

## Local Storage

All application data is stored locally in the user's configuration directory:

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
| Chat history | `ai_chat_history.db` | SQLite (local, not encrypted) |
| Agent memory | `agent_memory.db` | SQLite (local, not encrypted) |
| Sync journals | `sync_*.db` | SQLite WAL (local) |
| File tags | `file_tags.db` | SQLite WAL (local) |
| UI state | Browser localStorage | Not encrypted (non-sensitive: window size, panel layout) |

## AI Provider Connections

When using AeroAgent, the application connects directly to the user's chosen AI provider using the user's own API key. AeroFTP does not proxy, log, or inspect AI conversations. Supported providers: OpenAI, Anthropic, Gemini, xAI, OpenRouter, Ollama (local), Kimi, Qwen, DeepSeek, Mistral, Groq, Perplexity, Cohere, Together, and custom endpoints.

For local AI (Ollama), all processing happens on the user's machine with zero external network traffic.

## Memory Protection

Sensitive values are actively cleared from memory after use:

- Passwords, API keys, and OAuth tokens are wrapped in `secrecy::SecretString`
- When the wrapper is dropped, the underlying memory is overwritten with zeros before deallocation
- This prevents credential recovery from memory dumps, swap files, or core dumps on systems with encrypted swap

## What AeroFTP Is Not

AeroFTP is privacy-enhanced, not anonymous. Network connections to remote servers are visible to network observers. For network-level privacy, combine AeroFTP with a VPN or Tor. AeroFTP's privacy protections focus on local data at rest and minimizing traces on the host system.

## Deletion

To remove all AeroFTP data from a system:

1. Uninstall the application
2. Delete `~/.config/aeroftp/` (Linux), `~/Library/Application Support/aeroftp/` (macOS), or `%APPDATA%\aeroftp\` (Windows)

No data remains elsewhere on the system. AeroFTP does not write to system registries (Linux/macOS), does not create cloud accounts, and does not store data on external servers.
