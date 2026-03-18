# AeroAgent

AeroAgent is AeroFTP's AI-powered assistant for natural language file management, code editing, and server operations. It integrates with 19 AI providers, exposes 47 built-in tools, and operates across all 22 file transfer protocols through a unified backend.

## Supported AI Providers

| Provider | Streaming | Vision | Tool Calling | Thinking |
|----------|-----------|--------|-------------|----------|
| OpenAI | SSE | GPT-4o | Native | o3 reasoning |
| Anthropic | SSE | Claude 3.5+ | Native | Extended thinking |
| Google Gemini | SSE | Gemini 2.0 | Native | -- |
| xAI (Grok) | SSE | Grok Vision | Native | -- |
| OpenRouter | SSE | Varies | Native | Varies |
| Ollama (local) | NDJSON | llava | Native | -- |
| Mistral | SSE | Pixtral | Native | -- |
| Groq | SSE | -- | Native | -- |
| Perplexity | SSE | -- | Text | -- |
| Cohere | SSE | -- | Native | -- |
| Together AI | SSE | -- | Native | -- |
| AI21 Labs | SSE | -- | Native | -- |
| Cerebras | SSE | -- | Native | -- |
| SambaNova | SSE | -- | Native | -- |
| Fireworks AI | SSE | -- | Native | -- |
| Kimi | SSE | -- | Native | -- |
| Qwen | SSE | -- | Native | -- |
| DeepSeek | SSE | -- | Native | DeepSeek-R1 |
| Custom (OpenAI-compatible) | SSE | Configurable | Native/Text | Configurable |

Configure providers in **Settings > AI > Providers**, or browse the Provider Marketplace to add new ones.

## Tool Reference (47 Tools)

### Remote Operations (9 tools)

| Tool | Safety | Description |
|------|--------|-------------|
| `remote_list` | safe | List files in remote directory |
| `remote_read` | safe | Read remote text file (max 5 KB) |
| `remote_info` | safe | Get file/directory metadata |
| `remote_search` | safe | Search files by glob pattern |
| `remote_download` | medium | Download single file |
| `remote_upload` | medium | Upload single file |
| `remote_mkdir` | medium | Create remote directory |
| `remote_rename` | medium | Rename/move remote file |
| `remote_delete` | high | Delete remote file or directory |

### Local File Operations (16 tools)

| Tool | Safety | Description |
|------|--------|-------------|
| `local_list` | medium | List local files |
| `local_read` | medium | Read local text file (max 5 KB) |
| `local_write` | medium | Write text to local file |
| `local_mkdir` | medium | Create local directory |
| `local_rename` | medium | Rename/move local file |
| `local_edit` | medium | Find and replace in local file |
| `local_move_files` | medium | Batch move files to destination |
| `local_batch_rename` | medium | Batch rename (regex/prefix/suffix/sequential) |
| `local_copy_files` | medium | Batch copy files |
| `local_trash` | medium | Move files to system recycle bin |
| `local_file_info` | safe | Get detailed file properties |
| `local_disk_usage` | safe | Calculate directory size recursively |
| `local_find_duplicates` | safe | Find duplicate files via hash |
| `local_search` | medium | Search local files by pattern |
| `local_delete` | high | Delete local file or directory |
| `remote_edit` | medium | Find and replace in remote file (download, edit, upload) |

### Content Inspection (7 tools)

| Tool | Safety | Description |
|------|--------|-------------|
| `local_grep` | medium | Regex search across directory files |
| `local_head` | medium | Read first N lines (max 500) |
| `local_tail` | medium | Read last N lines (max 500) |
| `local_stat_batch` | medium | Metadata for up to 100 paths |
| `local_diff` | safe | Unified diff between two files |
| `local_tree` | medium | Recursive directory tree (max depth 10) |
| `preview_edit` | safe | Preview find/replace without applying |

### Batch Transfer, Archives, Context & Crypto

| Tool | Safety | Description |
|------|--------|-------------|
| `upload_files` | medium | Upload multiple local files to remote |
| `download_files` | medium | Download multiple remote files to local |
| `archive_compress` | medium | Create ZIP/7z/TAR archives (optional AES-256 password) |
| `archive_decompress` | medium | Extract archives with password support |
| `rag_index` | medium | Index directory files with previews (max 200 files) |
| `rag_search` | medium | Full-text search across indexed files |
| `hash_file` | safe | Compute hash (MD5, SHA-1, SHA-256, SHA-512, BLAKE3) |
| `vault_peek` | safe | Inspect AeroVault header without password |

### Application Control, Clipboard & Memory

| Tool | Safety | Description |
|------|--------|-------------|
| `set_theme` | safe | Change app theme (light/dark/tokyo/cyber) |
| `app_info` | safe | Get app state, connection info, version |
| `sync_control` | medium | Start/stop/status AeroSync service |
| `clipboard_read` | medium | Read text from system clipboard |
| `clipboard_write` | medium | Write text to system clipboard |
| `agent_memory_write` | medium | Save persistent note across sessions |

### Server Management (2 tools)

| Tool | Safety | Description |
|------|--------|-------------|
| `server_list_saved` | safe | List saved server profiles (credentials never exposed) |
| `server_exec` | high | Execute operation on any saved server |

`server_exec` is a uniquely powerful tool. AeroAgent can autonomously connect to any saved server and perform 10 operations (ls, cat, get, put, mkdir, rm, mv, stat, find, df) without credentials ever being exposed to the AI model. Passwords are resolved from the encrypted vault entirely in Rust. The AI sees only server names and results.

### Shell Execution (1 tool)

| Tool | Safety | Description |
|------|--------|-------------|
| `shell_execute` | high | Execute shell command (30s timeout, 1 MB output limit, pattern denylist) |

## Safety System

### Three Danger Levels

| Level | Behavior | Count |
|-------|----------|-------|
| **safe** | Auto-execute without user confirmation | 14 tools |
| **medium** | Show approval modal, user must confirm | 27 tools |
| **high** | Explicit confirmation with danger warning | 6 tools |

### Path Validation

All file operations validate against null bytes, `..` traversal, symlink resolution, 4096-character path limit, and a system path denylist (`/proc`, `/sys`, `/dev`, `/boot`, `/root`, `/etc/shadow`, `~/.ssh`, `~/.gnupg`, `~/.aws`, `/run/secrets`).

### Shell Command Denylist

`shell_execute` blocks dangerous patterns: `rm -rf /`, `mkfs`, `dd of=/dev/`, `shutdown`, `reboot`, fork bombs, `chmod 777 /`, `sudo`, `eval`, `curl | sh`, and 20+ additional patterns. Shell meta-characters (`|`, `;`, `` ` ``, `$`, `&`) are also blocked.

## Execution Pipeline

### DAG-Based Parallel Execution

When the AI requests multiple tool calls, AeroAgent builds a Directed Acyclic Graph based on path dependencies. Read-only tools on different paths execute in parallel; mutating tools on shared paths are serialized via topological sort (Kahn's algorithm).

### Multi-Step Autonomous Execution

AeroAgent supports multi-step workflows: up to 10 steps by default, 50 in Extreme Mode. After each step, the AI decides whether to respond or call more tools. A circuit breaker halts execution on consecutive errors.

### Error Recovery

8 strategies with automatic analysis: not-found suggests `rag_search`, permission-denied suggests listing parent, rate limits (429/503) retry with exponential backoff, timeouts suggest smaller scope, connection loss prompts reconnection, and large files suggest chunked approaches.

## Context Intelligence

AeroAgent auto-detects project type from 10 marker files (Cargo.toml, package.json, pom.xml, requirements.txt, go.mod, Gemfile, composer.json, *.csproj, CMakeLists.txt, build.gradle) and injects relevant context. The system prompt is dynamically composed from base personality, provider profile, connection context, tool definitions, project context, RAG results, and persistent agent memory. A sliding-window token budget (70% of provider max) with automatic summarization manages context size.

## Plugin System

Extend AeroAgent with custom tools via JSON manifests and shell scripts. Plugins are discovered from a GitHub-based registry, verified with SHA-256 integrity at install and before each execution, and support event-driven hooks (file:created, transfer:complete, sync:complete). Manage plugins in **AI Settings > Plugins**.

## Macro System

Chain multiple tools into reusable workflows with `{{variable}}` templates, single-pass variable expansion (injection-safe), and a maximum of 20 steps. Configure macros in **AI Settings > Macros**.

## Chat Features

- **Streaming markdown** with finalized/streaming segments and syntax highlighting
- **Code block actions** — Copy, Apply, Diff, Run buttons on every code block
- **Thinking visualization** with token count and duration
- **Prompt templates** — 15 built-in, activated with `/` prefix
- **Chat search** (Ctrl+F) with role filter and keyboard navigation
- **Conversation branching** — fork, switch, delete alternative approaches
- **Chat history** in SQLite with FTS5 full-text search and retention policies
- **Export** to Markdown or JSON
- **Cost tracking** per message with monthly budget limits
- **Vision/multimodal** — drag images into chat or paste from clipboard

## Extreme Mode

Available only in Cyber theme. Auto-approves all tool calls for fully autonomous execution with a 50-step limit (vs 10 default). A circuit breaker on consecutive errors provides a safety net.

> **Warning:** Extreme Mode auto-approves all tool calls including destructive operations like `remote_delete`, `local_delete`, `shell_execute`, and `server_exec`. Use only when you fully trust the AI model.

## Architecture

AeroAgent operates in three modes through a shared trait abstraction layer (`ai_core/`):

| Trait | Purpose |
|-------|---------|
| `EventSink` | Abstract event emission (Tauri `app.emit()` vs CLI stdout) |
| `CredentialProvider` | Vault-based credential access without exposing passwords |
| `RemoteBackend` | Protocol-agnostic remote operations (22 protocols) |

This enables GUI mode (Tauri events), CLI mode (stdout/stderr), and Orchestration mode (JSON-RPC 2.0 over stdin/stdout). MCP compatibility maps naturally: tools become MCP Tools, RAG/vault become Resources, macros/templates become Prompts, and multi-step execution becomes Sampling.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Ask AeroAgent from code editor |
| `Ctrl+L` | Focus chat input |
| `Shift+N` | New conversation |
| `Ctrl+F` | Search in chat |
| `Shift+E` | Export conversation |
