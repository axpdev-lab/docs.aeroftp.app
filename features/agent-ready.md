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

**Structured JSON output**: every command supports `--json`. Data goes to stdout, messages to stderr, so agents can pipe and parse cleanly.

```bash
# Output is machine-readable
aeroftp-cli stat --profile "Server" /var/www/index.html --json
# {"name":"index.html","size":4096,"type":"file","modified":"2026-03-15T10:30:00Z"}

# Pipe-friendly
aeroftp-cli cat --profile "Server" /config.ini | grep DB_HOST
```

**Semantic exit codes**: agents know exactly what failed without parsing text.

| Code | Meaning |
| ---- | ------- |
| 0 | Success |
| 1 | Connection error |
| 2 | Not found |
| 3 | Permission denied |
| 4 | Transfer error |
| 5 | Configuration error |
| 6 | Authentication error |
| 7 | Not supported |
| 8 | Timeout |
| 9 | Already exists (`--immutable`, `--no-clobber`) |
| 10 | Server / parse error |
| 11 | I/O error |

**Batch scripting**: agents can generate `.aeroftp` scripts for multi-step operations with error handling.

```bash
SET source=/var/www/html
ON_ERROR CONTINUE
CONNECT sftp://admin@server.com
GET {source}/database.sql ./backup/
GET {source}/uploads/ ./backup/uploads/
DISCONNECT
```

**Clean output**: `NO_COLOR` compliant, no ANSI escape sequences. Progress bars hidden when output is piped.

## Compatible Agents and Frameworks

| Agent / Framework | How it uses AeroFTP |
| ----------------- | ------------------- |
| **Claude Code** | Calls `aeroftp` CLI directly from terminal |
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
| **MCP servers** | Model Context Protocol tools can wrap `aeroftp` commands |

## Real-World Scenarios

These are not hypothetical. Every command below works today with the AeroFTP CLI.

### "Build my app and deploy it to the server"

An AI coding agent (Claude Code, Aider, Cline) makes code changes, builds the project, and deploys to production via FTP/SFTP. No manual file upload, no FTP client to open.

```bash
# Agent edits code, runs build, then deploys
npm run build
aeroftp-cli put --profile "Production" ./dist/ /var/www/html/ --json
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
aeroftp-cli sync --profile "AWS S3" ~/documents/ /backup/documents/ --json
# Or to a NAS
aeroftp-cli sync --profile "NAS" ~/photos/ /media/photos/ --json
```

### "Clone this repo, make changes, commit and push"

AeroFTP supports GitHub as a storage protocol. An agent can read files, create commits, and even open pull requests, all through the same CLI or AeroAgent tools.

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
for profile in $(aeroftp-cli profiles --json | jq -r '.[].name'); do
  echo "=== $profile ==="
  aeroftp-cli df --profile "$profile" --json 2>/dev/null
done
```

Output for each profile includes used space, total space, and percentage. The agent can alert when any service is above 90%.

### "Download all PDFs from Dropbox and re-upload them encrypted to S3"

Cross-provider file operations with encryption. The agent moves files between clouds, applying AeroVault encryption in between.

```bash
# Download from Dropbox
aeroftp-cli get --profile "Dropbox" "/contracts/*.pdf"
# Encrypt locally (AeroVault CLI or any tool)
# Re-upload to S3
aeroftp-cli put --profile "AWS S3" ./contracts/ /encrypted-archive/
```

### "Set up a new developer's environment"

An onboarding agent provisions a developer's access to multiple servers and syncs starter configs.

```bash
# Pull configs from the team's shared WebDAV
aeroftp-cli get --profile "Team WebDAV" /dev-configs/ ./configs/
# Deploy SSH configs, editor settings, etc.
cp ./configs/.bashrc ~/
cp ./configs/.gitconfig ~/
# Pull project repos from GitHub
aeroftp-cli get --profile "GitHub" /src/ ./workspace/
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
aeroftp-cli ls --profile "Google Drive" / -r --json > inventory.json
# Download all files
aeroftp-cli get --profile "Google Drive" / ./migration/
# Upload to Nextcloud
aeroftp-cli put --profile "Nextcloud" ./migration/ / --json
# Verify
aeroftp-cli df --profile "Nextcloud" --json
```

## AeroAgent: The Internal AI Assistant

For users who prefer the GUI, AeroAgent provides the same file management capabilities through natural language. It supports 24 AI providers and 52 tools covering:

- **Local file ops**: list, read, write, delete, rename, search, edit, mkdir, move, copy, batch rename, trash, file info, disk usage, find duplicates, grep, head, tail, stat, diff, tree
- **Remote server ops**: list, read, upload, download, delete, rename, mkdir, edit, search, batch upload/download, server exec
- **System**: shell execute, clipboard read/write, archive compress/decompress
- **AI-specific**: RAG index, RAG search, agent memory, edit preview

AeroAgent chains tool calls autonomously (up to 10 steps in normal mode, 50 in Extreme Mode) with a three-tier approval system based on tool danger level.

[Full AeroAgent documentation →](/features/aeroagent)

## CLI Command Reference

Core commands all support `--json` and `--profile`:

`connect` `ls` `get` `put` `mkdir` `rm` `mv` `cat` `head` `tail` `touch` `hashsum` `check` `stat` `find` `df` `about` `dedupe` `tree` `sync` `batch` `profiles` `agent-info`

All commands work identically across FTP, FTPS, SFTP, WebDAV, S3, Google Drive, Dropbox, OneDrive, MEGA, and all other supported protocols. The agent does not need to know which protocol a profile uses.

[Full CLI documentation →](/cli/commands)

## Design Principles

1. **Humans first, agents welcome**. The GUI remains the primary interface. Agent support is additive, not a compromise.
2. **Credentials never exposed**. Agents use profile names. Passwords stay in the encrypted vault.
3. **Structured by default**. `--json` is not an afterthought. Every command is designed for both human and machine consumption.
4. **Protocol-agnostic**. Agents do not need to know whether a profile points to FTP, SFTP, S3, or Google Drive. The same commands work everywhere.
5. **Fail loudly**. Semantic exit codes and stderr messages let agents handle errors programmatically.
