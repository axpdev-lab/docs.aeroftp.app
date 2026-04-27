# MCP Server

The AeroFTP MCP (Model Context Protocol) server exposes ~20 curated file management tools to AI assistants via JSON-RPC over stdio. It connects Claude Code, Claude Desktop, Cursor, Windsurf, and any MCP-compatible client to AeroFTP's full integration surface - **7 transport protocols + 20+ native provider integrations + 40+ pre-configured presets** - without custom integration code.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that lets AI assistants call external tools through a structured JSON-RPC interface. Instead of generating shell commands, the AI calls typed tools with validated parameters and receives structured responses.

AeroFTP implements an MCP server that wraps its CLI into ~20 curated tools with connection pooling (auto-reset on stale handles), per-profile request serialization, schema validation, request cancellation, rate limiting, and audit logging.

The official VS Code extension [`axpdev-lab.aeroftp-mcp`](https://marketplace.visualstudio.com/items?itemName=axpdev-lab.aeroftp-mcp) configures this server in one click for Claude Code, Claude Desktop, Cursor, and Windsurf simultaneously.

## Quick Start

### 1. Install AeroFTP

The MCP server is included with every AeroFTP installation. See [CLI Installation](/cli/installation) for platform-specific instructions.

```bash
# Verify the CLI is available
aeroftp-cli --version
```

### 2. Configure Your AI Tool

#### VS Code Extension (Recommended)

Install the [AeroFTP MCP Server](https://marketplace.visualstudio.com/items?itemName=axpdev-lab.aeroftp-mcp) extension from the VS Code Marketplace. It auto-detects installed AI tools and configures the MCP server with one click.

```
Ctrl+Shift+P → AeroFTP: Install MCP Server
```

The extension supports Claude Code, Claude Desktop, Cursor, and Windsurf simultaneously.

#### Manual Configuration

Add the following entry to your AI tool's MCP configuration file:

```json
{
  "mcpServers": {
    "aeroftp": {
      "command": "aeroftp-cli",
      "args": ["mcp"]
    }
  }
}
```

Configuration file locations:

| Tool | Config Path |
|------|-------------|
| **Claude Code** | `~/.claude/.mcp.json` |
| **Claude Desktop** (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Claude Desktop** (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Cursor** | `~/.cursor/mcp.json` |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` |

### 3. Connect to a Server

Once configured, your AI assistant can use `list_profiles` to see your saved servers and `connect` to start a session.

## Available Tools

The MCP server exposes the following curated tools (names use the `aeroftp_` prefix in the wire protocol; the table omits the prefix for brevity).

### Safe Tools (Read-Only)

| Tool | Description |
|------|-------------|
| `list_servers` | List saved server profiles (names + protocol + tags + per-profile `auth_state` - never credentials). Supports a `filter` arg |
| `mcp_info` | Server capabilities, version, supported protocols |
| `server_info` | Connect to a profile and return server/protocol metadata |
| `agent_connect` | Single-shot connect surface (added v3.6.6): one JSON envelope with `connect` + `capabilities` + `quota` + `path` blocks, replacing the boilerplate sequence `connect → about → df → ls /` |
| `list_files` | List files and directories at a given path |
| `read_file` | Read text file content. `preview_kb` argument for soft-truncation (added v3.5.9) |
| `file_info` | File or directory metadata (size, mtime, permissions, hash) |
| `file_versions` | List historical versions where the protocol supports them |
| `search_files` | Search files by name pattern (glob) |
| `storage_quota` | Storage quota (used/free/total) |
| `checksum` | Compute SHA-256 / BLAKE3 / etc. on a remote file |
| `check_tree` | Categorized local-vs-remote diff. `compare_method` argument supports `size` / `mtime` / `checksum` (added v3.6.0) |

### Medium Tools (Write Operations)

| Tool | Description |
|------|-------------|
| `download_file` | Download a remote file to a local path |
| `upload_file` | Upload a local file. Supports `create_parents` for missing-directory auto-creation, `no_clobber` for skip-if-exists (added v3.5.9) |
| `upload_many` | Batch upload from a `files: []` array (mirrors CLI `--files-from`). Returns per-file `status` (uploaded / skipped / error). Added v3.5.10 |
| `create_directory` | Create a remote directory |
| `rename` | Rename or move a file or directory |
| `server_copy` | Server-side copy (when supported by the protocol) |
| `create_share_link` | Generate a share link with optional password/expiry |
| `edit` | Find and replace in a remote text file (download → edit → upload). Added v3.5.10 |
| `sync_tree` | Plan and execute a directory sync. Returns `plan[]` (per-file decision) and `plan_by_op` with caps; supports `dry_run` and pool-invalidate fix on apply |
| `close_connection` | Close the current pooled connection (forces reconnect on next call) |

### High Tools (Destructive)

| Tool | Description |
|------|-------------|
| `delete` | Permanently delete a remote file or directory |
| `delete_many` | Batch delete from an explicit list. Per-item `status` reporting |

## Rate Limits

The MCP server enforces per-category rate limits to prevent runaway operations:

| Category | Limit | Tools |
|----------|-------|-------|
| **Read** | 60/min | list_servers, list_files, read_file, file_info, search_files, storage_quota, checksum, check_tree, server_info, mcp_info, file_versions |
| **Write** | 30/min | upload_file, upload_many, download_file, create_directory, rename, server_copy, edit, sync_tree, create_share_link |
| **Delete** | 10/min | delete, delete_many |

When a rate limit is exceeded, the server returns an error with a `retry_after` hint.

## Supported Integrations

The MCP server inherits AeroFTP's full integration surface from the CLI. See [Protocol Overview](/protocols/overview) for the complete matrix.

| Tier | Coverage |
|------|----------|
| **7 transport protocols** | FTP, FTPS, SFTP, WebDAV, S3, Azure Blob, OpenStack Swift |
| **20+ native provider integrations** | Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, Filen, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud, FileLu, Yandex Disk, OpenDrive, 4shared, Drime Cloud, GitHub, GitLab, Immich |
| **40+ pre-configured presets** | AWS S3, Backblaze B2, Cloudflare R2, Wasabi, DigitalOcean Spaces, MinIO, Storj, IDrive e2, Hetzner Storage Box, Yandex Object Storage, Tencent COS, Alibaba OSS, Oracle Cloud, Nextcloud, Seafile, InfiniCLOUD, Jianguoyun, CloudMe, SourceForge, etc. |

Saved profiles for OAuth providers (Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Yandex Disk, 4shared, Drime) are loaded from the encrypted vault automatically once authorized in the AeroFTP GUI - the MCP server never sees the underlying tokens.

## Security Model

### Credential Isolation

The MCP server never exposes credentials to the AI model. Server profiles are stored in AeroFTP's encrypted vault (AES-256-GCM + Argon2id) and resolved by name at connection time.

### Audit Logging

Every tool call is logged with timestamp, tool name, parameters, and result status. Logs are stored locally and never transmitted.

### Input Validation

All path parameters are validated against traversal attacks (`..`, absolute paths, null bytes). File sizes are capped to prevent memory exhaustion.

## Agent Discovery

Use `agent-info` to query the MCP server's capabilities programmatically:

```bash
aeroftp-cli agent-info --json 2>/dev/null
```

Returns a JSON object with:
- Available tools with parameter schemas
- Supported protocols
- Exit code definitions
- Safety rules and rate limits
- Saved server profiles (names only)

## Troubleshooting

### MCP server not responding

Verify the CLI is accessible:

```bash
aeroftp-cli --version
```

If using Snap, ensure the alias is active:

```bash
snap alias aeroftp aeroftp-cli
```

### Connection refused

The MCP server requires a saved server profile. Create one in the AeroFTP desktop app or via the CLI:

```bash
aeroftp-cli connect sftp://user@host --save "My Server"
```

### Rate limit errors

Reduce the frequency of tool calls or wait for the `retry_after` period. Rate limits reset every 60 seconds.

## Recent Hardening (v3.5.4)

Three independent audits surfaced 9 issues across pool, vault, serialization, and shutdown semantics. All resolved:

- **S3 bucket fix from vault profiles**: `create_provider_from_vault` now reads `bucket`/`region`/`endpoint`/`path_style` from the saved profile options. Previously surfaced as "bucket required" on 10+ S3-backed profiles.
- **Vault auto-init**: `McpServer::run()` initializes the Universal Vault automatically; falls back to `AEROFTP_MASTER_PASSWORD` when set. Subprocess MCP now sees credentials without manual unlock.
- **Per-profile serialization**: `Arc<Mutex<HashMap<String, Arc<Mutex<()>>>>>` linearizes tool calls on the same profile while keeping cross-server calls parallel. Prevents wire interleaving on flaky servers.
- **Shutdown drain**: `JoinSet` tracks spawned tasks; on EOF stdin, `drain_pending(10s)` lets in-flight responses complete before exit.
- **Schema validation**: `inputSchema.required` checked before dispatch. Missing fields return MCP-standard `-32602 Invalid params` instead of generic errors.
- **Top-level `mcp` subcommand**: `aeroftp-cli mcp` argv now matches what the VS Code extension registers, removing the need for nested subcommand routing.

## Further Reading

- [CLI Commands](/cli/commands) - Full CLI reference
- [CLI Examples](/cli/examples) - Real-world usage patterns
- [AeroRsync](/features/aerorsync) - Native rsync delta sync engine (used by sync_tree on SFTP)
- [LLM Integration Guide](https://github.com/axpdev-lab/aeroftp/blob/main/docs/LLM-INTEGRATION-GUIDE.md) - Safe patterns and anti-patterns for AI integration
- [Threat Model](https://github.com/axpdev-lab/aeroftp/blob/main/docs/THREAT-MODEL.md) - Security architecture documentation
