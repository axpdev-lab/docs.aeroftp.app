# CLI Commands

Complete reference for the `aeroftp-cli` binary. It shares the same Rust backend as the desktop app, supporting 23 protocols through 19 subcommands with consistent behavior, structured JSON output, and Unix pipeline compatibility.

## Connection Methods

### URL Format

```
protocol://user:password@host:port/path
```

14 protocols support direct URL connections:

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

9 OAuth providers (Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Yandex Disk, 4shared, kDrive) require `--profile` — authorize once in the GUI, then reuse in the CLI. 4shared (OAuth 1.0) tokens are automatically loaded from the vault after GUI authorization.

### Server Profiles (`--profile`)

Connect to any saved server from the encrypted vault with zero credentials exposed in shell history or process lists.

```bash
# List all saved profiles
aeroftp profiles

# Connect by name (fuzzy substring matching)
aeroftp ls --profile "My Server" /path/

# Connect by index number
aeroftp ls --profile 3 /
```

Profile matching order: exact name (case-insensitive), exact ID (UUID), substring match (auto-selects if unique, lists candidates if ambiguous).

### Password Handling

In order of preference:

1. **stdin** (most secure): `echo "$PASS" | aeroftp --password-stdin connect sftp://user@host`
2. **Environment variable**: `AEROFTP_TOKEN=mytoken aeroftp connect jottacloud://user@host`
3. **Interactive prompt**: Hidden TTY input when no password provided
4. **URL** (least secure): `sftp://user:password@host` — warning always displayed

Master password for vault: set `AEROFTP_MASTER_PASSWORD` env var or enter interactively.

## Commands

### connect

Test connectivity, display server info, and disconnect.

```bash
aeroftp connect sftp://user@host
aeroftp connect sftp://user@host --key ~/.ssh/id_ed25519
aeroftp connect ftp://user@host --tls explicit --insecure
```

### ls

```bash
aeroftp ls sftp://user@host /var/www/ -l          # Long format
aeroftp ls sftp://user@host / --sort size --reverse
aeroftp ls --profile "NAS" / --all --json
```

### get / put

```bash
# Download with glob pattern
aeroftp get sftp://user@host "/data/*.csv"

# Recursive download
aeroftp get sftp://user@host /var/www/ ./backup/ -r

# Upload with glob
aeroftp put sftp://user@host "./*.json" /data/

# Recursive upload
aeroftp put sftp://user@host ./dist/ /var/www/dist/ -r
```

### mkdir / rm / mv

```bash
aeroftp mkdir sftp://user@host /var/www/new-folder
aeroftp rm sftp://user@host /tmp/old-dir/ -rf
aeroftp mv sftp://user@host /docs/draft.md /docs/final.md
```

### cat / stat / find / df / tree

```bash
aeroftp cat sftp://user@host /etc/config.ini | grep DB_HOST
aeroftp stat sftp://user@host /var/www/index.html --json
aeroftp find sftp://user@host /var/www/ "*.php"
aeroftp df sftp://user@host
aeroftp tree sftp://user@host /var/www/ -d 2
```

### head / tail

```bash
# First 5 lines of a remote file
aeroftp head --profile "server" /var/log/app.log -n 5

# Last 20 lines (default)
aeroftp tail --profile "server" /var/log/app.log

# JSON output
aeroftp head --profile "server" /file.txt -n 3 --json
```

### touch

```bash
# Create empty file
aeroftp touch --profile "server" /remote/newfile.txt

# Verify existing file (no error)
aeroftp touch --profile "server" /remote/existing.txt
```

### hashsum

Algorithms: `md5`, `sha1`, `sha256`, `sha512`, `blake3`.

```bash
aeroftp hashsum --profile "server" sha256 /data/file.bin
aeroftp hashsum sftp://user@host blake3 /path/file.dat --json
```

Output matches standard `sha256sum` format: `<hash>  <path>`.

### check

Verify that a local directory matches a remote directory.

```bash
# Compare by size (default)
aeroftp check --profile "server" /local/dir /remote/dir

# Compare by SHA-256 checksum
aeroftp check --profile "server" /local/ /remote/ --checksum

# One-way: only check files present locally
aeroftp check --profile "server" /local/ /remote/ --one-way
```

### sync

```bash
# Preview changes
aeroftp sync --profile "server" ./local/ /remote/ --dry-run

# Upload only
aeroftp sync --profile "server" ./local/ /remote/ --direction upload

# Mirror mode (delete orphans)
aeroftp sync sftp://user@host ./local/ /remote/ --delete

# Exclude patterns
aeroftp sync --profile "server" ./local/ /remote/ --exclude "*.tmp" --exclude ".git"

# Safety: abort if too many deletes
aeroftp sync --profile "server" ./local/ /remote/ --delete --max-delete 50
aeroftp sync --profile "server" ./local/ /remote/ --delete --max-delete 25%
```

### batch

Execute `.aeroftp` script files with 17 commands, shell-like variable substitution, and error policies.

```bash
aeroftp batch deploy.aeroftp
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

## GitHub Protocol

Every upload and delete creates a real Git commit. Branch-aware with automatic working branch creation for protected branches.

```bash
aeroftp ls github://token:PAT@owner/repo@develop /src/ -l
aeroftp put github://token:PAT@owner/repo ./fix.py /src/fix.py
aeroftp cat github://token:PAT@owner/repo /README.md
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

## Output Hygiene

The CLI follows Unix conventions: **stdout** carries data only (file listings, content, JSON), **stderr** carries messages (progress bars, summaries, connection status). This makes piping safe:

```bash
aeroftp ls sftp://user@host / --json 2>/dev/null | jq '.entries[].name'
aeroftp cat sftp://user@host /data.csv > output.csv 2>/dev/null
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
    echo "$DEPLOY_PASS" | aeroftp --password-stdin put \
      sftp://deploy@prod.example.com ./dist/ /var/www/ -r
```

For OAuth providers in CI, use `--profile` with the vault pre-configured on the runner:

```bash
AEROFTP_MASTER_PASSWORD=${{ secrets.VAULT_PW }} \
  aeroftp sync --profile "Production S3" ./build/ / --delete
```

## Live Test Results

All commands tested live against 12 providers via `--profile`:

| Provider | Protocol | connect | ls | put/get | head/tail | hashsum | check | touch | tree | df |
|----------|----------|---------|----|---------|-----------|---------||||------|------|
| WD MyCloud NAS | SFTP | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| axpdev.it | FTP | PASS | PASS | — | PASS | PASS | — | — | — | — |
| Playground | GitHub | PASS | PASS | PASS | PASS | PASS | — | PASS | PASS | — |
| MEGA.nz | MEGA | PASS | PASS | — | — | — | — | — | — | — |
| OpenDrive | OpenDrive | PASS | PASS | — | — | — | — | — | — | PASS |
| Filen | Filen (E2E) | PASS | PASS | — | — | — | — | — | — | PASS |
| Koofr | WebDAV | PASS | PASS | — | — | — | — | — | — | — |
| Koofr | Native API | PASS | PASS | — | — | — | — | — | — | PASS |
| WD MyCloud NAS | WebDAV | PASS | PASS | — | — | — | — | — | — | — |
| Backblaze B2 | S3 | PASS | PASS | — | — | — | — | — | — | — |
| Azure | Azure Blob | PASS | PASS | — | — | — | — | — | — | — |
| 4shared | OAuth 1.0 | PASS | PASS | — | — | — | — | — | — | PASS |

Filter system (`--include`, `--exclude-global`, `--min-size`, `--max-size`) and `check` with `hashsum` round-trip verification all passed on SFTP.
