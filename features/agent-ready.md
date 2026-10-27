---
description: "How AeroFTP is designed to be driven by AI agents as well as by people."
---

# Agent-Ready Architecture

AeroFTP is built for both humans and AI agents. As agentic AI becomes the standard way to interact with computers, file management across servers and cloud providers is a fundamental capability that every agent needs. Yet most file transfer tools were designed exclusively for human interaction through GUIs.

AeroFTP bridges this gap with two native access modes: a graphical interface for humans, and a structured CLI for autonomous agents.

## The Agentic Era

AI agents like **Claude Code**, **Open Interpreter**, **Cline**, **Aider**, **Devin**, **Codex CLI**, **Cursor Agent**, **Windsurf**, **Goose**, **SWE-agent**, **AutoGPT**, and **CrewAI** operate by executing shell commands and reading their output. **Computer use** agents (Anthropic, OpenAI Operator) go further by controlling the entire desktop. **MCP servers** (Model Context Protocol) expose structured tools to LLMs.

All of these need to move files between local machines, remote servers, and cloud storage. AeroFTP gives them a single command (`aeroftp-cli`) that works across the AeroFTP provider set.

## How Agents Use AeroFTP

Any tool that can execute shell commands can use the AeroFTP CLI. The key features that make it agent-friendly:

**Vault-based credentials**: the `--profile` flag resolves credentials from the encrypted vault at runtime. Agents never see passwords, tokens, or keys. They only know the profile name.

```bash
# Agent connects using a profile name. Password stays in the vault.
aeroftp-cli ls --profile "Production" /var/www/ --json

# Fuzzy matching works
aeroftp-cli ls --profile "prod" /var/www/ --json

# List all available profiles
aeroftp-cli profiles --json
```

**Structured JSON output**: core commands support `--json` with command-specific envelopes. Data goes to stdout, messages to stderr, so agents can pipe and parse cleanly.

```bash
# Output is machine-readable
aeroftp-cli stat --profile "Server" /var/www/index.html --json
# The result contains status and an entry object; inspect the current schema.

# Pipe-friendly
aeroftp-cli cat --profile "Server" /config.ini | grep DB_HOST
```

**Semantic exit codes**: use the contract for the command being run in the [CLI reference](/cli/commands). Codes are command-specific: `check` uses `6` for connection or authentication failures, while `agent-connect` uses `1` for a failed connection attempt. Inspect the JSON outcome as well as the exit code before retrying.

**Batch scripting**: agents can generate `.aeroftp-script` scripts for multi-step operations with error handling.

```bash
SET source=/var/www/html
ON_ERROR CONTINUE
CONNECT --profile "Server"
GET ${source}/database.sql ./backup/database.sql
SYNC ./backup/uploads/ ${source}/uploads/ --direction download
DISCONNECT
```

**Clean output**: `NO_COLOR` compliant, no ANSI escape sequences. Progress bars hidden when output is piped.

## Compatible Agents and Frameworks

| Agent / Framework | How it uses AeroFTP |
| ----------------- | ------------------- |
| **Claude Code** | Calls `aeroftp-cli` from a terminal |
| **Open Interpreter** | Shell execution in its environment |
| **Cline / Continue** | Terminal tool calls in VS Code |
| **Aider** | Deployment after code changes |
| **Cursor Agent** | Shell command execution |
| **Windsurf (Codium)** | Terminal tool integration |
| **Devin** | Cloud-based agent with shell access |
| **Codex CLI** | OpenAI's CLI agent |
| **Goose (Block)** | Extensible agent with shell toolkit |
| **SWE-agent** | Software engineering research agent |
| **AutoGPT / CrewAI** | Multi-agent frameworks with shell tools |
| **LangChain / LangGraph** | Custom agents with subprocess tool |
| **Computer Use** (Anthropic, OpenAI Operator) | Desktop automation, can use both GUI and CLI |
| **MCP servers** | Model Context Protocol tools can call the native AeroFTP MCP server |

## Real-World Scenarios

The following recipes use the current CLI grammar. They require configured profiles, suitable paths and provider support.

### "Build my app and deploy it to the server"

An AI coding agent (Claude Code, Aider, Cline) makes code changes, builds the project, and deploys to production via FTP/SFTP. No manual file upload, no FTP client to open.

```bash
# Agent edits code, runs build, then deploys
npm run build
aeroftp-cli put --profile "Production" ./dist/ /var/www/html/ -r --json
# Verify deployment
aeroftp-cli ls --profile "Production" /var/www/html/ --json | jq '.entries | length'
```

### "Back up my project to Google Drive every night"

A scheduled agent (cron + Claude Code, or AutoGPT) compresses a project and uploads it to cloud storage. The same profile-based flow works across FTP/SFTP, cloud drives, and object storage.

```bash
# Compress and upload to Google Drive
tar czf backup-$(date +%F).tar.gz ./project/
aeroftp-cli put --profile "Google Drive" ./backup-*.tar.gz /backups/
# Or sync an entire folder to S3
aeroftp-cli sync --profile "AWS S3" ~/documents/ /backup/documents/ --direction upload --json
# Or to a NAS
aeroftp-cli sync --profile "NAS" ~/photos/ /media/photos/ --direction upload --json
```

### "Read and update files in a GitHub repository"

AeroFTP supports GitHub as a storage protocol. An agent can read files and create file commits through the storage provider. This interface does not expose a general git clone, push or pull-request command.

```bash
# List repo contents
aeroftp-cli ls --profile "GitHub" /src/ --json
# Read a file
aeroftp-cli cat --profile "GitHub" /src/main.rs
# Upload a modified file (creates a commit)
aeroftp-cli put --profile "GitHub" ./main.rs /src/main.rs
```

Inside the GUI, AeroAgent can do the same through natural language: "read the README from my GitHub repo, update the version number, and commit it."

### "Check how much space I have left across all my storage"

An agent audits storage usage across every connected service in seconds.

```bash
while IFS= read -r profile; do
  echo "=== $profile ==="
  aeroftp-cli df --profile "$profile" --json 2>/dev/null
done < <(aeroftp-cli profiles --json | jq -r '.[].name')
```

Quota fields depend on provider support; some backends cannot supply a total or quota. The agent can alert when any service is above 90%.

### "Copy documents from Dropbox to an encrypted S3 overlay"

Use an S3 profile already bound to AeroCrypt or rclone crypt. Verify its `cryptOverlay` field before uploading; a plain S3 profile does not encrypt content automatically.

```bash
aeroftp-cli get --profile "Dropbox" "/contracts/*.pdf" ./contracts/
aeroftp-cli put --profile "Encrypted S3" ./contracts/ /encrypted-archive/ -r
```

### "Set up a new developer's environment"

An onboarding agent provisions a developer's access to multiple servers and syncs starter configs.

```bash
# Pull configs from the team's shared WebDAV
aeroftp-cli get --profile "Team WebDAV" /dev-configs/ ./configs/ -r
# Deploy SSH configs, editor settings, etc.
cp ./configs/.bashrc ~/
cp ./configs/.gitconfig ~/
# Pull project repos from GitHub
aeroftp-cli get --profile "GitHub" /src/ ./workspace/ -r
```

### "Monitor my servers and alert me"

A monitoring agent periodically checks connectivity and disk space.

```bash
# Test connectivity (exit code 0 = ok, 1 = down)
aeroftp-cli connect --profile "Production" --json
# Check if a critical file exists
aeroftp-cli stat --profile "Production" /var/www/html/index.html --json
# Find large log files
aeroftp-cli find --profile "Production" /var/log/ --name "*.log" --json
```

### "Migrate files from one cloud to another"

Moving from Google Drive to a self-hosted Nextcloud (WebDAV). The agent handles the entire migration.

```bash
# List everything on Google Drive
aeroftp-cli tree --profile "Google Drive" / -d 3 --json > inventory.json
# Download all files
aeroftp-cli get --profile "Google Drive" / ./migration/ -r
# Upload to Nextcloud
aeroftp-cli put --profile "Nextcloud" ./migration/ / -r --json
# Verify
aeroftp-cli df --profile "Nextcloud" --json
```

## AeroAgent: The Internal AI Assistant

For users who prefer the GUI, AeroAgent provides the same file management capabilities through natural language. Its GUI catalog includes tools covering:

- **Local file ops**: list, read, write, delete, rename, search, edit, mkdir, move, copy, batch rename, trash, file info, disk usage, find duplicates, grep, head, tail, stat, diff, tree
- **Remote server ops**: list, read, upload, download, delete, rename, mkdir, edit, search, batch upload/download, server exec
- **System**: shell execute, clipboard read/write, archive compress/decompress
- **AI-specific**: RAG index, RAG search, agent memory, edit preview

AeroAgent chains tool calls autonomously (up to 10 steps in normal mode, 50 in Extreme Mode) with a three-tier approval system based on tool danger level.

[Full AeroAgent documentation →](/features/aeroagent)

## CLI Command Reference

Core remote commands accept `--json` and saved profiles; inventory and batch commands have their own inputs:

`connect` `ls` `get` `put` `mkdir` `rm` `mv` `cat` `head` `tail` `touch` `hashsum` `check` `reconcile` `stat` `find` `df` `about` `dedupe` `tree` `sync` `batch` `profiles` `agent-info` `agent-connect` `inventory`

The command interface is shared, while capabilities and authentication differ by provider. Query discovery and handle unsupported operations explicitly. GUI control is exposed through `gui_state`, `gui_wait` and `gui_run` inside AeroAgent; external CLI and MCP clients do not yet have that GUI bridge, and there is no `aeroftp-cli gui` command.

[Full CLI documentation →](/cli/commands)

## Design Principles

1. **Humans first, agents welcome**. The GUI remains the primary interface. Agent support is additive, not a compromise.
2. **Credentials never exposed**. Agents use profile names. Passwords stay in the encrypted vault.
3. **Structured by default**. `--json` is not an afterthought. Every command is designed for both human and machine consumption.
4. **Protocol-agnostic**. Agents do not need to know whether a profile points to FTP, SFTP, S3, or Google Drive. Inspect capabilities and limitations before choosing an operation.
5. **Fail loudly**. Semantic exit codes and stderr messages let agents handle errors programmatically.
