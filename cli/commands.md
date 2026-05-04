# CLI Commands

Complete reference for the `aeroftp-cli` binary. It shares the same Rust backend as the desktop app, with direct URL support for core protocols, saved-profile access for GUI-authorized providers, structured JSON output, and Unix pipeline compatibility.

> **Coverage**: 7 transport protocols (FTP, FTPS, SFTP, WebDAV, S3, Azure Blob, OpenStack Swift) + 20+ native provider integrations + 40+ pre-configured presets. See [Protocol Overview](/protocols/overview) for the full integration matrix.

## Connection Methods

### URL Format

```
protocol://user:password@host:port/path
```

These transports + direct-auth providers support URL connections:

| Protocol | URL Scheme | Auth Method |
| -------- | ---------- | ----------- |
| FTP | `ftp://` | Password |
| FTPS | `ftps://` | Password + TLS |
| SFTP | `sftp://` | Password / SSH Key |
| WebDAV | `webdav://` / `webdavs://` | Password |
| S3 | `s3://` | Access Key + Secret |
| Azure Blob | `azure://` | HMAC / SAS Token |
| MEGA.nz | `mega://` | Password (E2E) |
| Filen | `filen://` | Password (E2E) |
| Internxt | `internxt://` | Password (E2E) |
| Jottacloud | `jottacloud://` | Bearer Token |
| FileLu | `filelu://` | API Key |
| Koofr | `koofr://` | OAuth2 Token |
| OpenDrive | `opendrive://` | Password |
| Yandex Disk | `yandexdisk://` | OAuth2 (via `--profile`) |
| GitHub | `github://` | PAT / Device Flow |

Saved profiles are the preferred path for browser-authorized and profile-backed API providers such as Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Yandex Disk, 4shared, and Drime. 4shared (OAuth 1.0) tokens are automatically loaded from the vault after GUI authorization.

### Server Profiles (`--profile`)

Connect to any saved server from the encrypted vault with zero credentials exposed in shell history or process lists.

```bash
# List all saved profiles
aeroftp-cli profiles

# Connect by name (fuzzy substring matching)
aeroftp-cli ls --profile "My Server" /path/

# Connect by index number
aeroftp-cli ls --profile 3 /
```

Profile matching order: exact name (case-insensitive), exact ID (UUID), substring match (auto-selects if unique, lists candidates if ambiguous).

### Password Handling

In order of preference:

1. **stdin** (most secure): `echo "$PASS" | aeroftp-cli --password-stdin connect sftp://user@host`
2. **Environment variable**: `AEROFTP_TOKEN=mytoken aeroftp-cli connect jottacloud://user@host`
3. **Interactive prompt**: Hidden TTY input when no password provided
4. **URL** (least secure): `sftp://user:password@host` - warning always displayed

Master password for vault: set `AEROFTP_MASTER_PASSWORD` env var or enter interactively.

## Commands

### connect

Test connectivity, display server info, and disconnect.

```bash
aeroftp-cli connect sftp://user@host
aeroftp-cli connect sftp://user@host --key ~/.ssh/id_ed25519
aeroftp-cli connect ftp://user@host --tls explicit --insecure
```

### ls

```bash
aeroftp-cli ls sftp://user@host /var/www/ -l          # Long format
aeroftp-cli ls sftp://user@host / --sort size --reverse
aeroftp-cli ls --profile "NAS" / --all --json

# v3.6.6: agent-friendly cap + filters
aeroftp-cli ls --profile "NAS" /huge-dir --limit 200 --json
aeroftp-cli ls --profile "NAS" /backups --files-only      # only regular files
aeroftp-cli ls --profile "NAS" /var/www --dirs-only       # only directories
```

The summary in `--json` carries `truncated: bool` and `total_before_limit: int` so agents can detect partial results unambiguously when `--limit` was used. The same trio (`--limit`, `--files-only`, `--dirs-only`) is available on `find`, plus a `--name <glob>` alias for the positional pattern (added v3.6.6).

### get / put

```bash
# Download with glob pattern
aeroftp-cli get sftp://user@host "/data/*.csv"

# Recursive download
aeroftp-cli get sftp://user@host /var/www/ ./backup/ -r

# Upload with glob
aeroftp-cli put sftp://user@host "./*.json" /data/

# Recursive upload
aeroftp-cli put sftp://user@host ./dist/ /var/www/dist/ -r
```

### pget - Segmented Parallel Download (v3.6.5)

```bash
# Default: 4 parallel segments
aeroftp-cli pget --profile "AWS S3" /backup/big.tar.gz ./big.tar.gz

# Tune segment count (range 2-16)
aeroftp-cli pget --profile "AWS S3" /backup/big.tar.gz --segments 8

# JSON progress output
aeroftp-cli pget --profile "AWS S3" /backup/big.tar.gz --json
```

`pget` is now a real subcommand (alias of `get` with the `--segments 4` preset). Splits a single file into N byte ranges and downloads them concurrently, then stitches them back. Useful when latency or per-connection throughput is the bottleneck (large `.tar.gz` archives, S3 buckets in far regions). Falls back to a single sequential stream when the provider does not advertise range-request support.

### mkdir / rm / mv

```bash
aeroftp-cli mkdir sftp://user@host /var/www/new-folder
aeroftp-cli mkdir --profile "S3" /bucket/new -p          # idempotent create-parents (v3.5.2)
aeroftp-cli mkdir --profile "S3" /bucket/new -p --json   # already_existed: bool reported (v3.6.6)

aeroftp-cli rm sftp://user@host /tmp/old-dir/ -rf
aeroftp-cli rm --profile "server" /missing-file --force  # idempotent delete (suppresses NotFound)

aeroftp-cli mv sftp://user@host /docs/draft.md /docs/final.md
```

### cat / stat / find / df / tree

```bash
aeroftp-cli cat sftp://user@host /etc/config.ini | grep DB_HOST
aeroftp-cli stat sftp://user@host /var/www/index.html --json
aeroftp-cli find sftp://user@host /var/www/ "*.php"
aeroftp-cli df sftp://user@host
aeroftp-cli tree sftp://user@host /var/www/ -d 2
```

### head / tail

```bash
# First 5 lines of a remote file
aeroftp-cli head --profile "server" /var/log/app.log -n 5

# Last 20 lines (default)
aeroftp-cli tail --profile "server" /var/log/app.log

# JSON output
aeroftp-cli head --profile "server" /file.txt -n 3 --json

# v3.6.6: byte-range preview (works on binary content too)
aeroftp-cli head --profile "S3" /backups/db.dump -c 4096 --json
aeroftp-cli head --profile "S3" /backups/db.dump --bytes 8192 --json
```

The `-c / --bytes <N>` flag (added v3.6.6) returns the first N bytes of any remote file without downloading the whole thing. JSON output reports `bytes_returned`, `total_size`, `truncated`, and `encoding` (`utf-8` for text, `base64` when bytes are not valid UTF-8). Closes the "no way to preview the first 4 KiB without a full download" gap surfaced by the AI-agent black-box audit.

### touch

```bash
# Create empty file
aeroftp-cli touch --profile "server" /remote/newfile.txt

# Verify existing file (no error)
aeroftp-cli touch --profile "server" /remote/existing.txt
```

### hashsum

Algorithms: `md5`, `sha1`, `sha256`, `sha512`, `blake3`.

```bash
aeroftp-cli hashsum --profile "server" sha256 /data/file.bin
aeroftp-cli hashsum sftp://user@host blake3 /path/file.dat --json
```

Output matches standard `sha256sum` format: `<hash>  <path>`.

### check

Verify that a local directory matches a remote directory. The `rclone check`-equivalent for AeroFTP: scans both sides in parallel, classifies every file, and reports differences without modifying anything.

```bash
# Compare by size + mtime (default, fast)
aeroftp-cli check --profile "server" /local/dir /remote/dir

# Compare by SHA-256 checksum (downloads the remote bytes for hashing)
aeroftp-cli check --profile "server" /local/ /remote/ --checksum

# One-way: only check files present locally — ignore extra files on the remote
aeroftp-cli check --profile "server" /local/ /remote/ --one-way

# Machine-readable output for CI / scripting
aeroftp-cli check --profile "server" /local/ /remote/ --json
```

#### Output classes

Each entry is classified into exactly one of:

| Status | Meaning |
|---|---|
| `match` | File present on both sides with same size (and same checksum if `--checksum`) |
| `differ` | File present on both sides but differs (size or checksum mismatch) |
| `missing_local` | File exists only on the remote (suppressed by `--one-way`) |
| `missing_remote` | File exists only locally |

#### JSON envelope

```json
{
  "status": "ok" | "differences_found",
  "match_count": 1234,
  "differ_count": 0,
  "missing_local": 5,
  "missing_remote": 2,
  "elapsed_secs": 4.21,
  "details": [
    {"path": "docs/api.md", "status": "differ", "local_size": 4096, "remote_size": 4123},
    {"path": "build/output.bin", "status": "missing_remote", "local_size": 81920, "remote_size": null}
  ],
  "suggested_next_command": "aeroftp-cli sync --profile \"server\" \"/local/\" \"/remote/\" --dry-run --json"
}
```

The `suggested_next_command` field is the natural follow-up: a `sync --dry-run` you can review before applying changes.

#### Exit codes

| Code | Meaning |
|---|---|
| `0` | OK — no differences |
| `4` | Differences found (any of `differ`, `missing_local`, `missing_remote`) |
| `5` | Local path is not a directory |
| `6` | Connection / authentication failed |
| `2` | Remote path not found |

The `4` on diff makes `check` directly usable as a CI gate:

```bash
# Block deploy if remote drifted from the source tree
aeroftp-cli check --profile "prod-cdn" ./public /assets --checksum && ./deploy.sh
```

### about

Detailed server info with storage quota - more comprehensive than `df`.

```bash
# Server info with storage quota
aeroftp-cli about --profile "server"

# JSON output
aeroftp-cli about --profile "server" --json
```

Shows provider name, type, server software, protocol version, connection parameters, and storage quota (used/free/total) when available. Some object-storage providers do not expose quota via the upstream API, so `about` and `df` may return provider info without quota fields.

### dedupe

Find and remove duplicate files by content hash (SHA-256).

```bash
# Scan for duplicates (report only)
aeroftp-cli dedupe --profile "server" /data --dry-run

# Delete duplicates (keep first occurrence)
aeroftp-cli dedupe --profile "server" /data --mode skip

# JSON output with group details
aeroftp-cli dedupe --profile "server" /data --dry-run --json
```

Groups files by size first (fast pre-filter), then hashes to confirm. Modes: `skip` (report only), `newest`, `oldest`, `largest`, `smallest`, `rename` (rename with numeric suffix), `interactive` (prompt per group, TTY-only), `list` (list without action).

### cleanup

Scan for orphaned `.aerotmp` files from interrupted downloads.

```bash
# Dry-run: list orphaned temp files
aeroftp-cli cleanup --profile "server" /remote/path/ --json

# Delete orphaned temp files
aeroftp-cli cleanup --profile "server" /remote/path/ --force
```

Dry-run by default. JSON output includes `orphans`, `bytes`, and `bytes_freed`.

### sync

```bash
# Preview changes
aeroftp-cli sync --profile "server" ./local/ /remote/ --dry-run

# Upload only
aeroftp-cli sync --profile "server" ./local/ /remote/ --direction upload

# Mirror mode (delete orphans)
aeroftp-cli sync sftp://user@host ./local/ /remote/ --delete

# Exclude patterns
aeroftp-cli sync --profile "server" ./local/ /remote/ --exclude "*.tmp" --exclude ".git"

# Safety: abort if too many deletes
aeroftp-cli sync --profile "server" ./local/ /remote/ --delete --max-delete 50
aeroftp-cli sync --profile "server" ./local/ /remote/ --delete --max-delete 25%

# Detect renamed files to avoid re-upload
aeroftp-cli sync --profile "server" ./local/ /remote/ --delete --track-renames --dry-run
# Without --track-renames: 1 upload + 1 delete
# With --track-renames: 1 server-side rename (no data transfer)

# Time-based bandwidth schedule
aeroftp-cli sync --profile "server" ./local/ /remote/ --bwlimit "08:00,512k 12:00,10M 18:00,512k 23:00,off"

# Simple bandwidth limit
aeroftp-cli sync --profile "server" ./local/ /remote/ --bwlimit "1M"

# Bisync with conflict resolution
aeroftp-cli sync --profile "server" ./local/ /remote/ --conflict-mode newer
aeroftp-cli sync --profile "server" ./local/ /remote/ --conflict-mode skip --dry-run

# Rename mode: keep both versions (local uploaded as .conflict-{timestamp})
aeroftp-cli sync --profile "server" ./local/ /remote/ --conflict-mode rename

# Immutable mode: never overwrite existing files
aeroftp-cli sync --profile "server" ./local/ /remote/ --immutable

# Transfer only listed files
aeroftp-cli sync --profile "server" ./local/ /remote/ --files-from list.txt

# Skip remote listing (assume empty destination)
aeroftp-cli sync --profile "server" ./local/ /remote/ --no-check-dest

# S3 optimization: recursive listing in a single API call
aeroftp-cli sync --profile "S3" ./local/ /remote/ --fast-list

# Force full resync (discard snapshot)
aeroftp-cli sync --profile "server" ./local/ /remote/ --resync

# Backup before overwrite/delete
aeroftp-cli sync --profile "server" ./local/ /remote/ --delete --backup-dir /tmp/bak
```

Bisync (`--direction both`, the default) saves a `.aeroftp-bisync.json` snapshot after each successful sync, enabling delta detection and bidirectional delete propagation. Conflict modes: `newer` (default), `older`, `larger`, `smaller`, `skip`, `rename`.

### reconcile

Categorized local-vs-remote diff. Returns 4 buckets (matches / differs / missing-remote / missing-local) for AI agents and CI pipelines that need to *plan* a sync before executing it.

```bash
# Detailed diff with all 4 categories
aeroftp-cli reconcile --profile "server" ./local /remote --json > diff.json

# Summary mode (counts only)
aeroftp-cli reconcile --profile "server" ./local /remote --reconcile-format summary

# Feed the diff into a sync without rescanning
aeroftp-cli sync --profile "server" ./local /remote --from-reconcile diff.json --direction upload
```

### sync-doctor

Pre-sync preflight checks. Emits a JSON report with planned upload/download/delete counts, bandwidth estimate, top-level diff buckets, and a `next_command` field with the exact `aeroftp-cli sync ...` invocation that matches the preflight.

```bash
aeroftp-cli sync-doctor --profile "server" ./local /remote --json
```

**Recommended discovery surface for AI coding agents** before they execute any mutating sync.

### speed

Bandwidth benchmark - uploads a synthetic file, downloads it back, reports upload/download MB/s, latency, and round-trip time. v3.6.6 hardened the path: random non-compressible payload (was zeros), SHA-256 integrity check, TTFB measurement, optional `--no-integrity` flag, automatic password redaction in every output stream.

```bash
# Default (10 MB synthetic file)
aeroftp-cli speed --profile "server"

# Custom size (alias --size / -s)
aeroftp-cli speed --profile "server" --size 100M

# Skip integrity SHA-256 (faster on slow CPUs)
aeroftp-cli speed --profile "server" --size 100M --no-integrity

# JSON output (schema: aeroftp.speedtest.v1)
aeroftp-cli speed --profile "server" --size 50M --json
```

### speed-compare (v3.6.6)

Multi-server benchmark in parallel. Emits a ranked comparison table with download/upload throughput, TTFB, and SHA-256 integrity status.

```bash
# Rank two or more servers side-by-side
aeroftp-cli speed-compare sftp://user@host1 sftp://user@host2 sftp://user@host3

# Custom test size and parallelism (up to 4 parallel runs, default 2)
aeroftp-cli speed-compare --size 100M --parallel 4 sftp://user@host1 sftp://user@host2

# Persist reports to disk (JSON v1 + CSV + Markdown)
aeroftp-cli speed-compare sftp://user@host1 sftp://user@host2 \
    --json-out report.json --csv-out report.csv --md-out report.md
```

Schema `aeroftp.speedtest.v1` is stable across single-server (`speed`) and multi-server (`speed-compare`) reports. The CLI matches the GUI's **Server SpeedTest** dialog (Single / Compare tabs, multi-select up to 8 servers, regression warning when last run is < median &times; 0.7).

**Output safety**: `redact_url_for_display()` strips passwords from every output path (stdout / JSON / CSV / MD); `csv_cell_safe()` neutralizes spreadsheet formula triggers (`=`, `+`, `-`, `@`); `md_cell_safe()` escapes pipes, newlines and backslashes. SQLite history (WAL mode, 0600/0700 perms, 1000-row cap) keeps a local benchmark log.

### transfer

Cross-profile copy between two saved servers.

```bash
# Preview plan and risk summary
aeroftp-cli transfer-doctor "FTP Aruba" "AWS S3" /www.site.it /backup/site --json

# Execute recursive copy
aeroftp-cli transfer "FTP Aruba" "AWS S3" /www.site.it /backup/site --recursive

# Skip existing files on destination
aeroftp-cli transfer "Cloudflare R2" "Wasabi" /logs /archive/logs --recursive --skip-existing
```

Use this when both endpoints are already stored as AeroFTP profiles. `transfer-doctor` is the recommended first step for automation because it returns the plan, risks, and suggested next command.

### mount

Mount any remote as a local FUSE filesystem. Any application can access remote files with standard tools.

> The GUI [Mount Manager](/features/mount-manager) (v3.7.1) wraps this command with a persistent registry: save mount configs (profile, remote path, mountpoint, read-only, cache TTL, allow-other, autostart) once and mount them with a single click. Autostart installs systemd-user units on Linux and Task Scheduler ONLOGON entries on Windows. The registry can live in a daemon-friendly sidecar JSON or in the encrypted vault.

```bash
# Mount S3 as local directory
mkdir /mnt/cloud
aeroftp-cli --profile "S3 Storj" mount /mnt/cloud

# Read-only mode
aeroftp-cli --profile "server" mount /mnt/remote --read-only

# Custom cache TTL
aeroftp-cli --profile "NAS" mount /mnt/nas --cache-ttl 60

# Windows: mount as drive letter
aeroftp-cli --profile "server" mount Z:
```

Full read-write: ls, cat, cp, vim, grep, mkdir, rm, touch, mv, df. File managers (Nautilus, Dolphin, Explorer) browse the mount natively. Linux/macOS use FUSE, Windows uses a WebDAV bridge mapped as network drive. Unmount: `fusermount -u /mnt/cloud` or Ctrl+C.

### ncdu

Interactive TUI disk usage explorer for remote storage.

```bash
aeroftp-cli --profile "server" ncdu /          # Interactive TUI
aeroftp-cli --profile "server" ncdu / -d 5     # Depth limit
aeroftp-cli --profile "server" ncdu / --export /tmp/usage.json   # Export JSON
aeroftp-cli --profile "server" ncdu / --json   # JSON to stdout
```

TUI controls: Up/Down navigate, Enter opens directory, Backspace goes back, q quits. Directories sorted by size descending with visual percentage bars.

### serve

Expose any remote as a local server of the chosen protocol. Anonymous access, Ctrl+C to stop.

```bash
# HTTP (read-only, range requests, directory listing)
aeroftp-cli --profile "server" serve http _ / --addr 127.0.0.1:8080

# WebDAV (read-write, 8 methods)
aeroftp-cli --profile "server" serve webdav _ / --addr 127.0.0.1:8080

# FTP (read-write, passive mode)
aeroftp-cli --profile "server" serve ftp _ / --addr 0.0.0.0:2121 --passive-ports 49152-49200

# SFTP (read-write, ED25519 host key)
aeroftp-cli --profile "server" serve sftp _ / --addr 0.0.0.0:2222
```

Any FTP/SFTP/WebDAV/HTTP client can now access AeroFTP's 7 transport protocols and 20+ native provider integrations (plus the GitHub repository backend) as if they were standard local servers.

### daemon

Background service for persistent mounts, scheduled transfers, and job management.

```bash
aeroftp-cli daemon start                  # Start (HTTP API on port 14320)
aeroftp-cli daemon status                 # Check status + job counts
aeroftp-cli daemon stop                   # Stop
curl http://localhost:14320/health         # Health check
```

### jobs

Manage background transfer jobs (requires daemon running).

```bash
aeroftp-cli jobs add get --profile "S3" /backups/db.sql ./   # Queue a job
aeroftp-cli jobs list                                        # List all jobs
aeroftp-cli jobs status <id>                                 # Check one job
aeroftp-cli jobs cancel <id>                                 # Cancel
```

Jobs are persisted in SQLite (`~/.config/aeroftp/jobs.db`) and survive daemon restarts.

### crypt

Zero-knowledge encrypted storage on any provider. Content encrypted with AES-256-GCM (64KB blocks, hardware accelerated), filenames encrypted with AES-256-SIV, key derivation via Argon2id.

```bash
# Initialize encrypted overlay
AEROFTP_CRYPT_PASSWORD=MySecret aeroftp-cli --profile "S3" crypt init _ /encrypted

# Upload (content + filename encrypted)
AEROFTP_CRYPT_PASSWORD=MySecret aeroftp-cli --profile "S3" crypt put ./secret.pdf _ /encrypted

# List (decrypted names visible)
AEROFTP_CRYPT_PASSWORD=MySecret aeroftp-cli --profile "S3" crypt ls _ /encrypted

# Download + decrypt
AEROFTP_CRYPT_PASSWORD=MySecret aeroftp-cli --profile "S3" crypt get secret.pdf _ /encrypted ./decrypted.pdf
```

The cloud provider never sees file names or content. Password via env: `AEROFTP_CRYPT_PASSWORD`.

### batch

Execute `.aeroftp` script files with 17 commands, shell-like variable substitution, and error policies.

```bash
aeroftp-cli batch deploy.aeroftp
```

```bash
# deploy.aeroftp
SET SERVER=sftp://deploy@prod.example.com:2222
ON_ERROR FAIL

CONNECT ${SERVER}
PUT ./dist/app.js /var/www/app.js
PUT ./dist/index.html /var/www/index.html
STAT /var/www/index.html
ECHO Deployment complete
DISCONNECT
```

Batch commands: SET, ECHO, ON_ERROR, CONNECT, DISCONNECT, LS, GET, PUT, MKDIR, RM, MV, CAT, STAT, FIND, DF, TREE, SYNC. Variables use `${VAR}` syntax with single-pass expansion (injection-safe). Error policies: `ON_ERROR FAIL` (default), `ON_ERROR CONTINUE`.

### agent

Run AeroAgent from the CLI for natural-language workflows, vault-backed server access, or MCP integration.

```bash
# One-shot instruction
aeroftp-cli agent -m "List files on the Production server" --json

# Explicit provider/model
aeroftp-cli agent --provider xai --model grok-3-mini \
  -m "Check disk usage on all saved servers" -y --json

# Native MCP server over stdio
aeroftp-cli agent --mcp
```

Current agent integrations:

- `aeroftp-cli agent -m ...`: one-shot orchestration through AeroAgent with approval controls
- `aeroftp-cli agent --mcp` / `aeroftp-cli mcp`: native Model Context Protocol server for Claude Desktop, Cursor, VS Code, and other MCP clients

The MCP server exposes 39 curated remote tools (see [MCP Overview](/mcp/overview)), resource discovery for saved profiles/capabilities/connections, reusable prompts, connection pooling with auto-reset, per-profile request serialization, request cancellation, rate limiting, schema validation, and audit logging.

### mcp (top-level shortcut)

```bash
# Start the MCP server on stdin/stdout
aeroftp-cli mcp
```

`aeroftp-cli mcp` is a top-level alias for `aeroftp-cli agent --mcp` (added in v3.5.4). The official VS Code extension `axpdev-lab.aeroftp-mcp` registers exactly this argv, so the shortcut keeps the extension self-contained without nested subcommands. The server initializes the Universal Vault automatically (or falls back to `AEROFTP_MASTER_PASSWORD` when set), serializes per-profile tool calls, and validates `inputSchema.required` before dispatch.

Example Claude Desktop / Claude Code / Cursor configuration:

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

## Agent Discovery & Inventory (v3.6.6)

A dedicated set of subcommands designed for AI coding agents. They return structured JSON describing AeroFTP's capabilities, your saved profile inventory, and per-profile authentication state - all *without* attempting any live connection - so an agent can plan its workflow in one round-trip instead of probing N profiles.

### profiles

```bash
aeroftp-cli profiles            # text table mirroring the GUI My Servers layout
aeroftp-cli profiles --json     # canonical input for agents
aeroftp-cli profiles --csv      # spreadsheet-friendly export
aeroftp-cli profiles -i         # interactive prompt loop (v3.7.1)
```

Lists every server profile in the encrypted vault. The text format mirrors the GUI **My Servers** table (storage Used / Total / %, per-protocol footer, dedup-aware totals); `--json` and `--csv` carry the same columns plus per-profile `auth_state` (`valid` / `expired` / `needs_refresh` / `no_credentials` / `unknown`) so agents can avoid connect-then-fail loops on profiles whose OAuth tokens expired silently. Passwords are never printed.

#### Interactive mode (`-i`, v3.7.1)

After the table renders, `-i` drops into a compact prompt loop with two-character tokens:

| Token | Action |
|-------|--------|
| `1l` / `l1` | List the contents of profile #1 |
| `2t` / `t2` | Tree of profile #2 |
| `3d` / `d3` | Delete profile #3 (gated by name-typed confirmation) |
| `q` | Quit |

Both orderings (number-then-letter and letter-then-number) are accepted. The loop reuses the running binary via `current_exe()` so the output is byte-for-byte identical to the standalone subcommand the same row would invoke.

### ai-models

```bash
aeroftp-cli ai-models            # configured AI providers + models
aeroftp-cli ai-models --json
```

Lists every AI provider configured in the encrypted vault with its associated models. API keys are never printed. Useful for verifying which providers are wired up before invoking `agent --provider <id>`.

### agent-bootstrap

```bash
# General intro payload (recommended starting call for any agent)
aeroftp-cli agent-bootstrap --json

# Task-tailored variants
aeroftp-cli agent-bootstrap --task explore --path /var/www --json
aeroftp-cli agent-bootstrap --task verify-file --remote-path /a.txt --local-path ./a.txt --json
aeroftp-cli agent-bootstrap --task transfer \
    --source-profile "FTP Aruba" --dest-profile "AWS S3" \
    --source-path /www --dest-path /backup/www --json
```

Returns the canonical task-oriented quick-start that agents should follow before issuing real commands. Tasks: `explore`, `verify-file`, `transfer`, `backup`, `reconcile`. The payload includes the recommended workflow, the saved-profile inventory with `auth_state`, and ready-to-run command templates.

### agent-connect

```bash
# Single JSON envelope: connect + capabilities + quota + root listing
aeroftp-cli agent-connect "AWS S3" --json
```

Replaces the `connect &rarr; about &rarr; df &rarr; ls /` boilerplate sequence agents would otherwise have to issue. Returns a JSON envelope with four blocks: `connect`, `capabilities`, `quota`, `path`. Each block carries one of `ok` / `unsupported` / `unavailable` / `error`.

**Live-connect allowlist**: FTP, FTPS, SFTP, WebDAV, S3, GitHub, GitLab. For protocols outside the allowlist (pCloud, Dropbox, OneDrive, Box, Filen, MEGA, Koofr, kDrive, Jottacloud, Drime, FileLu, Yandex, 4shared, Internxt, Swift, Azure, Google Drive, Zoho WorkDrive, Immich) the `connect` block returns `status: "unsupported"` but `capabilities`, `path`, and `profile` stay actionable, and the CLI exits 0 because the rest of the payload is still useful.

Exit codes: `0` ok or unsupported with valid capabilities, `1` connect attempted and failed, `2` profile lookup failed.

### agent-info

```bash
aeroftp-cli agent-info --json
```

Prints structured JSON describing safe / modify / destructive command groups, credential model, output hygiene, the saved profile inventory with per-profile `auth_state`, and (added v3.6.6) a `protocol_features` map keyed by protocol with feature tokens (`share_links`, `resume`, `server_copy`, `versions`, `thumbnails`, `change_tracking`, etc.) plus an `agent_connect_supported_protocols` array.

The `protocol_features` map collapses what used to require N `agent-connect` calls (one per profile) into a single batch query. **Recommended discovery surface for AI coding agents** before any capability-aware tool routing.

---

### import rclone

Import server profiles from rclone configuration files. Supports 17 rclone backend types with automatic password de-obfuscation.

```bash
# Auto-detect rclone.conf location
aeroftp-cli import rclone

# Specify path manually
aeroftp-cli import rclone /path/to/rclone.conf

# JSON output for scripting
aeroftp-cli import rclone --json
```

Supported rclone types: `ftp`, `sftp`, `s3` (all providers), `webdav` (Nextcloud, ownCloud), `drive`, `dropbox`, `onedrive`, `mega`, `box`, `pcloud`, `azureblob`, `swift`, `yandexdisk`, `koofr`, `jottacloud`, `b2`, `opendrive`. Passwords are revealed from rclone's reversible AES-256-CTR obfuscation. Use the GUI import flow (Settings > Export/Import > Import from rclone) to store credentials in the encrypted vault.

For compatibility details about existing `rclone crypt` remotes, see [rclone crypt interoperability](/features/rclone-crypt).

### import rclone-filter

Convert an rclone `--filter-from` file into an `.aeroignore` file (gitignore syntax). Useful when porting an existing rclone workflow to AeroFTP `sync` / `copy` operations that read `.aeroignore` for path filtering.

```bash
# Print the converted .aeroignore to stdout
aeroftp-cli import rclone-filter ~/.config/rclone/filter.txt

# Write directly to a file (refuses to overwrite without --force)
aeroftp-cli import rclone-filter filter.txt -o /project/.aeroignore

# Read filter rules from stdin (e.g. piping from another tool)
cat filter.txt | aeroftp-cli import rclone-filter -

# JSON envelope (status, input path, generated text, warnings)
aeroftp-cli import rclone-filter filter.txt --json
```

#### Why a converter is needed

rclone and gitignore look superficially similar (both use `+`/`-` style include/exclude or `pattern`/`!pattern`, both honor `*` and `**`, both ignore `#` comments) but the **match semantics are opposite**:

| Aspect | rclone | gitignore (`.aeroignore`) |
|---|---|---|
| Match resolution | **First** matching rule wins | **Last** matching rule wins |
| Include syntax | `+ pattern` | `!pattern` |
| Exclude syntax | `- pattern` | `pattern` |
| Reset directive | `! ` clears all rules above | (no equivalent) |
| Comments | `#` and `;` | `#` only |

To preserve precedence, the converter **reverses the rule order**: a rule that appeared first in the rclone file (and therefore had highest priority) ends up *last* in the `.aeroignore`, where it again wins under last-match-wins semantics.

#### Worked example

Input (rclone filter):

```
- target/
- node_modules/
- *.tmp
- *.log
+ /docs/IMPORTANT.md
+ /README.md
```

Output (`.aeroignore`):

```
# Generated by AeroFTP from rclone filter file
# Original rules were in first-match-wins order; here they are reversed
# to preserve semantics under gitignore last-match-wins rules.

!/README.md
!/docs/IMPORTANT.md
*.log
*.tmp
node_modules/
target/
```

The two `+` rules become `!` re-includes and end up at the top, where they win against any later exclude pattern under last-match-wins.

#### Warnings

Two non-fatal warnings can be surfaced (text on stderr, JSON in the `warnings` array). Neither aborts the conversion.

- **`! ` reset directive**: gitignore has no exact equivalent. The rules above the reset are kept (rather than silently discarded as rclone would do at runtime) and the warning prompts you to review and prune them manually if needed.
- **`{a,b}` brace alternation**: gitignore does not support brace expansion. The pattern is passed through unchanged; expand manually (`*.bak` and `*.old` as separate rules) if the rule needs to apply.

#### JSON envelope

```json
{
  "status": "ok",
  "input": "/path/to/filter.txt",
  "aeroignore": "# Generated by AeroFTP ...\n!/README.md\n...",
  "warnings": [
    "line 12: pattern '*.{bak,old}' uses brace alternation '{a,b}' which gitignore does not support; passed through unchanged"
  ]
}
```

When `-o <path>` is provided the envelope replaces the `aeroignore` field with `output` (the destination path) and `bytes_written` (the number of bytes flushed to disk).

#### Exit codes

| Code | Meaning |
|---|---|
| `0` | OK — conversion successful |
| `2` | Input file not found |
| `9` | Output file already exists and `--force` was not given |
| `11` | I/O error (failed to read stdin, write the output, etc.) |

The exit-code-9 design follows the convention used by `aeroftp-cli put -n` (`--no-clobber`): when refusing to overwrite, the operation is treated as "skipped" rather than a hard failure, keeping scripts that rerun the same conversion idempotent.

## GitHub Protocol

Every upload and delete creates a real Git commit. Branch-aware with automatic working branch creation for protected branches.

```bash
aeroftp-cli ls github://token:PAT@owner/repo@develop /src/ -l
aeroftp-cli put github://token:PAT@owner/repo ./fix.py /src/fix.py
aeroftp-cli cat github://token:PAT@owner/repo /README.md
```

## Global Flags

| Flag | Description |
| ---- | ----------- |
| `--profile <name>` / `-P` | Use saved server profile from encrypted vault |
| `--master-password <pw>` | Vault master password (env: `AEROFTP_MASTER_PASSWORD`) |
| `--json` / `--format json` | Structured JSON output to stdout |
| `--quiet` / `-q` | Suppress info messages (errors only) |
| `--verbose` / `-v` | Debug output (`-vv` for trace) |
| `--password-stdin` | Read password from stdin pipe |
| `--key <path>` | SSH private key file |
| `--token <token>` | Bearer/API token (env: `AEROFTP_TOKEN`) |
| `--tls <mode>` | FTP TLS: `none`, `explicit`, `implicit`, `explicit_if_available` |
| `--insecure` | Skip TLS certificate verification |
| `--trust-host-key` | Trust unknown SSH host keys |
| `--two-factor <code>` | 2FA code for Filen/Internxt (env: `AEROFTP_2FA`) |
| `--limit-rate <speed>` | Speed limit (e.g., `1M`, `500K`) |
| `--bwlimit <schedule>` | Bandwidth schedule (e.g., `"08:00,512k 18:00,off"` or `"1M"`) |
| `--bucket <name>` | S3 bucket name |
| `--region <region>` | S3/Azure region |
| `--container <name>` | Azure container name |
| `--include <pattern>` | Include only files matching glob (repeatable) |
| `--exclude-global <pattern>` | Exclude files matching glob (repeatable) |
| `--include-from <file>` | Read include patterns from file |
| `--exclude-from <file>` | Read exclude patterns from file |
| `--min-size <size>` | Min file size filter (`100k`, `1M`, `1G`) |
| `--max-size <size>` | Max file size filter |
| `--min-age <duration>` | Skip files newer than (`7d`, `24h`) |
| `--max-age <duration>` | Skip files older than |
| `--max-transfer <size>` | Abort after N bytes transferred (`10G`, `500M`). Exit code 8 |
| `--retries <n>` | Retry failed transfers N times (default: 3) |
| `--retries-sleep <dur>` | Delay between retries (`5s`, `1m`, `500ms`). Default: 1s |
| `--max-backlog <n>` | Max queued parallel tasks (default: 10000) |
| `--files-from <file>` | Transfer only files listed in file (one per line, `#` comments) |
| `--files-from-raw <file>` | Like `--files-from` but preserves whitespace and empty lines |
| `--immutable` | Never overwrite existing files on destination |
| `--no-check-dest` | Skip remote listing during sync (assume empty destination) |
| `--max-depth <n>` | Maximum recursion depth for ls, find, sync, get -r, put -r |
| `--default-time <ts>` | Fallback mtime when backend returns None (ISO 8601, RFC 3339, or `now`) |
| `--fast-list` | S3 only: recursive listing in a single API call |
| `--inplace` | Write downloads directly to final path (no .aerotmp temp file) |
| `--chunk-size <size>` | Override upload chunk size (e.g., `64M`). Min 5M for S3 |
| `--buffer-size <size>` | Override download buffer size (e.g., `256K`, `1M`) |
| `--dump <kinds>` | Debug: `headers`, `bodies`, `auth` (comma-separated) |

## Bandwidth Schedule (`--bwlimit`)

The `--bwlimit` flag accepts either a **plain rate** (`1M`, `500K`, `2G`, ...) or a **time-of-day schedule** in the rclone-compatible format:

```
"HH:MM,RATE HH:MM,RATE ..."
```

Each entry is a comma-separated pair: a time of day (24-hour `HH:MM`, **local time**) and a rate. Use the literal `off` (or `0`) to mean "unlimited". Whitespace separates entries; entries can be in any order — they are sorted internally before lookup.

```bash
# Throttle to 512 KB/s during business hours, ramp up to 10 MB/s at lunch,
# go full-speed after work, completely off overnight
aeroftp-cli sync --profile "backup" ./local /remote --bwlimit "08:00,512k 12:00,10M 18:00,off 23:00,off"
```

#### How the active rate is resolved

At runtime the active rate is the **last entry whose time is `<= now`**. If `now` is earlier than the first scheduled entry of the day, the schedule **wraps around midnight** and the rate of the *last* entry of the day stays in effect. So for `"09:00,1M 18:00,off"` the rate is `off` between midnight and 09:00.

Example with hours of the day on a single line:

```
   00:00         09:00          18:00            24:00
       │           │               │                │
       │   off    │   1 MB/s    │     off        │
       │ (wrap   ) │ (active)    │ (active)       │
```

#### Local time, not UTC

Times are interpreted in the local timezone of the machine running the CLI (matching rclone's behavior). On a host in CET, `08:00` means 8 AM Central European Time, not UTC. This is a deliberate choice for ergonomic scheduling.

#### Validation

- `HH` must be in `0..=23`, `MM` must be in `0..=59`. Malformed entries (e.g. `25:00,1M` or `10:99,2M`) are silently skipped — they cannot brick a schedule because the parser treats them as no-op.
- A schedule with **only** a plain rate and no `,` is treated as a global cap (`--bwlimit "1M"`).
- A schedule with **only** malformed entries falls back to "no limit" rather than crashing.

#### Limitation: rate is resolved once per command

The active rate is computed when the command starts. A long-running `sync --watch` that crosses a scheduled boundary (e.g. starts at 17:55 with `"18:00,off"`) will **not** automatically downshift at 18:00 in the current implementation. If this matters for your workflow, file a feature request — the design is documented in [APPENDIX-U §13.2](https://github.com/axpnet/AeroFTP) and the live re-poll is a 1-2h follow-up.

## Output Hygiene

The CLI follows Unix conventions: **stdout** carries data only (file listings, content, JSON), **stderr** carries messages (progress bars, summaries, connection status). This makes piping safe:

```bash
aeroftp-cli ls sftp://user@host / --json 2>/dev/null | jq '.entries[].name'
aeroftp-cli cat sftp://user@host /data.csv > output.csv 2>/dev/null
```

Respects `NO_COLOR`, `CLICOLOR`, and `CLICOLOR_FORCE` environment variables.

## Exit Codes

| Code | Meaning |
| ---- | ------- |
| 0 | Success |
| 1 | Connection / network error |
| 2 | Not found |
| 3 | Permission denied |
| 4 | Transfer failed |
| 5 | Configuration / usage error |
| 6 | Authentication failed |
| 7 | Not supported by protocol |
| 8 | Timeout |
| 9 | Already exists / directory not empty (`--immutable`, `--no-clobber`) |
| 10 | Server error / parse error |
| 11 | I/O error |
| 99 | Unknown error |

## CI/CD Example

```yaml
# GitHub Actions deployment
- name: Deploy to server
  env:
    DEPLOY_PASS: ${{ secrets.DEPLOY_PASSWORD }}
  run: |
    echo "$DEPLOY_PASS" | aeroftp-cli --password-stdin put \
      sftp://deploy@prod.example.com ./dist/ /var/www/ -r
```

For OAuth providers in CI, use `--profile` with the vault pre-configured on the runner:

```bash
AEROFTP_MASTER_PASSWORD=${{ secrets.VAULT_PW }} \
  aeroftp-cli sync --profile "Production S3" ./build/ / --delete
```

## Recent Highlights

- **v3.6.6 - Agent surface, onboarding polish, server SpeedTest**: new `agent-connect` (single-shot connect / capabilities / quota / path), `agent-info --json protocol_features` + `agent_connect_supported_protocols`, `head -c / --bytes` byte-range preview, `ls --limit` / `--files-only` / `--dirs-only` (same trio on `find` plus `--name <glob>`), `mkdir --json already_existed: bool`, per-profile `auth_state` (`valid` / `expired` / `needs_refresh` / `no_credentials` / `unknown`), `speed-compare` multi-server benchmark with JSON v1 / CSV / MD reports + password redaction. Cross-profile multi-select on My Servers and a new IconPicker dialog ship in the GUI counterpart.
- **v3.6.5 - Throughput parity with rclone, FTP home-directory fix, OAuth profile rename**: plain-FTP TLS-drain bypass (-74% on 100 MiB Docker FTP), SFTP buffer raised to 256 KiB (-36%), WebDAV PUT body 8 KiB &rarr; 256 KiB (-33%); FTP CLI now respects the server-provided home directory after login (no spurious `CWD /`); OAuth saved servers can be renamed from the Edit dialog (issue #127); `find` glob no longer matches as substring across 7 cloud providers; `mkdir + put` works on empty-prefix object stores; Dropbox missing-file detection drops the failure latency from ~3.5 s to ~150 ms; Koofr WebDAV preset path fix (issue #126); `pget` is now a real subcommand; banner cleanup; 39 `default_value = "_"` arguments now hide the `[default: _]` sentinel.
- **v3.6.4 - Windows keystore export fix, autostart UX, update opt-out**: `os error 5` on Windows export resolved (write handle kept through `flush + sync_all`); "Start minimized to tray" + "Don't check for updates" toggles; NSIS post-install hooks now actually run (CUSTOM_PRE_INSTALL macro names corrected) so HKCU PATH registration finally activates on every install (issue #125); silent uninstall preserves user data on WinGet upgrades.
- **v3.6.1 - Windows first-class delta sync**: AeroFTP ships **`aerorsync`**, a native rsync protocol 31 implementation in pure Rust. No `rsync.exe` bundle, no WSL requirement, byte-identical to stock rsync 3.4.1 in CI. See [AeroRsync](/features/aerorsync) for the architecture and [Delta Sync](/features/delta-sync) for the user-facing UI.
- **v3.5.4 - MCP hardening**: top-level `aeroftp-cli mcp`, vault auto-init in MCP, per-profile serialization, schema validation, S3 bucket fix from vault profiles, FTP/SFTP/WebDAV/Filen/FileLu/Drime/Immich error message hardening.
- **v3.5.3 - `sync --watch`**: continuous bidirectional sync with native filesystem watcher (inotify / FSEvents / ReadDirectoryChangesW), anti-loop cooldown, NDJSON output. **First CLI on the market with this feature natively** (rclone doesn't ship it).
- **v3.5.3 - Agent-friendly flags**: `--files-from`, `--immutable`, `--no-check-dest`, `--max-depth`, `--inplace`, `--fast-list` (S3), `--compare-dest` / `--copy-dest`, `cleanup` for orphan `.aerotmp`.
- **v3.5.2 - Determinism**: 12 structured exit codes mapping all `ProviderError` variants, `mkdir --parents`, `rm --force`, `put --no-clobber`, `--chunk-size` / `--buffer-size` overrides.
- **v3.3.4 - Local server bridges**: `serve http`, `serve webdav`, `serve ftp`, `serve sftp`.

## Test Results (v3.5.3)

**376 unit tests**, all passing. Run with `cargo test` in `src-tauri/`.

### Provider Coverage (116 tests)

| Provider | Tests | Areas |
| -------- | ----- | ----- |
| GitHub | 55 | Client, errors, GraphQL, rate limiting, releases, repo mode, branches, paths |
| MEGA | 19 | AES-CBC/CTR/ECB, chunk MAC, KDF v2, node keys, base64, native API, paths |
| Yandex Disk | 7 | Path encoding, resource entries, path resolution |
| FileLu | 6 | Deserialization, MIME detection, path normalization |
| FTP | 5 | DOS/Unix/MLSD listing parsing |
| Koofr | 4 | Config validation, timestamps, path splitting |
| WebDAV | 3 | XML properties, URL building, PROPFIND parsing |
| SFTP | 3 | Permissions formatting, path normalization, provider creation |
| S3 | 2 | Path-style and virtual-hosted URL building |
| OAuth 1.0 | 3 | Nonce, percent encoding, timestamps |
| OAuth 2.0 | 2 | Google config, callback parsing |
| HTTP retry | 2 | Delay bounds, retryable status codes |
| Provider types | 4 | Default ports, MEGA config modes, entry extensions |
| Provider factory | 10 | Server field parsing (hostname, IP, IPv6, WebDAV paths, ports) |

### CLI Binary (90 tests)

| Area | Tests | Details |
| ---- | ----- | ------- |
| URL parsing | 10 | FTP, SFTP, S3, WebDAV, MEGA, Koofr, OpenDrive, GitHub (incl. branch suffix, token) |
| pget (parallel download) | 10 | Chunk planning, assembly, binary integrity, temp cleanup, edge cases |
| serve http | 11 | Path sanitization, traversal prevention, URI decoding, null byte injection, bind validation |
| serve webdav | 5 | PROPFIND XML, file/dir entries, destination parsing, path building |
| Range requests | 5 | Normal, open-end, suffix, clamped, invalid |
| Speed limits | 5 | MB, KB, bytes, case-insensitive, invalid |
| Path validation | 5 | Traversal, null bytes, Windows drives, dotfiles, relative paths |
| Service auth | 6 | Loopback vs remote tokens, bearer/basic auth, credential generation |
| S3 profile defaults | 3 | Google preset, Wasabi template, existing endpoint preservation |
| Filename sanitization | 3 | Normal, ANSI escape removal, control characters |
| Profile options | 2 | Tencent COS path style, camelCase-to-snake_case |
| Tool policy | 2 | Danger levels, metadata/preview/exec distinction |
| Update checks | 2 | 24-hour frequency, invalid timestamp recovery |
| Release versioning | 2 | v-prefix stripping, semver comparison |
| Output formatting | 2 | Size (bytes to GB), speed |
| Provider port detection | 2 | Server info parsing, protocol fallback |
| Error exit codes | 1 | Provider error mapping |
| Agent path confinement | 1 | Initial path restriction |
| HTML escaping | 1 | XSS prevention |
| Served path building | 1 | Backend path with traversal confinement |

### Core Engine (170 tests)

| Module | Tests | Details |
| ------ | ----- | ------- |
| rclone crypt | 23 | EME encrypt/decrypt, name encrypt/decrypt, key derivation, chunk nonces, PKCS7, end-to-end |
| sync | 18 | Error classification, file comparison, journal, path portability, snapshots, templates, filters |
| sync scheduler | 17 | Time windows, day filters, overnight carry-over, interval validation, weekday logic |
| delta sync | 12 | Block sizing, signatures, rolling checksums, delta reconstruction, serialization |
| file watcher | 12 | Lifecycle, exclusions (git, OS, temp), event mapping, inotify capacity, modes |
| cross-profile transfer | 12 | Path mapping, time parsing, plan generation, request serialization |
| transfer pool | 10 | Compression modes, config validation, parallel sync results, extension detection |
| rclone import | 10 | INI parsing, FTP/FTPS/WebDAV mapping, obscure/reveal, export |
| MCP server | 12 | Initialize, transcript, tools/resources/prompts listing, request ID handling, cancel keys |
| cloud config | 5 | Default config, validation, conflict strategy, protocol backward compat |
| sync ignore | 5 | Patterns, comments, directory-only, negation, empty files |
| speech (STT) | 6 | Language normalization, WAV validation (mono/16kHz), transcription |
| provider commands | 8 | Remote URL matching (SSH, HTTPS, case-insensitive, boundary, collision) |
| transfer domain | 3 | Error redaction, timeout mapping, unknown kind fallback |
| agent memory DB | 2 | Prompt injection sanitization, content stripping |
| FTP transfer executor | 2 | Remote path splitting |
| session manager | 1 | Session lifecycle |
| session pool | 1 | Pool config validation |
| transfer settings | 1 | Serialization roundtrip |

### Live Provider Tests

All commands tested live against 12 providers via `--profile`:

| Provider | Protocol | connect | ls | put/get | head/tail | hashsum | check | about | df |
|---|---|---|---|---|---|---|---|---|---|
| WD MyCloud NAS | SFTP | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| axpdev.it | FTP | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Playground | GitHub | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| MEGA.nz | MEGA | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| OpenDrive | OpenDrive | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Filen | Filen (E2E) | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Koofr | WebDAV | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Koofr | Native API | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| WD MyCloud NAS | WebDAV | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Backblaze B2 | S3 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| Azure | Azure Blob | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 4shared | OAuth 1.0 | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Additional commands tested on SFTP: `mkdir`, `rm`, `mv`, `cat`, `stat`, `find`, `tree`, `touch`, `dedupe`, `track-renames`, `bwlimit` - all PASS.

Filter system (`--include`, `--exclude-global`, `--min-size`, `--max-size`) and `check` with `hashsum` round-trip verification all passed on all providers.

### v3.5.3 Flag Validation & Stress Tests

46 targeted tests across 5 servers (FTP Docker, WebDAV Docker, SFTP Docker, S3 iDrive, SFTP NAS WD MyCloud). All PASS.

| Category | Tests | Servers | Result |
| -------- | ----- | ------- | ------ |
| Safety guards (`--no-check-dest + --delete`, `--immutable + --no-check-dest`) | 2 | FTP | PASS |
| `--files-from` (missing file, >10MB, filtering) | 4 | FTP | PASS |
| `--default-time` (invalid, naive, now, RFC 3339 Z, RFC 3339 +offset) | 5 | FTP | PASS |
| `--immutable` put single (skip existing) | 4 | FTP, WebDAV, S3, NAS | PASS |
| `--immutable` get (skip existing local) | 4 | FTP, WebDAV, S3, NAS | PASS |
| `--immutable` put -r (upload new, skip existing) | 4 | FTP, WebDAV, S3, NAS | PASS |
| `--no-check-dest` sync | 4 | FTP, WebDAV, S3, NAS | PASS |
| `--fast-list` (S3 recursive, FTP fallback) | 2 | S3, FTP | PASS |
| `--inplace` download | 4 | FTP, WebDAV, S3, NAS | PASS |
| `cleanup` dry-run + `--force` | 2 | FTP, WebDAV | PASS |
| `rm -r` multi-level (3-4 levels deep) | 3 | FTP, WebDAV, NAS | PASS |
| Bisync `--conflict-mode rename` | 3 | FTP, WebDAV, S3 | PASS |
| Stress: 50-file batch upload (parallel 8) | 1 | FTP Docker | PASS (0.8s) |
| Stress: 30-file batch upload (parallel 4) | 1 | S3 iDrive | PASS (20.5s) |
| Stress: bisync with 10 simultaneous conflicts | 1 | FTP Docker | PASS |
| `dedupe --mode list` | 1 | FTP | PASS |
| `--max-depth` find | 1 | FTP | PASS |

### Advanced Features (v3.4.8)

56 tests on 9 providers (Storj S3, Cloudflare R2, FTP Aruba, jianguoyun, InfiniCloud, Koofr, CloudMe, MEGA, 4Shared):

| Feature | Tests | Passed | Providers |
| ------- | ----- | ------ | --------- |
| mount (FUSE r/w) | 11 | 11 | S3, R2, FTP, WebDAV x4, MEGA |
| serve ftp | 6 | 6 | S3 |
| serve sftp | 1 | 1 | S3 |
| daemon + jobs | 5 | 5 | - |
| bisync (snapshot, conflict modes) | 7 | 7 | S3 |
| ncdu TUI | 4 | 4 | S3, R2, FTP |
| crypt overlay | 8 | 8 | S3 |
| transfer controls | 11 | 11 | S3, R2, FTP |
| serve http | 3 | 3 | S3, SFTP, FTP |
| **Total** | **56** | **56** | all passing |
