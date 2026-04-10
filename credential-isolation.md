# AI Agent Credential Isolation

As of March 2026, AeroFTP provides a credential-isolated workflow for AI coding agents so they can interact with remote servers and cloud providers without ever receiving the raw credentials.

## The Problem

AI coding agents - Claude Code, Cursor, Codex, Devin - need to read and write files on remote servers. Every current approach leaks credentials:

| Method | Exposure |
|--------|----------|
| `scp user:pass@host:file` | Password in command-line args, shell history, `/proc` |
| `SFTP_PASSWORD=secret sftp host` | Environment variable visible to all same-user processes |
| `.netrc` / `.ssh/config` | Plaintext on disk |
| Credential proxy (e.g., Hashicorp Vault) | Only supports HTTP APIs, not FTP/SFTP/WebDAV/S3 |
| OS keyring | Accessible to any process running as the same user |

An AI agent that runs `scp` or sets environment variables places your credentials in its own context window, shell history, process list, and potentially in training data.

## How AeroFTP Solves This

AeroFTP introduces a credential isolation boundary between the AI agent and the authentication layer:

1. All credentials are stored in an encrypted vault (AES-256-GCM + Argon2id with 128 MiB memory cost)
2. The agent calls `aeroftp-cli ls --profile "My Server" /path/` - no password anywhere in the command
3. The Rust backend opens the vault, authenticates to the remote server, and executes the operation
4. The agent receives only the result (directory listing, file content, transfer confirmation)
5. Credentials never appear in: command-line arguments, environment variables, shell history, IPC messages, AI model context, or application logs

The master password unlocks the vault once per session. After that, every operation uses the stored credentials internally.

## CLI: Profile-Based Access

The `aeroftp-cli` binary resolves credentials from the vault at runtime. The agent never sees them:

```bash
# List saved profiles (names and protocols only, never passwords)
aeroftp-cli profiles

# Standard file operations - credential-free
aeroftp-cli ls --profile "Production" /var/www/
aeroftp-cli put --profile "Staging" ./dist/app.js /var/www/app.js
aeroftp-cli cat --profile "Production" /etc/nginx/nginx.conf
aeroftp-cli sync --profile "NAS Backup" ./data/ /backups/ --dry-run

# OAuth providers work identically - authorize once in the GUI, reuse from CLI
aeroftp-cli ls --profile "Google Drive" /
aeroftp-cli get --profile "Dropbox" /Documents/report.pdf
aeroftp-cli put --profile "OneDrive" ./report.xlsx /Work/
```

For CI/CD pipelines, a single secret (`AEROFTP_MASTER_PASSWORD`) unlocks the vault and grants access to all configured servers. No per-server secrets to manage.

## AeroAgent: Built-In AI Tools

AeroFTP's integrated AI assistant (AeroAgent) includes two tools specifically designed for credential-isolated server access:

**`server_list_saved`** (safe) - Returns server names, protocols, and hostnames. Never returns passwords, tokens, or API keys.

**`server_exec`** (high danger, requires approval) - Executes 10 operations on any saved server:

| Operation | Description |
|-----------|-------------|
| `ls` | List directory contents |
| `cat` | Read file content |
| `get` | Download file to local filesystem |
| `put` | Upload file to remote server |
| `mkdir` | Create directory |
| `rm` | Delete file or directory |
| `mv` | Move or rename |
| `stat` | File metadata (size, permissions, modified time) |
| `find` | Search by filename pattern |
| `df` | Storage quota and usage |

Server matching is fuzzy: exact name, then case-insensitive, then substring. If the match is unique, it proceeds automatically. If ambiguous, it returns the list of candidates and asks for clarification.

Passwords are resolved from the vault **in Rust** - they cross no IPC boundary, no JavaScript context, and no AI model input.

## Protocol Coverage

Credential isolation spans AeroFTP's direct-auth, token-based, and browser-authorized providers:

**Direct authentication** (username/password or API key stored in vault):
FTP, FTPS, SFTP, WebDAV, S3-compatible storage, GitHub, Azure Blob, MEGA, Filen, Internxt, kDrive, Jottacloud, FileLu, Koofr, OpenDrive, Yandex Disk

**OAuth and profile-backed API providers** (authorize or configure once in the GUI, then reuse from CLI and AeroAgent):
Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, 4shared, Drime

## Practical Workflows

**Web deployment** - An AI agent edits source code locally, then deploys:
```bash
aeroftp-cli put --profile "Production" ./dist/ /var/www/html/ --recursive
```

**Multi-server management** - Batch scripts reference profiles by name:
```
SET profile = NAS Backup
CONNECT $profile
PUT ./database-dump.sql /backups/db/
DISCONNECT
```

**Code review with server context** - Ask AeroAgent to compare local code with what is deployed:
> "Compare my local `app.js` with the version on Production server at `/var/www/app.js`"

AeroAgent calls `server_exec` to read the remote file, diffs it locally, and reports the changes. The production server's SFTP password never enters the conversation.

## Why Existing Solutions Fall Short

- **Traditional CLIs** (scp, rsync, rclone) require credentials in arguments, config files, or environment variables - all accessible to the AI agent
- **OS keystores** protect against other users, not other processes running as the same user
- **Credential proxy services** (Vault, AWS Secrets Manager) only handle HTTP-based APIs - they cannot authenticate an FTP or SFTP session
- **SSH agent forwarding** covers only SSH/SFTP, not the other 20+ protocols

AeroFTP handles its provider backends behind a single encrypted vault with a single unlock mechanism. The AI agent operates through a narrow, well-defined interface: profile name and file path. Nothing else.
