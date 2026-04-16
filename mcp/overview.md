# MCP Server

The AeroFTP MCP (Model Context Protocol) server exposes 16 file management tools to AI assistants via JSON-RPC over stdio. It connects Claude Code, Claude Desktop, Cursor, Windsurf, and any MCP-compatible client to all 22 AeroFTP protocols without custom integration code.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that lets AI assistants call external tools through a structured JSON-RPC interface. Instead of generating shell commands, the AI calls typed tools with validated parameters and receives structured responses.

AeroFTP implements an MCP server that wraps its CLI into 16 curated tools with rate limiting, connection pooling, and audit logging.

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

The MCP server exposes 16 tools organized by danger level:

### Safe Tools (Read-Only)

| Tool | Description |
|------|-------------|
| `list_directory` | List files and directories at a given path |
| `read_file` | Read text file content (with configurable size limit) |
| `stat` | Get file or directory metadata (size, mtime, permissions) |
| `search` | Search for files by name pattern (glob) |
| `get_quota` | Get storage quota information (used/total) |
| `list_profiles` | List saved server profiles (names only, no credentials) |
| `connect` | Connect to a saved server profile |
| `disconnect` | Disconnect from the current server |
| `server_info` | Get server and protocol capability information |

### Medium Tools (Write Operations)

| Tool | Description |
|------|-------------|
| `download_file` | Download a remote file to a local path |
| `upload_file` | Upload a local file to a remote path |
| `create_directory` | Create a directory on the remote server |
| `rename` | Rename or move a file or directory |
| `copy` | Server-side copy (if the protocol supports it) |

### High Tools (Destructive)

| Tool | Description |
|------|-------------|
| `delete_file` | Permanently delete a remote file |
| `delete_directory` | Permanently delete a remote directory |

## Rate Limits

The MCP server enforces per-category rate limits to prevent runaway operations:

| Category | Limit | Tools |
|----------|-------|-------|
| **Read** | 60/min | list_directory, read_file, stat, search, get_quota, list_profiles, server_info |
| **Write** | 30/min | upload_file, download_file, create_directory, rename, copy |
| **Delete** | 10/min | delete_file, delete_directory |

When a rate limit is exceeded, the server returns an error with a `retry_after` hint.

## Supported Protocols

The MCP server inherits all protocols from the AeroFTP CLI:

| Category | Protocols |
|----------|-----------|
| **Traditional** | FTP, FTPS, SFTP |
| **Standards** | WebDAV, S3-Compatible |
| **Cloud Storage** | Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud |
| **Enterprise** | Azure Blob, Zoho WorkDrive |
| **Privacy** | Filen (E2E), Internxt (E2E) |
| **Regional** | kDrive, Koofr, Jottacloud, Yandex Disk, 4shared, OpenDrive, FileLu |

S3-compatible providers include AWS S3, Backblaze B2, Cloudflare R2, Wasabi, DigitalOcean Spaces, MinIO, Storj, and more.

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

## Further Reading

- [CLI Commands](/cli/commands) - Full CLI reference
- [CLI Examples](/cli/examples) - Real-world usage patterns
- [LLM Integration Guide](https://github.com/axpdev-lab/aeroftp/blob/main/docs/LLM-INTEGRATION-GUIDE.md) - Safe patterns and anti-patterns for AI integration
- [Threat Model](https://github.com/axpdev-lab/aeroftp/blob/main/docs/THREAT-MODEL.md) - Security architecture documentation
