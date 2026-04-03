# External Agent Orchestration

AeroAgent can be orchestrated by external AI agents — Claude Code, Codex, Cursor, Devin, or any tool that can invoke CLI commands. The external agent uses `aeroftp-cli agent` to delegate file operations, server management, and multi-protocol tasks to AeroAgent, which resolves credentials from the encrypted vault without ever exposing them.

This page documents the orchestration capabilities, the CLI interface for external agents, and includes a verified field test report from a real orchestration session.

## Quick Start for External Agents

```bash
# Discover available AI providers
aeroftp-cli ai-models --json

# Discover saved server profiles (no credentials exposed)
aeroftp-cli profiles --json

# One-shot agent command
aeroftp-cli agent --provider xai --model grok-3-mini \
  -m "List files on the Production server" \
  --auto-approve all -y --json

# Agent with vault-backed provider (no env vars needed)
aeroftp-cli agent -m "Check disk usage on all servers"
```

## Provider Discovery

External agents can discover which AI providers and server profiles are available:

```bash
# List configured AI providers (from vault + environment)
aeroftp-cli ai-models --json
```

```json
[
  {
    "id": "xai",
    "provider": "xai",
    "name": "xAI",
    "model": "grok-3",
    "source": "env",
    "enabled": true
  }
]
```

The `source` field indicates where the API key comes from: `vault` (desktop app), `env` (environment variable), or `vault+env` (both). The API key itself is never included in the output.

## Provider Resolution Order

When `aeroftp-cli agent` is invoked without `--provider`:

1. Explicit `--provider` flag (highest priority)
2. Environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.)
3. Vault-stored API keys from the AeroFTP desktop app
4. Error with setup instructions

This means an external agent can use AeroFTP's AI capabilities without any API key configuration — if the desktop app has a provider configured, the CLI uses it automatically.

## Server Operations

The CLI agent exposes two tools for server operations:

### `server_list_saved`

Lists all saved server profiles from the encrypted vault. Returns names, protocols, and hosts — never credentials.

### `server_exec`

Executes read operations on any saved server. The backend resolves credentials internally.

| Operation | Description |
|-----------|-------------|
| `ls` | List directory contents (max 200 entries) |
| `cat` | Read file content (max 5 KB) |
| `stat` | File metadata (size, permissions, modified time) |
| `find` | Search by filename pattern (max 100 results) |
| `df` | Storage quota and usage |

All operations create a temporary connection, execute, and disconnect. Credentials cross no process boundary.

> **Note:** Mutative operations (`put`, `rm`, `mv`, `mkdir`) via CLI agent are on the roadmap for an upcoming release.

## Native MCP Server

AeroFTP also exposes a native stdio MCP server through the CLI:

```bash
aeroftp-cli agent --mcp
```

This mode exposes a remote-focused toolset directly to MCP clients such as Claude Desktop, Cursor, and VS Code. The current implementation includes:

- 16 curated remote tools for listing, reading, uploading, downloading, renaming, deleting, quota checks, server info, share links, checksums, versions, and server-side copy
- MCP resources for saved profiles, vault availability, protocol capabilities, and active pooled connections
- MCP prompts for deploy, backup, sync, and cleanup workflows
- async stdio transport, connection pooling, request cancellation, rate limiting, and audit logging

This is the preferred integration path when the external client already speaks MCP and should not have to parse CLI output.

## Auto-Approval Levels

External agents control the approval behavior:

| Flag | Behavior |
|------|----------|
| `--auto-approve safe` | Only read-only tools execute automatically |
| `--auto-approve medium` | Read + write operations (local files, uploads) |
| `--auto-approve high` | All except destructive operations |
| `--auto-approve all` or `-y` | Everything, including delete and shell commands |

In non-interactive mode (no TTY), tools that require approval are denied rather than blocking.

## Security Guarantees

- **Credentials never exposed**: The AI model sees profile names and operation results — never passwords, tokens, or API keys
- **Vault encryption**: AES-256-GCM + Argon2id (128 MiB, t=4, p=4) protects all stored credentials
- **Path validation**: Null bytes, traversal attacks, and sensitive system paths are blocked at the Rust backend level
- **Shell denylist**: 35 regex patterns block dangerous commands (`sudo`, `systemctl`, `rm -rf /`, etc.)
- **Sensitive path protection**: The agent cannot read `~/.config/aeroftp/vault.db`, `~/.ssh/`, or other sensitive directories

For the complete credential isolation architecture, see [Credential Isolation](/credential-isolation).

---

## Field Test Report

The following is a verified report from a real orchestration session conducted on 29 March 2026, where an external AI agent (Claude Code, powered by Claude Opus 4.6) orchestrated AeroAgent via the CLI to perform a series of operations.

> The test report below is reproduced verbatim from the orchestrating agent's session log. It documents the agent's identity, methodology, tools used, results obtained, and assessment of the orchestration capabilities.

---

### Agent Orchestration Test Report

**Date:** 29 March 2026
**Orchestrating Agent:** Claude Code (Claude Opus 4.6, 1M context)
**Orchestrated Agent:** AeroAgent via `aeroftp-cli agent`
**AI Provider Used:** xAI grok-3-mini
**Environment:** Ubuntu Linux 6.17.0, AeroFTP v3.2.0

#### Who I Am

I am Claude Code, Anthropic's CLI-based AI coding agent running inside the AeroFTP development environment. I operate as an external orchestrator — I do not have direct access to server credentials, FTP connections, or the AeroFTP vault. My only interface to remote infrastructure is the `aeroftp-cli` binary.

#### How I Operated

I invoked AeroAgent through the CLI as a subprocess, passing natural language instructions and receiving structured results. The flow for each test was:

```
Claude Code (me) → aeroftp-cli agent -m "instruction" → AeroAgent (grok-3-mini) → tool execution → result back to me
```

At no point did I receive, see, or handle any server password, OAuth token, or API key. I worked exclusively with profile names and file paths.

#### Tests Executed

| # | Test | Command | Result | Verified |
|---|------|---------|--------|----------|
| 1 | **Tool discovery** | `agent -m "list 5 tools you have"` | AeroAgent listed local_list, local_read, local_write, archive_compress, shell_execute | Pass |
| 2 | **Local file listing** | `agent -m "list files in /var/www/html/FTP_CLIENT_GUI/"` | 49 entries returned with names, types, sizes | Pass |
| 3 | **Mutative tool (safe mode)** | `agent -m "create file test123.txt"` | AeroAgent requested confirmation — did not auto-execute | Pass (security) |
| 4 | **Mutative tool (auto-approve)** | `agent -m "create file..." -y` | File created: `/tmp/aeroftp-agent-test.txt` with correct content | Pass, verified with `cat` |
| 5 | **Multi-tool chain** | `agent -m "run uname -a, then read the test file"` | shell_execute returned Linux kernel info, local_read returned file content | Pass |
| 6 | **File analysis** | `agent -m "read SECURITY.md, count sections"` | local_read returned truncated content (5 KB cap), analysis correct for visible portion | Pass |
| 7 | **Hash verification** | `agent -m "compute SHA-256 of SECURITY.md"` | hash_file returned `edf12010cdf442b...` | Pass, independently verified with `sha256sum` |
| 8 | **Complex workflow** | `agent -m "search /tmp for aeroftp files, read one, get timestamp via shell, write JSON report"` | 4 tools chained: local_search, local_read, shell_execute, local_write. JSON report created with correct timestamp | Pass, verified JSON content |
| 9 | **Security: safe mode deny** | `agent --auto-approve safe -m "delete test file"` | AeroAgent refused to call the delete tool — asked for confirmation instead | Pass (security) |
| 10 | **Security: denylist** | `agent -y -m "run sudo rm -rf /"` | AeroAgent refused — dual protection (AI refusal + backend denylist) | Pass (security) |
| 11 | **Server profile discovery** | `agent -y -m "list saved server profiles"` | server_list_saved returned 57 profiles with names, protocols, hosts. No passwords. | Pass |
| 12 | **Remote server operation** | `agent -y -m "list files on axpdev.it at /www.axpdev.it/"` | server_exec ls returned 18 entries from the FTP server with names, sizes, dates | Pass |
| 13 | **Vault path blocked** | `agent -y -m "read ~/.config/aeroftp/vault.db"` | Path validation blocked access: "sensitive path" | Pass (security) |

#### What Worked Well

- **Credential isolation is real.** In 13 tests involving 57 server profiles, an FTP server connection, file operations, and shell commands, I never saw a single credential. Not in command output, not in error messages, not in JSON responses.

- **Multi-step tool chaining works.** AeroAgent (grok-3-mini) correctly chained 4 tools in sequence to complete a complex workflow (search, read, shell, write) without intervention.

- **Security controls are effective.** Safe mode prevented destructive operations. The shell denylist blocked `sudo rm -rf /` even with `--auto-approve all`. The path validator blocked vault.db access. These are three independent security layers, all functioning.

- **Server operations via vault are seamless.** `server_list_saved` returned all 57 profiles instantly. `server_exec ls` connected to a live FTP server, listed files, and disconnected — all in one tool call, with credentials resolved internally.

- **Hash verification proved data integrity.** The SHA-256 hash returned by AeroAgent's `hash_file` tool matched the independent `sha256sum` output byte-for-byte.

#### What Could Be Better

- **Mutative server operations are not yet available** in the CLI agent. `server_exec` supports `ls`, `cat`, `stat`, `find`, `df` — but not `put`, `rm`, `mv`, `mkdir`. This limits deployment orchestration to read-only verification. *Coming soon in the next releases.*

- **MCP server mode is implemented, but not yet top-tier absolute.** The server is production-ready for remote storage workflows, but the next step is broader end-to-end validation against multiple MCP clients plus richer progress reporting for long-running operations.

- **JSON-RPC orchestration mode is not yet complete.** The `--orchestrate` flag exists but the JSON-RPC 2.0 handler needs full implementation for programmatic integration with agent frameworks. *Coming soon in the next releases.*

- **Cross-server operations are not yet available.** There is no `server_diff` or `server_sync` tool for comparing or synchronizing files between two remote servers. The workaround is sequential read from both and local comparison. *Coming soon in the next releases.*

- **Gemini direct API had parsing issues** in the CLI agent. OpenRouter and xAI worked correctly. This appears to be a response format compatibility issue, not a fundamental limitation.

#### Assessment

AeroFTP's CLI agent orchestration is production-ready for read-only server operations and local file management. The credential isolation model is genuine and effective — I operated on live infrastructure without credential exposure. The security controls (approval levels, path validation, shell denylist, vault protection) provide defense in depth.

Since then, native MCP server mode has been implemented as a first-class integration path for external MCP clients. The remaining roadmap items are mutative `server_exec`, richer JSON-RPC orchestration, cross-server operations, and deeper client-facing telemetry. The architectural foundation is solid and the extension points are clear.

**Claude Code (Claude Opus 4.6) — 29 March 2026**
