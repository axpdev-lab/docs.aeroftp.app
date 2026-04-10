# CLI Commands

Complete reference for the `aeroftp-cli` binary. It shares the same Rust backend as the desktop app, with direct URL support for core protocols, saved-profile access for GUI-authorized providers, structured JSON output, and Unix pipeline compatibility.

## Connection Methods

### URL Format

```
protocol://user:password@host:port/path
```

These protocols support direct URL connections:

| Protocol | URL Scheme | Auth Method |
| -------- | ---------- | ----------- |
| FTP | `ftp://` | Password |
| FTPS | `ftps://` | Password + TLS |
| SFTP | `sftp://` | Password / SSH Key |
| WebDAV | `webdav://` / `webdavs://` | Password |
| S3 | `s3://` | Access Key + Secret |
| MEGA.nz | `mega://` | Password (E2E) |
| Azure Blob | `azure://` | HMAC / SAS Token |
| Filen | `filen://` | Password (E2E) |
| Internxt | `internxt://` | Password (E2E) |
| Jottacloud | `jottacloud://` | Bearer Token |
| FileLu | `filelu://` | API Key |
| Koofr | `koofr://` | OAuth2 Token |
| OpenDrive | `opendrive://` | Password |
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
```

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

### mkdir / rm / mv

```bash
aeroftp-cli mkdir sftp://user@host /var/www/new-folder
aeroftp-cli rm sftp://user@host /tmp/old-dir/ -rf
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
```

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

Verify that a local directory matches a remote directory.

```bash
# Compare by size (default)
aeroftp-cli check --profile "server" /local/dir /remote/dir

# Compare by SHA-256 checksum
aeroftp-cli check --profile "server" /local/ /remote/ --checksum

# One-way: only check files present locally
aeroftp-cli check --profile "server" /local/ /remote/ --one-way
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

Groups files by size first (fast pre-filter), then hashes to confirm. Modes: `skip` (report only), `newest`, `oldest`, `largest`, `smallest`.

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

# Force full resync (discard snapshot)
aeroftp-cli sync --profile "server" ./local/ /remote/ --resync

# Backup before overwrite/delete
aeroftp-cli sync --profile "server" ./local/ /remote/ --delete --backup-dir /tmp/bak
```

Bisync (`--direction both`, the default) saves a `.aeroftp-bisync.json` snapshot after each successful sync, enabling delta detection and bidirectional delete propagation. Conflict modes: `newer` (default), `older`, `larger`, `smaller`, `skip`.

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

Any FTP/SFTP/WebDAV/HTTP client can now access all 27 AeroFTP providers as if they were standard servers.

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
- `aeroftp-cli agent --mcp`: native Model Context Protocol server for Claude Desktop, Cursor, VS Code, and other MCP clients

The current MCP server exposes 16 curated remote tools, resource discovery for saved profiles/capabilities/connections, reusable prompts, connection pooling, request cancellation, rate limiting, and audit logging.

Example Claude Desktop configuration:

```json
{
  "mcpServers": {
    "aeroftp": {
      "command": "aeroftp-cli",
      "args": ["agent", "--mcp"]
    }
  }
}
```

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
| `--dump <kinds>` | Debug: `headers`, `bodies`, `auth` (comma-separated) |

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

## Test Results (v3.4.8)

**365 unit tests**, all passing. Run with `cargo test` in `src-tauri/`.

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

### CLI Binary (79 tests)

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
