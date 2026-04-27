# AeroAgent

AeroAgent is AeroFTP's AI-powered assistant for natural language file management, code editing, and server operations. It integrates with **24 AI providers**, exposes **52 built-in tools**, and operates across local files plus the AeroFTP remote provider backends (7 transport protocols + 20+ native providers) through a single unified `ai_core` backend &mdash; the same one that powers the GUI, the CLI (`aeroftp-cli agent`), and the native MCP server.

## Welcome Screen

When you first open AeroAgent (via the AeroTools panel or `Ctrl+Shift+A`), the welcome screen presents a 3x3 capability grid showing what AeroAgent can do.

![AeroAgent welcome screen with capability grid](/images/aeroagent-welcome.png)
<!-- SCREENSHOT: AeroAgent welcome screen showing the 3x3 grid (Files, Code, Search, Archives, Shell, Vault, Sync, Context, Vision) with Lucide icons, plus clickable quick prompts at the bottom -->

The nine capabilities displayed are:

| Capability | Description |
| ---------- | ----------- |
| **Files** | Create, move, rename, copy, and delete files locally or remotely |
| **Code** | Read, write, edit, and diff source code files |
| **Search** | Find files by name, search content with regex, locate duplicates |
| **Archives** | Compress and extract ZIP, 7z, TAR archives |
| **Shell** | Execute shell commands with output capture |
| **Vault** | Inspect AeroVault containers and compute file hashes |
| **Sync** | Start, stop, and monitor AeroSync operations |
| **Context** | Auto-detect project type and inject relevant context |
| **Vision** | Analyze images dragged into chat or pasted from clipboard |

Below the grid, **quick prompts** provide one-click starting points. These are context-aware: when connected to a server, prompts reference remote operations; in AeroFile (local-only) mode, prompts focus on local file management.

If no AI provider API key is configured, a setup banner guides you to **Settings > AI > Providers**.

## Chat Interface

The main chat interface provides a streaming markdown conversation with the AI, including tool execution results, code blocks with action buttons, and thinking visualization.

![AeroAgent chat with tool execution and code blocks](/images/aeroagent-chat.png)
<!-- SCREENSHOT: AeroAgent chat showing a multi-turn conversation with a tool call result (e.g., local_list), a code block with Copy/Apply/Diff/Run buttons, and a thinking block -->

### Streaming Markdown

Messages render incrementally as the AI generates them. The renderer uses a dual-segment architecture:

- **FinalizedSegment** (`React.memo`) - completed paragraphs, code blocks, and lists that never re-render
- **StreamingSegment** - the currently generating text that updates in real-time

This approach provides smooth streaming without the performance penalty of re-rendering the entire message on every token.

### Code Block Actions

Every code block in a response includes action buttons:

- **Copy** - copy the code to the clipboard
- **Apply** - write the code to a file (prompts for path if not obvious from context)
- **Diff** - show a side-by-side diff against the current file contents
- **Run** - execute the code block as a shell command (with approval)

### Thinking Visualization

When using providers that support reasoning (Anthropic extended thinking, OpenAI o3 reasoning, DeepSeek-R1), a collapsible **ThinkingBlock** displays the model's internal reasoning with token count and duration metrics.

## Tool Approval

When AeroAgent calls a tool rated as **medium** or **high** danger, an approval dialog appears showing the tool name, parameters, and danger level.

![Tool approval dialog](/images/aeroagent-tools.png)
<!-- SCREENSHOT: Tool approval dialog showing a medium-danger tool call (e.g., local_write) with the tool name, parameters preview, and Approve/Reject buttons -->

For batch tool calls, a **BatchToolApproval** dialog presents all pending tools at once, allowing you to approve or reject each individually or approve all.

## AI Settings

Configure providers, models, and behavior in the AI Settings panel, accessible from **Settings > AI** or the gear icon in the AeroAgent header.

![AI Settings panel with provider marketplace](/images/aeroagent-settings.png)
<!-- SCREENSHOT: AI Settings panel showing the Provider tab with the marketplace grid, model selector, and temperature/token controls -->

The settings panel includes seven tabs:

1. **Provider** - select and configure AI providers, browse the Provider Marketplace
2. **Model** - choose the model, set temperature, max tokens, and thinking budget
3. **Tools** - enable/disable individual tools, set default approval behavior
4. **System Prompt** - edit the base system prompt with a toggle and textarea
5. **Macros** - create and manage tool chain macros with `{{variable}}` templates
6. **Plugins** - browse, install, and manage plugins from the GitHub-based registry
7. **History** - configure retention policies, search chat history, view usage stats

## Supported AI Providers (24)

| Provider | Streaming | Vision | Tool Calling | Thinking |
| -------- | --------- | ------ | ------------ | -------- |
| OpenAI | SSE | GPT-4o | Native | o3 reasoning |
| Anthropic | SSE | Claude 3.5+ | Native | Extended thinking |
| Google Gemini | SSE | Gemini 2.0 | Native | -- |
| xAI (Grok) | SSE | Grok Vision | Native | -- |
| OpenRouter | SSE | Varies | Native | Varies |
| Ollama (local) | NDJSON | llava | Native | -- |
| Mistral | SSE | Pixtral | Native | -- |
| Groq | SSE | -- | Native | -- |
| Perplexity | SSE | -- | Text | -- |
| Cohere | SSE | Command A | Native | Command A Reasoning |
| Together AI | SSE | -- | Native | -- |
| AI21 Labs | SSE | -- | Native | -- |
| Cerebras | SSE | -- | Native | -- |
| SambaNova | SSE | -- | Native | -- |
| Fireworks AI | SSE | -- | Native | -- |
| Kimi | SSE | -- | Native | -- |
| Qwen | SSE | -- | Native | -- |
| DeepSeek | SSE | -- | Native | DeepSeek-R1 |
| **NVIDIA NIM** (v3.6.2) | SSE | -- | Native | -- |
| **Z.AI (Zhipu GLM)** (v3.6.2) | SSE | GLM-4V-Plus | Native | -- |
| **Yi (01.AI)** (v3.6.2) | SSE | Yi-Vision | Native | -- |
| **Hyperbolic** (v3.6.2) | SSE | Varies | Native | -- |
| **Novita AI** (v3.6.2) | SSE | Varies | Native | -- |
| Custom (OpenAI-compatible) | SSE | Configurable | Native / Text | Configurable |

The five v3.6.2 additions (NVIDIA, Z.AI, Yi, Hyperbolic, Novita) are all OpenAI-compatible at `/chat/completions` and ride the existing `openai_compat::call` dispatch arm &mdash; no new adapter code, branded SVG icons in the marketplace.

Configure providers in **Settings > AI > Providers**, or browse the **Provider Marketplace** to discover and add new ones. The marketplace presents providers in a searchable grid organized by category with feature badges and pricing tiers.

### Ollama Integration

For local AI models, AeroAgent includes Ollama-specific features:

- **Model auto-detection** via `GET /api/tags` with a "Detect" button in AI Settings
- **Pull model from UI** with NDJSON streaming progress bar
- **GPU monitoring** via `ollama_list_running` showing VRAM usage
- **8 model family profiles** with `detectOllamaModelFamily()` for optimized prompting

## Tool Reference (52 Tools)

> Since v3.6.3, all 52 tools flow through a single **unified tool dispatcher** (`ai_core::tools::dispatch_tool`) shared by GUI, CLI (`aeroftp-cli agent`) and the MCP server. Per-area handler modules (`local_tools`, `system_tools`, `remote_tools`, `agent_tools`) host the canonical implementations and per-surface `ToolCtx` impls bridge to the runtime. Result: identical behavior across surfaces, no drift between three parallel match statements.

### Remote Operations (9 tools)

| Tool | Safety | Description |
| ---- | ------ | ----------- |
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
| ---- | ------ | ----------- |
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
| ---- | ------ | ----------- |
| `local_grep` | medium | Regex search across directory files |
| `local_head` | medium | Read first N lines (max 500) |
| `local_tail` | medium | Read last N lines (max 500) |
| `local_stat_batch` | medium | Metadata for up to 100 paths |
| `local_diff` | safe | Unified diff between two files |
| `local_tree` | medium | Recursive directory tree (max depth 10) |
| `preview_edit` | safe | Preview find/replace without applying |

### Batch Transfer, Archives, Context and Crypto

| Tool | Safety | Description |
| ---- | ------ | ----------- |
| `upload_files` | medium | Upload multiple local files to remote |
| `download_files` | medium | Download multiple remote files to local |
| `archive_compress` | medium | Create ZIP/7z/TAR archives (optional AES-256 password) |
| `archive_decompress` | medium | Extract archives with password support |
| `rag_index` | medium | Index directory files with previews (max 200 files) |
| `rag_search` | medium | Full-text search across indexed files |
| `hash_file` | safe | Compute hash (MD5, SHA-1, SHA-256, SHA-512, BLAKE3) |
| `vault_peek` | safe | Inspect AeroVault header without password |

### Application Control, Clipboard and Memory

| Tool | Safety | Description |
| ---- | ------ | ----------- |
| `set_theme` | safe | Change app theme (light/dark/tokyo/cyber) |
| `app_info` | safe | Get app state, connection info, version |
| `sync_control` | medium | Start/stop/status AeroSync service |
| `clipboard_read` | medium | Read text from system clipboard |
| `clipboard_write` | medium | Write text to system clipboard |
| `agent_memory_write` | medium | Save persistent note across sessions |

### Server Management (2 tools)

| Tool | Safety | Description |
| ---- | ------ | ----------- |
| `server_list_saved` | safe | List saved server profiles (credentials never exposed) |
| `server_exec` | high | Execute operation on any saved server |

`server_exec` is a uniquely powerful tool. AeroAgent can autonomously connect to any saved server and perform 10 operations (ls, cat, get, put, mkdir, rm, mv, stat, find, df) without credentials ever being exposed to the AI model. Passwords are resolved from the encrypted vault entirely in Rust. The AI sees only server names and results.

### Shell Execution (1 tool)

| Tool | Safety | Description |
| ---- | ------ | ----------- |
| `shell_execute` | high | Execute shell command (30s timeout, 1 MB output limit, pattern denylist) |

## Safety System

### Three Danger Levels

| Level | Behavior | Count |
| ----- | -------- | ----- |
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

### Duplicate Call Prevention

An `executedToolSignaturesRef` deduplication mechanism prevents models (particularly Llama and other open-source models) from repeating identical tool calls within a multi-step execution run.

### Error Recovery

8 strategies with automatic analysis: not-found suggests `rag_search`, permission-denied suggests listing parent, rate limits (429/503) retry with exponential backoff, timeouts suggest smaller scope, connection loss prompts reconnection, and large files suggest chunked approaches.

## Context Intelligence

AeroAgent auto-detects project type from 10 marker files (Cargo.toml, package.json, pom.xml, requirements.txt, go.mod, Gemfile, composer.json, *.csproj, CMakeLists.txt, build.gradle) and injects relevant context. The system prompt is dynamically composed from:

1. **Base personality** - AeroAgent identity, tone, protocol expertise
2. **Provider profile** - per-provider optimization (e.g., Anthropic cache hints, OpenAI structured outputs)
3. **Connection context** - AeroCloud vs Server vs AeroFile mode, current host/port/user
4. **Tool definitions** - all 52 tools with schemas
5. **Project context** - detected language, framework, file dependency graph
6. **RAG results** - indexed file previews and search hits
7. **Agent memory** - persistent notes from previous sessions (`.aeroagent` file)

A sliding-window token budget (70% of provider max) with automatic summarization manages context size. The `TokenBudgetIndicator` component shows real-time token usage with three budget modes.

## Plugin System

Extend AeroAgent with custom tools via JSON manifests and shell scripts. Plugins are discovered from a [GitHub-based registry](https://github.com/axpnet/aeroftp-plugins), verified with SHA-256 integrity at install and before each execution, and support event-driven hooks (file:created, transfer:complete, sync:complete). Manage plugins in **AI Settings > Plugins**.

To create your own plugin, see the [Plugin Contributing Guide](https://github.com/axpnet/aeroftp-plugins/blob/main/CONTRIBUTING.md).

The Plugin Browser UI provides three tabs:

- **Installed** - manage currently installed plugins
- **Browse** - search the registry for new plugins
- **Updates** - check for and apply plugin updates

## Macro System

Chain multiple tools into reusable workflows with `{{variable}}` templates, single-pass variable expansion (injection-safe), and a maximum of 20 steps. Configure macros in **AI Settings > Macros**.

## Chat Features

- **Streaming markdown** with finalized/streaming segments and syntax highlighting
- **Code block actions** - Copy, Apply, Diff, Run buttons on every code block
- **Thinking visualization** with token count and duration
- **Prompt templates** - 15 built-in, activated with `/` prefix
- **Chat search** (Ctrl+F) with role filter and keyboard navigation
- **Conversation branching** - fork, switch, delete alternative approaches
- **Chat history** in SQLite with FTS5 full-text search and retention policies (7/30/90/180/365/unlimited days)
- **Export** to Markdown or JSON
- **Cost tracking** per message with monthly budget limits per provider
- **Vision/multimodal** - drag images into chat or paste from clipboard
- **Drag and drop** - drag files from the file manager into the chat area for analysis
- **Context menu integration** - right-click files and select "Ask AeroAgent" to start a conversation about them

## Extreme Mode

Available only in Cyber theme. Auto-approves all tool calls for fully autonomous execution with a 50-step limit (vs 10 default). A circuit breaker on consecutive errors provides a safety net.

> **Warning:** Extreme Mode auto-approves all tool calls including destructive operations like `remote_delete`, `local_delete`, `shell_execute`, and `server_exec`. Use only when you fully trust the AI model.

## Architecture

AeroAgent operates in three modes through a shared trait abstraction layer (`ai_core/`):

| Trait | Purpose |
| ----- | ------- |
| `EventSink` | Abstract event emission (Tauri `app.emit()` vs CLI stdout) |
| `CredentialProvider` | Vault-based credential access without exposing passwords |
| `RemoteBackend` | Protocol-agnostic remote operations over the AeroFTP provider backends |

This enables GUI mode (Tauri events), CLI mode (stdout/stderr), and Orchestration mode (JSON-RPC 2.0 over stdin/stdout). MCP compatibility maps naturally: tools become MCP Tools, RAG/vault become Resources, macros/templates become Prompts, and multi-step execution becomes Sampling.

## Running AeroAgent from the CLI

```bash
# One-shot prompt
aeroftp-cli agent --provider ollama --message "list saved servers"

# Orchestration mode (JSON-RPC over stdin/stdout)
aeroftp-cli agent --orchestrate

# MCP server mode (full alias)
aeroftp-cli agent --mcp

# MCP server mode (top-level shortcut, used by the VS Code extension)
aeroftp-cli mcp
```

The top-level `aeroftp-cli mcp` shortcut (added in v3.5.4) is the argv used by the official [`axpdev-lab.aeroftp-mcp`](https://marketplace.visualstudio.com/items?itemName=axpdev-lab.aeroftp-mcp) VS Code extension. See [MCP Overview](/mcp/overview) for the full integration guide.

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| `Ctrl+Shift+A` | Ask AeroAgent from code editor |
| `Ctrl+L` | Focus chat input |
| `Shift+N` | New conversation |
| `Ctrl+F` | Search in chat |
| `Shift+E` | Export conversation |
