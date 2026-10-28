---
description: "Let external AI agents delegate file and server work to AeroAgent through the CLI, without exposing credentials."
---

# External Agent Orchestration

AeroAgent can be orchestrated by external AI agents - Claude Code, Codex, Cursor, Devin, or any tool that can invoke CLI commands. The external agent uses `aeroftp-cli agent` to delegate file operations, server management, and multi-protocol tasks to AeroAgent, which resolves credentials from the encrypted vault without ever exposing them.

This page describes AeroFTP 4.2.5 as checked on 26 October 2026. The dated field report below remains historical evidence for v3.2.0, not validation of the current release.

## Quick Start for External Agents

```bash
# Discover available AI providers
aeroftp-cli ai-models --json

# Discover saved server profiles (no credentials exposed)
aeroftp-cli profiles --json

# One-shot agent command
aeroftp-cli agent --provider xai --model grok-3-mini \
  -m "List files on the Production server" \
  --auto-approve high --json

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

This means an external agent can use AeroFTP's AI capabilities without any API key configuration - if the desktop app has a provider configured, the CLI uses it automatically.

## Server Operations

The CLI agent exposes two tools for server operations:

### `server_list_saved`

Lists all saved server profiles from the encrypted vault. Returns names, protocols, and hosts - never credentials.

### `server_exec`

Executes the following read operations on a saved server supported by the active backend. The backend resolves credentials internally.

| Operation | Description |
|-----------|-------------|
| `ls` | List directory contents with bounded pagination |
| `cat` | Read file content (max 5 KB) |
| `stat` | File metadata (size, permissions, modified time) |
| `find` | Search by filename pattern with bounded results |
| `df` | Storage quota and usage |

Credentials are resolved inside Rust and are not included in the operation result. Connection reuse and provider support depend on the surface and backend.

`server_exec` explicitly refuses `put`, `get`, `rm`, `mv` and `mkdir`. Use dedicated tools such as `remote_upload`, `remote_download`, `remote_mkdir`, `remote_rename` and `remote_delete` where the surface exposes them; their own approval rules apply. GUI AeroAgent dispatch uses backend approval grants; the shared tool dispatcher does not enforce that GUI grant for inbound MCP or CLI callers. MCP authorization belongs to the client/host, while the CLI AI-agent loop applies its own approval policy.

## Native MCP Server

AeroFTP also exposes a native stdio MCP server through the CLI:

```bash
aeroftp-cli agent --mcp
```

This mode exposes a remote-focused toolset directly to MCP clients such as Claude Desktop, Cursor, and VS Code. The current implementation includes:

- 78 wire tool names, including compatibility aliases, for file operations, sync/diff, cross-profile copy, profile authorization, diagnostics and error correction. See the exact [MCP catalog](/mcp/overview#tool-catalog); do not infer share-link or server-copy tools from provider capabilities.
- MCP resources for saved profiles, vault availability, protocol capabilities, and active pooled connections
- MCP prompts for deploy, backup, sync, and cleanup workflows
- async stdio transport, connection pooling, request cancellation, rate limiting, and audit logging

This is the preferred integration path when the external client already speaks MCP and should not have to parse CLI output.

## Auto-Approval Levels

External agents control the approval behavior:

| Flag | Behavior |
|------|----------|
| `--auto-approve safe` | Local metadata tools execute automatically; content-reading local tools and remote metadata still require a higher level or approval |
| `--auto-approve medium` | Also remote listings and metadata, local writes, and remote writes that delete nothing (upload, download, mkdir, rename, edit) |
| `--auto-approve high` | Also remote reads (`remote_read`, `server_exec`, file content sent to the model); never a delete, a trash, a sync control or the shell |
| `--auto-approve all` or `-y` | Everything, including delete, trash, sync control and shell commands |

The difference between `high` and `all` exists since AeroFTP v4.2.1: before, `high` was the same level as `all`.

In non-interactive mode (no TTY), tools that require approval are denied rather than blocking. These flags govern the CLI AI-agent loop; MCP clients have their own permission controls. Use `--strict` (or `AEROFTP_STRICT=1`) when a generated command must fail on safety-relaxing flags: it refuses automatic approval above `safe`, including `-y`.

## Security Boundaries

- **Credentials never exposed**: The AI model sees profile names and operation results - never passwords, tokens, or API keys
- **Vault encryption**: AES-256-GCM protects stored secrets; OS-keyring or optional Argon2id master-password mode controls unlock
- **Path validation**: Null bytes, traversal attacks, and sensitive system paths are blocked at the Rust backend level
- **Shell denylist**: backend checks reject dangerous command patterns and shell metacharacters
- **Sensitive path protection**: The agent cannot read `~/.config/aeroftp/vault.db`, `~/.ssh/`, or other sensitive directories

For the complete credential isolation architecture, see [Credential Isolation](/credential-isolation).

---

## Historical Field Test Report

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

I am Claude Code, Anthropic's CLI-based AI coding agent running inside the AeroFTP development environment. I operate as an external orchestrator - I do not have direct access to server credentials, FTP connections, or the AeroFTP vault. My only interface to remote infrastructure is the `aeroftp-cli` binary.

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
| 3 | **Mutative tool (safe mode)** | `agent -m "create file test123.txt"` | AeroAgent requested confirmation - did not auto-execute | Pass (security) |
| 4 | **Mutative tool (auto-approve)** | `agent -m "create file..." -y` | File created: `/tmp/aeroftp-agent-test.txt` with correct content | Pass, verified with `cat` |
| 5 | **Multi-tool chain** | `agent -m "run uname -a, then read the test file"` | shell_execute returned Linux kernel info, local_read returned file content | Pass |
| 6 | **File analysis** | `agent -m "read SECURITY.md, count sections"` | local_read returned truncated content (5 KB cap), analysis correct for visible portion | Pass |
| 7 | **Hash verification** | `agent -m "compute SHA-256 of SECURITY.md"` | hash_file returned `edf12010cdf442b...` | Pass, independently verified with `sha256sum` |
| 8 | **Complex workflow** | `agent -m "search /tmp for aeroftp files, read one, get timestamp via shell, write JSON report"` | 4 tools chained: local_search, local_read, shell_execute, local_write. JSON report created with correct timestamp | Pass, verified JSON content |
| 9 | **Security: safe mode deny** | `agent --auto-approve safe -m "delete test file"` | AeroAgent refused to call the delete tool - asked for confirmation instead | Pass (security) |
| 10 | **Security: denylist** | `agent -y -m "run sudo rm -rf /"` | AeroAgent refused - dual protection (AI refusal + backend denylist) | Pass (security) |
| 11 | **Server profile discovery** | `agent -y -m "list saved server profiles"` | server_list_saved returned 57 profiles with names, protocols, hosts. No passwords. | Pass |
| 12 | **Remote server operation** | `agent -y -m "list files on axpdev.it at /www.axpdev.it/"` | server_exec ls returned 18 entries from the FTP server with names, sizes, dates | Pass |
| 13 | **Vault path blocked** | `agent -y -m "read ~/.config/aeroftp/vault.db"` | Path validation blocked access: "sensitive path" | Pass (security) |

#### What Worked Well

- **Credential isolation is real.** In 13 tests involving 57 server profiles, an FTP server connection, file operations, and shell commands, I never saw a single credential. Not in command output, not in error messages, not in JSON responses.

- **Multi-step tool chaining works.** AeroAgent (grok-3-mini) correctly chained 4 tools in sequence to complete a complex workflow (search, read, shell, write) without intervention.

- **Security controls are effective.** Safe mode prevented destructive operations. The shell denylist blocked `sudo rm -rf /` even with `--auto-approve all`. The path validator blocked vault.db access. These are three independent security layers, all functioning.

- **Server operations via vault are seamless.** `server_list_saved` returned all 57 profiles instantly. `server_exec ls` connected to a live FTP server, listed files, and disconnected - all in one tool call, with credentials resolved internally.

- **Hash verification proved data integrity.** The SHA-256 hash returned by AeroAgent's `hash_file` tool matched the independent `sha256sum` output byte-for-byte.

#### What Could Be Better

- **Mutative server operations are not yet available** in the CLI agent. `server_exec` supports `ls`, `cat`, `stat`, `find`, `df` - but not `put`, `rm`, `mv`, `mkdir`. This limits deployment orchestration to read-only verification. *Coming soon in the next releases.*

- **MCP server mode is implemented, but not yet top-tier absolute.** The server is production-ready for remote storage workflows, but the next step is broader end-to-end validation against multiple MCP clients plus richer progress reporting for long-running operations.

- **JSON-RPC orchestration mode is not yet complete.** The `--orchestrate` flag exists but the JSON-RPC 2.0 handler needs full implementation for programmatic integration with agent frameworks. *Coming soon in the next releases.*

- **Cross-server operations are not yet available.** There is no `server_diff` or `server_sync` tool for comparing or synchronizing files between two remote servers. The workaround is sequential read from both and local comparison. *Coming soon in the next releases.*

- **Gemini direct API had parsing issues** in the CLI agent. OpenRouter and xAI worked correctly. This appears to be a response format compatibility issue, not a fundamental limitation.

#### Assessment

AeroFTP's CLI agent orchestration is production-ready for read-only server operations and local file management. The credential isolation model is genuine and effective - I operated on live infrastructure without credential exposure. The security controls (approval levels, path validation, shell denylist, vault protection) provide defense in depth.

This assessment describes the March 2026 test environment. In 4.2.5, MCP and JSON-RPC orchestration are implemented; dedicated mutation tools and cross-profile transfer tools exist on supported surfaces. `server_exec` intentionally remains read-only. The archived limitations above are not the current release roadmap.

**Claude Code (Claude Opus 4.6) - 29 March 2026**
