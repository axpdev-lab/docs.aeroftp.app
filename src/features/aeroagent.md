# AeroAgent

AeroAgent is AeroFTP's AI-powered assistant for natural language file management, code editing, and server operations. It integrates with 19 AI providers and exposes 47 tools spanning local files, remote servers, archives, and system commands.

## Supported AI Providers

| Provider | Streaming | Vision | Tool Calling | Thinking |
|----------|-----------|--------|-------------|----------|
| OpenAI | Yes | Yes | Native | o3 reasoning |
| Anthropic | Yes | Yes | Native | Extended thinking |
| Google Gemini | Yes | Yes | Native | Yes |
| xAI (Grok) | Yes | Yes | Native | -- |
| OpenRouter | Yes | Varies | Native | Varies |
| Ollama (local) | Yes | Yes | Native | -- |
| Mistral | Yes | -- | Native | -- |
| Groq | Yes | -- | Native | -- |
| Perplexity | Yes | -- | Text | -- |
| Cohere | Yes | -- | Native | -- |
| Together AI | Yes | -- | Native | -- |
| AI21 Labs | Yes | -- | Native | -- |
| Cerebras | Yes | -- | Native | -- |
| SambaNova | Yes | -- | Native | -- |
| Fireworks AI | Yes | -- | Native | -- |
| Kimi | Yes | -- | Native | -- |
| Qwen | Yes | -- | Native | -- |
| DeepSeek | Yes | -- | Native | -- |
| Custom (OpenAI-compatible) | Yes | -- | Native | -- |

Configure providers in **Settings > AI > Providers**, or use the Provider Marketplace to browse and add new ones.

## Tool Categories

AeroAgent's 47 tools are organized into functional groups:

- **File management** (12 tools) — move, copy, rename, trash, info, disk usage, find duplicates, search, head, tail, stat, tree
- **File editing** (4 tools) — write, edit (find & replace), local and remote edit
- **Directories** (2 tools) — create local and remote directories
- **Transfers** (4 tools) — upload, download, batch upload, batch download
- **Archives** (2 tools) — compress and decompress (ZIP, 7z, TAR)
- **Search** (3 tools) — grep (regex in files), RAG index, RAG search
- **Shell** (1 tool) — `shell_execute` with backend denylist enforcement
- **Server operations** (2 tools) — list saved servers, execute commands on remote servers
- **Diff & clipboard** (3 tools) — unified diff, clipboard read, clipboard write
- **Context** (2 tools) — agent memory, delete operations
- **Other** (12 tools) — provider-specific operations via StorageProvider trait

## Execution Modes

| Mode | Auto-approve | Max Steps | Description |
|------|-------------|-----------|-------------|
| Safe | No | 10 | Every tool call requires approval |
| Medium | Low-risk only | 10 | Read-only tools auto-approved |
| High | Most tools | 10 | Only destructive tools need approval |
| Extreme | All tools | 50 | Fully autonomous (Cyber theme only) |

> **Warning:** Extreme Mode auto-approves all tool calls including destructive operations. Use only when you fully trust the AI model's judgment.

## Key Features

- **Streaming markdown** — responses render incrementally with syntax-highlighted code blocks
- **Code actions** — Copy, Apply, Diff, and Run buttons on every code block
- **Conversation branching** — fork conversations to explore alternative approaches
- **Chat search** — Ctrl+F overlay with role filtering and keyboard navigation
- **Prompt templates** — 15 built-in templates activated with `/` prefix
- **Agent memory** — persistent `.aeroagent` file for cross-session context
- **Vision/multimodal** — drag images into chat or paste from clipboard for analysis
- **Cost tracking** — per-message token count and cost, monthly budget limits
- **Context intelligence** — auto-detects project type (10 languages) and file dependencies
- **Plugin system** — extend AeroAgent with custom tools via JSON manifest + shell scripts

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` | Ask AeroAgent from code editor |
| `Ctrl+L` | Focus chat input |
| `Shift+N` | New conversation |
| `Ctrl+F` | Search in chat |

## Ollama Integration

For local AI models, AeroAgent auto-detects installed Ollama models via `GET /api/tags`. You can pull new models directly from the AI Settings panel with a streaming progress bar. GPU utilization is monitored via the Ollama GPU Monitor widget.
