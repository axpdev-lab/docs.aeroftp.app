# Architecture

AeroFTP is built on Tauri 2, combining a Rust backend with a React 18 + TypeScript frontend rendered in the system WebView.

## High-Level Overview

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│         React 18 + TypeScript + Tailwind         │
│                  (src/)                           │
├──────────────────────┬──────────────────────────┤
│      Tauri IPC       │     Tauri Events          │
│    invoke() calls    │   emit() / listen()       │
├──────────────────────┴──────────────────────────┤
│                  Rust Backend                     │
│               (src-tauri/src/)                    │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │Protocols │ │ AI Core  │ │  AeroVault       │ │
│  │(providers)│ │(streaming│ │  (AES-256-GCM-   │ │
│  │          │ │ + tools) │ │   SIV + Argon2id)│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │AeroSync  │ │ Plugins  │ │  Credential      │ │
│  │(journal, │ │(manifest │ │  Vault (JSON   │ │
│  │ verify)  │ │ + hooks) │ │  + AES-GCM)      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Backend (`src-tauri/src/`)

The Rust backend handles all protocol communication, encryption, and system operations.

### Key Modules

| Module | Purpose |
|--------|---------|
| `ai_stream.rs` | SSE/NDJSON streaming for 26 AI provider types |
| `ai_tools.rs` | GUI AI tool bridge; canonical definitions and dispatch live in `ai_core/` |
| `ai_core/` | Abstraction layer: `EventSink`, `CredentialProvider`, `RemoteBackend` traits |
| `sync.rs` | AeroSync engine: journal, checksum, retry, verification |
| `vault_v2.rs` | AeroVault v2: AES-256-GCM-SIV chunked encryption |
| `context_intelligence.rs` | Project detection, file dependency graph, agent memory |
| `plugins.rs` | Plugin lifecycle: install, verify (SHA-256), execute, hooks |
| `file_tags.rs` | SQLite WAL-backed file tagging with 7 preset labels |
| `cloud_provider_factory.rs` | AeroCloud multi-protocol dispatch |
| `license.rs` | Ed25519 license verification (dev-only) |

### Protocol Providers

The `providers/` modules implement `StorageProvider` for transports, native APIs and local/synthetic backends. The [provider inventory](https://github.com/axpdev-lab/aeroftp/blob/3a62301e589fffeb8b69fcdff7b5e95ff2b67288/docs/PROVIDER-INVENTORY.json) records supported connection forms:

- **Server protocols:** FTP/FTPS (`ftp.rs`), SFTP (`sftp.rs`), WebDAV (`webdav.rs`), S3 (`s3.rs`)
- **OAuth2 cloud:** Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud
- **API key / session:** MEGA, Azure Blob, 4shared (OAuth 1.0), Filen, FileLu, Yandex Disk, OpenDrive, native Proton Drive and its optional official CLI mode
- **Additional integrations:** Swift, native Backblaze B2, GitHub, GitLab, Immich, Drime, Twake and media providers

The trait has required core methods and optional operations, including: `connect`, `disconnect`, `list`, `upload`, `download`, `delete`, `rename`, `mkdir`, `stat`, `search`, `move_file`, `list_trash`, `restore_from_trash`, `permanent_delete`, `create_share_link`, `get_storage_quota`, `list_versions`, `download_version`.

## Frontend (`src/`)

React 18 with TypeScript strict mode, styled with Tailwind CSS. Eight themes: Light, Dark, True Dark, Tokyo Night, Cyber, Green, Ice and Red Horse.

### Key Components

| Component | Purpose |
|-----------|---------|
| `App.tsx` | Main layout, dual-panel file manager, connection state |
| `LocalFilePanel.tsx` | Local file browser  |
| `DevToolsV2.tsx` | Resizable panels: Code Editor + Terminal + AeroAgent |
| `AIChat.tsx` | AeroAgent chat UI  |
| `AeroSync/AeroSyncDialog.tsx` | Compare, Plan and local-mirror workflow |
| `VaultPanel.tsx` | AeroVault container management |
| `CommandPalette.tsx` | VS Code-style Ctrl+Shift+P command launcher |

### IPC Pattern

Frontend-to-backend communication uses two mechanisms:

1. **Commands** (`invoke`): Request-response calls. Used for file operations, tool execution, credential management.
2. **Events** (`emit`/`listen`): One-way push from backend to frontend. Used for streaming AI responses (`ai-stream-{id}`), transfer progress, and tool progress indicators.

```typescript
// Command (request-response)
const files = await invoke('list_directory', { path: '/home' });

// Event (streaming)
const unlisten = await listen('ai-stream-abc123', (event) => {
  appendToChat(event.payload);
});
```

## Plugin System

Plugins are JSON manifest files paired with shell scripts. They are installed in the user's config directory and verified with SHA-256 checksums before each execution.

```
~/.config/aeroftp/plugins/
  my-plugin/
    manifest.json    # Name, version, tools, hooks
    script.sh        # Executed by the plugin runtime
```

Plugins can define custom AI tools and register for event hooks (`file:created`, `transfer:complete`, `sync:complete`).

## CLI (`src-tauri/src/bin/aeroftp_cli.rs`)

The CLI is a separate binary target (`[[bin]]` in `Cargo.toml`) that reuses the backend and provider modules. Building it does not require building the frontend bundle. Its batch engine executes `.aeroftp-script` files. See [Batch scripting](/cli/batch-scripting) for the command contract.
