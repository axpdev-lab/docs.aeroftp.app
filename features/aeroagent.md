---
description: "An AI assistant for file management, code editing and server operations, across local files and every remote backend."
---

# AeroAgent

AeroAgent is AeroFTP's assistant for natural-language file management, code editing and server operations. In AeroFTP 4.2.5 it supports built-in provider presets, local models and custom endpoints. GUI AeroAgent, the CLI agent and the native MCP server share backend components but expose different tool catalogs and runtime capabilities. Query `aeroftp-cli inventory --json` for CLI/MCP inventory and use the GUI's tool settings for desktop tools.

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

When AeroAgent calls a tool rated as **medium** or **high** danger, an approval dialog appears showing the tool name, parameters, and danger level. Since AeroAgent 1.5 (AeroFTP v4.2.1) approvals open in a **dedicated AeroFTP window** instead of the system message box: only that window can grant an approval, and it holds its own minimal capability.

![Tool approval dialog](/images/aeroagent-tools.png)
<!-- SCREENSHOT: Tool approval dialog showing a medium-danger tool call (e.g., local_write) with the tool name, parameters preview, and Approve/Reject buttons -->

A tool can be **allowed for the rest of the chat** (unticked by default), so approving three folders takes one approval instead of three. The option is refused for every high-danger tool and any tool the app does not know, and it is never offered for delete, trash, shell or extraction. Approvals **fail closed**: the approval window is never skipped for delete, trash, shell, extraction, a mutating server command or a sync start.

For batch tool calls, a **BatchToolApproval** dialog presents all pending tools at once, allowing you to approve or reject each individually or approve all.

## AeroAgent 1.5 (AeroFTP v4.2.1)

- **Provider-native reasoning continuations**: reasoning models keep their provider-native state across tool calls (OpenAI Responses, Anthropic content blocks, compatible Chat), with scope checks so a changed provider, model or endpoint cannot replay another turn's state.
- **Exact capability discovery**: NVIDIA and Alibaba Model Studio capabilities are discovered exactly, and public OpenRouter metadata enriches its models. Custom providers can be added more than once and named.
- **Stop reaches the tools**: the Send button becomes **Stop** during generation, and Stop cancels both the follow-up request of a multi-step answer and the tools still running for that turn.
- **Progressive tool loading**: each turn starts with four core tools and loads more through a local tool search that never grants approval.
- `aeroftp-cli agent --provider anthropic` reaches the right endpoint again, Ctrl-C exits 130 with the partial answer, and provider errors reach the user bounded and with keys removed.

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

## AI Providers

Configure providers in **Settings > AI > Providers**, or use the Provider Marketplace. Presets include OpenAI, Amazon Bedrock, Anthropic, Gemini, xAI, OpenRouter, Ollama, Mistral, Groq, Perplexity, Cohere, Together AI, AI21, Cerebras, SambaNova, Fireworks, Kimi, Alibaba Model Studio, DeepSeek, NVIDIA NIM, Z.AI, Yi, Hyperbolic, Novita, Kilo Gateway and custom compatible endpoints.

Streaming, tool calling, images and reasoning depend on the selected model and API, not just the provider name. Model lists and pricing can change independently of an AeroFTP release; use discovery and the model settings instead of assuming an older model example represents the provider's current features. Reasoning continuations preserve provider-native state where supported, with provider/model/endpoint scope checks.

### Ollama Integration

For local AI models, AeroAgent includes Ollama-specific features:

- **Model auto-detection** via `GET /api/tags` with a "Detect" button in AI Settings
- **Pull model from UI** with NDJSON streaming progress bar
- **GPU monitoring** via `ollama_list_running` showing VRAM usage
- **8 model family profiles** with `detectOllamaModelFamily()` for optimized prompting

## Tool Reference

The GUI tool registry includes local and remote file tools, coding workflows and semantic GUI control. Additional plugin, macro and connected MCP tools appear only when configured and available. Progressive tool loading starts with a small core and loads relevant definitions through search; discovering a tool does not approve it.

| Area | Desktop tools and behavior |
| --- | --- |
| Remote files | `remote_list`, `remote_read`, `remote_info`, `remote_search`, upload/download, mkdir, rename, edit and delete |
| Local files | List/read/write/search, mkdir, rename, edit, batch rename, move/copy, trash/delete, metadata, disk usage and duplicates |
| Inspection | Grep, head, tail, batch stat, diff, tree, edit preview, file hash and AeroVault header inspection |
| Transfer planning | `generate_transfer_plan`, `sync_preview`, `upload_files`, `download_files`, `cross_profile_transfer` |
| Remote maintenance | Hashsum, head/tail/tree, quota, preflight/reconcile, speed, touch, cleanup, dedupe, versions and trash |
| Coding | Workspace checkpoints and restore, structured patches, git status/diff/stage/commit/log/show, curated checks, verification, diagnostics and search |
| Archives | Compress and extract supported archive formats |
| Context and memory | RAG index/search and persistent agent notes |
| App and clipboard | App info, theme, sync control, clipboard read/write |
| Visible GUI | `gui_state`, `gui_wait`, `gui_run` |
| Saved servers | `server_list_saved`, `server_exec` |
| Measurements and recovery | Benchmark, DAG transfer telemetry and error-correction sidecar generation/verification/repair |
| Shell | `shell_execute`, with timeout, bounded output and backend command checks |

Remote tools may use the current connection or an explicit saved server where their schema allows it. Backend capability and surface checks still apply. For exact fields and danger levels, inspect the tool settings/schema rather than assuming the CLI agent or MCP accepts the same arguments.

`server_exec` accepts only `ls`, `cat`, `stat`, `find` and `df`. It refuses those unsupported operations; use dedicated upload, download, mkdir, rename and delete tools. GUI AeroAgent calls pass through its backend approval gate; CLI and inbound MCP calls use their respective caller or host authorization policies. Credentials resolve inside Rust and are not returned to the model.

### Visible GUI Control

Use GUI tools when the user asks to watch actions in the app. They call the ordinary navigation, selection, refresh, connection, disconnect, Stop and bounded Settings handlers. Connections require an exact saved `profile_id`. The snapshot is redacted; arbitrary clicks, scripts, unlocking, credential editing and file-writing GUI intents are excluded.

The human can interrupt through Stop, Pause or ordinary input. Refused paused actions need a fresh request after Resume. Settings access is restricted to the owned allowlisted surface; a sensitive or human-owned dialog blocks it. External CLI and MCP clients do not yet expose this GUI bridge, and there is no `aeroftp-cli gui` command. See the public [agent integration guide](https://github.com/axpdev-lab/aeroftp/blob/main/AGENTS.md) for the closed action catalog.

## Safety System

GUI tools carry safe, medium or high labels. The selected agent mode controls frontend automation; sensitive backend actions still require their dedicated approval. Session approvals cannot authorize high-danger or unknown tools, delete, trash, shell, extraction, mutating server commands or sync starts.

| GUI mode | Frontend behavior | Step limit |
| --- | --- | --- |
| Safe | Automatically runs safe tools | 5 |
| Normal | Safe tools plus eligible session approvals | 10 |
| Expert | Also automatically runs medium tools; protected operations still require approval | 25 |
| Extreme | Automatically accepts frontend tool requests; backend approval remains for protected operations | 50 |

The CLI agent's `--auto-approve safe/medium/high/all` is a separate policy, and MCP clients control their own permissions. See [Agent Orchestration](/features/agent-orchestration#auto-approval-levels).

### Path Validation

All file operations validate against null bytes, `..` traversal, symlink resolution, 4096-character path limit, and a system path denylist (`/proc`, `/sys`, `/dev`, `/boot`, `/root`, `/etc/shadow`, `~/.ssh`, `~/.gnupg`, `~/.aws`, `/run/secrets`).

### Shell Command Denylist

`shell_execute` blocks dangerous patterns: `rm -rf /`, `mkfs`, `dd of=/dev/`, `shutdown`, `reboot`, fork bombs, `chmod 777 /`, `sudo`, `eval`, `curl | sh`, and 20+ additional patterns. Shell meta-characters (`|`, `;`, `` ` ``, `$`, `&`) are also blocked.

## Execution Pipeline

### DAG-Based Parallel Execution

When the AI requests multiple tool calls, AeroAgent builds a Directed Acyclic Graph based on path dependencies. Read-only tools on different paths execute in parallel; mutating tools on shared paths are serialized via topological sort (Kahn's algorithm).

### Multi-Step Autonomous Execution

AeroAgent supports multi-step workflows with mode-specific step limits: 10 by default and 50 in Extreme Mode. After each step, the AI decides whether to respond or call more tools. A circuit breaker halts execution on consecutive errors.

### Duplicate Call Prevention

An `executedToolSignaturesRef` deduplication mechanism prevents models (particularly Llama and other open-source models) from repeating identical tool calls within a multi-step execution run.

### Error Recovery

8 strategies with automatic analysis: not-found suggests `rag_search`, permission-denied suggests listing parent, rate limits (429/503) retry with exponential backoff, timeouts suggest smaller scope, connection loss prompts reconnection, and large files suggest chunked approaches.

## Context Intelligence

AeroAgent auto-detects project type from 10 marker files (Cargo.toml, package.json, pom.xml, requirements.txt, go.mod, Gemfile, composer.json, *.csproj, CMakeLists.txt, build.gradle) and injects relevant context. The system prompt is dynamically composed from:

1. **Base personality** - AeroAgent identity, tone, protocol expertise
2. **Provider profile** - per-provider optimization (e.g., Anthropic cache hints, OpenAI structured outputs)
3. **Connection context** - AeroCloud vs Server vs AeroFile mode, current host/port/user
4. **Tool definitions** - the tools exposed for the current turn, with schemas
5. **Project context** - detected language, framework, file dependency graph
6. **RAG results** - indexed file previews and search hits
7. **Agent memory** - persistent notes from previous sessions (SQLite storage)

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

Available in Cyber and True Dark themes. It accepts frontend tool requests automatically and raises the step limit to 50. Protected mutations retain backend approval, and a circuit breaker stops a sequence of consecutive errors.

Review the requested operations and the backend approval prompt before granting access. Extreme Mode does not remove backend permission checks.

## Architecture

AeroAgent operates in three modes through a shared trait abstraction layer (`ai_core/`):

| Trait | Purpose |
| ----- | ------- |
| `EventSink` | Abstract event emission (Tauri `app.emit()` vs CLI stdout) |
| `CredentialProvider` | Vault-based credential access without exposing passwords |
| `RemoteBackend` | Protocol-agnostic remote operations over the AeroFTP provider backends |

This enables GUI mode (Tauri events), CLI mode (stdout/stderr), and Orchestration mode (JSON-RPC 2.0 over stdin/stdout). The native MCP server has its own remote-focused tool/resource/prompt registry; it does not expose every GUI tool, RAG index or macro, and it does not perform the GUI agent loop through MCP Sampling.

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
