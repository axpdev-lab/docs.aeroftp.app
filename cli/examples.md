# CLI Examples

Practical recipes for common AeroFTP CLI workflows, covering basic operations, advanced patterns, CI/CD integration, and multi-protocol usage.

## Connection URL Format

All CLI commands use URL-based connection strings:

```
protocol://user[:password]@host[:port]/path
```

| Component | Required | Example |
|-----------|----------|---------|
| Protocol | Yes | `sftp://`, `ftp://`, `ftps://`, `s3://`, `webdav://`, `gdrive://` |
| Username | Yes | `user@` |
| Password | No (prompted if needed) | `:secret@` |
| Host | Yes | `host.example.com` |
| Port | No (uses default) | `:2222` |
| Path | No (defaults to `/`) | `/var/www/html/` |

> **Warning:** Embedding passwords in URLs is discouraged — they appear in shell history and process listings. The CLI will warn unconditionally when a password is detected in the URL. Use SSH keys for SFTP, or let the CLI prompt interactively.

## Basic File Operations

### Download Files

```bash
# Download a single file to the current directory
aeroftp get sftp://user@host/reports/quarterly.pdf

# Download to a specific local path
aeroftp get sftp://user@host/reports/quarterly.pdf -o ./downloads/q1.pdf

# Recursive download of an entire directory
aeroftp get sftp://user@host/project/src/ -r -o ./local-src/
```

### Upload Files

```bash
# Upload a single file
aeroftp put sftp://user@host/uploads/ ./invoice.pdf

# Upload all CSV files using glob pattern
aeroftp put sftp://user@host/data/ "./*.csv"

# Recursive upload of a directory
aeroftp put sftp://user@host/var/www/ ./dist/ -r
```

### Glob Pattern Transfers

The CLI supports glob patterns (powered by the `globset` crate) for both uploads and downloads:

```bash
# Upload all CSV files from current directory
aeroftp put sftp://user@host/data/ "*.csv"

# Upload all images recursively
aeroftp put sftp://user@host/media/ "**/*.{jpg,png,gif}" -r

# Download all log files
aeroftp get sftp://user@host/var/log/ -r -o ./logs/ --include "*.log"
```

### List, View, and Manage

```bash
# List files with details (size, date, permissions)
aeroftp ls sftp://user@host/var/www/ --long

# View a remote file without downloading
aeroftp cat sftp://user@host/etc/nginx/nginx.conf

# Get file metadata
aeroftp stat sftp://user@host/data/export.csv

# Rename a file on the server
aeroftp mv sftp://user@host/docs/draft.md sftp://user@host/docs/published.md

# Delete a remote file
aeroftp rm sftp://user@host/tmp/old-backup.tar.gz

# Create a remote directory
aeroftp mkdir sftp://user@host/var/www/new-project/
```

## Directory Operations

```bash
# Show directory tree (3 levels deep)
aeroftp tree sftp://user@host/var/www/ -d 3

# Find all log files recursively
aeroftp find sftp://user@host/var/log/ "*.log"

# Find files modified in the last 7 days
aeroftp find sftp://user@host/data/ "*.csv" --newer 7d

# Check storage quota and disk usage
aeroftp df sftp://user@host/

# Synchronize directories
aeroftp sync sftp://user@host/var/www/html/ ./dist/
```

## JSON Output for Scripting

Every command supports the `--json` flag for machine-readable structured output. In JSON mode, results go to stdout and errors go to stderr as JSON objects, keeping piped output clean.

```bash
# List files as JSON and filter with jq
aeroftp ls sftp://user@host/ --json | jq '.[] | select(.size > 1048576) | .name'

# Get file metadata as JSON
aeroftp stat sftp://user@host/data/export.csv --json
# Output: {"name":"export.csv","size":4521984,"modified":"2026-03-15T14:30:00Z","permissions":"rw-r--r--"}

# Check storage quota programmatically
aeroftp df s3://key@s3.amazonaws.com/my-bucket/ --json | jq '.used_percent'

# List and count files per extension
aeroftp ls sftp://user@host/data/ --json | jq -r '.[].name' | awk -F. '{print $NF}' | sort | uniq -c | sort -rn

# Parse errors in JSON mode (errors go to stderr)
aeroftp get sftp://user@host/missing.txt --json 2>error.json
```

## Directory Synchronization

```bash
# Mirror local website to remote server
aeroftp sync sftp://user@host/var/www/html/ ./dist/

# Sync from S3 bucket to local directory
aeroftp sync s3://AKIAIOSFODNN7@s3.eu-west-1.amazonaws.com/assets/ ./local-assets/

# Sync with checksum verification
aeroftp sync sftp://user@host/data/ ./data/ --verify full

# Dry run — show what would change without transferring
aeroftp sync sftp://user@host/www/ ./dist/ --dry-run
```

## Working with Different Protocols

The same commands work identically across all supported protocols:

```bash
# SFTP (SSH)
aeroftp ls sftp://user@host/var/www/

# FTP with explicit TLS
aeroftp ls ftps://user@ftp.example.com/

# Plain FTP (not recommended — credentials sent in cleartext)
aeroftp ls ftp://user@ftp.example.com/

# WebDAV (Nextcloud)
aeroftp ls webdav://user@cloud.example.com/remote.php/dav/files/user/

# WebDAV (Seafile)
aeroftp ls webdav://user@seafile.example.com/seafdav/

# S3 (AWS)
aeroftp ls s3://AKIAIOSFODNN7@s3.us-east-1.amazonaws.com/my-bucket/

# S3-compatible (MinIO)
aeroftp ls s3://minioadmin:minioadmin@localhost:9000/my-bucket/

# S3-compatible (Cloudflare R2)
aeroftp ls s3://key@account-id.r2.cloudflarestorage.com/bucket/

# Google Drive (requires prior OAuth setup in desktop app)
aeroftp ls gdrive://me@drive/

# Dropbox (requires prior OAuth setup)
aeroftp ls dropbox://me@dropbox/

# OneDrive (requires prior OAuth setup)
aeroftp ls onedrive://me@onedrive/
```

## CI/CD Integration

### GitHub Actions Deployment

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm ci && npm run build

      - name: Install AeroFTP CLI
        run: |
          wget -q https://github.com/axpnet/aeroftp/releases/latest/download/aeroftp_amd64.deb
          sudo dpkg -i aeroftp_amd64.deb
          aeroftp --version

      - name: Deploy via SFTP
        run: |
          aeroftp sync \
            sftp://${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}/var/www/html/ \
            ./dist/ \
            --json
        env:
          NO_COLOR: 1

      - name: Verify deployment
        run: |
          aeroftp ls sftp://${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}/var/www/html/ --json | jq length
```

### GitLab CI

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm ci && npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: ubuntu:22.04
  before_script:
    - apt-get update && apt-get install -y wget
    - wget -q https://github.com/axpnet/aeroftp/releases/latest/download/aeroftp_amd64.deb
    - dpkg -i aeroftp_amd64.deb
  script:
    - aeroftp put sftp://${DEPLOY_USER}@${DEPLOY_HOST}/releases/ ./dist/app.tar.gz
    - aeroftp ls sftp://${DEPLOY_USER}@${DEPLOY_HOST}/releases/ --json
  environment:
    name: production
```

### Connection Testing in CI

```bash
#!/bin/bash
# pre-deploy-check.sh — Verify server is reachable before deploying

aeroftp connect sftp://ci@staging.example.com
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "Server unreachable (exit code: $EXIT_CODE), aborting deploy"
  exit 1
fi

echo "Server reachable, proceeding with deploy..."
aeroftp sync sftp://ci@staging.example.com/www/ ./dist/
```

### Monitoring: Storage Quota Alert

```bash
#!/bin/bash
# quota-check.sh — Alert when storage exceeds 80%

USAGE=$(aeroftp df s3://key@s3.amazonaws.com/my-bucket/ --json | jq -r '.used_percent')

if (( $(echo "$USAGE > 80" | bc -l) )); then
  echo "WARNING: Storage at ${USAGE}% — consider cleanup"
  # Send alert via webhook, email, etc.
  curl -X POST "$SLACK_WEBHOOK" -d "{\"text\":\"Storage alert: ${USAGE}% used\"}"
fi
```

## Batch Script: Multi-Server Deployment

```bash
# deploy-all.aeroftp — Deploy to staging + production
# Run: aeroftp batch deploy-all.aeroftp

SET build=./dist
SET app=/var/www/app

SET staging=sftp://deploy@staging.example.com
SET prod_eu=sftp://deploy@eu.prod.example.com
SET prod_us=sftp://deploy@us.prod.example.com

ON_ERROR FAIL

ECHO [1/3] Deploying to staging...
SYNC $staging$app/ $build/
ECHO Staging deploy complete.

ECHO [2/3] Deploying to EU production...
SYNC $prod_eu$app/ $build/
ECHO EU deploy complete.

ECHO [3/3] Deploying to US production...
SYNC $prod_us$app/ $build/
ECHO US deploy complete.

ECHO All servers deployed.
```

```bash
aeroftp batch deploy-all.aeroftp
```

## Batch Script: Database Backup Rotation

```bash
# db-backup.aeroftp — Download DB dump and rotate old backups

SET server=sftp://backup@db.example.com
SET remote_dump=/var/backups/pg-latest.sql.gz
SET local_dir=./backups

ON_ERROR FAIL
ECHO Downloading latest database dump...
GET $server$remote_dump -o $local_dir/pg-latest.sql.gz

ON_ERROR CONTINUE
ECHO Cleaning up old remote dumps...
RM $server/var/backups/pg-7days-ago.sql.gz

ECHO Checking server disk space...
DF $server/

ECHO Backup complete.
```

## File Inspection & Verification

### View Log Files Remotely

```bash
# First 50 lines of a log file
aeroftp head --profile "server" /var/log/app.log -n 50

# Last 100 lines (like tail -f but static)
aeroftp tail --profile "server" /var/log/nginx/error.log -n 100

# Pipe to grep for filtering
aeroftp tail --profile "server" /var/log/app.log -n 500 | grep ERROR
```

### Verify File Integrity

```bash
# Compute remote file hash
aeroftp hashsum --profile "server" sha256 /backups/db.sql.gz

# Download and verify locally
aeroftp get --profile "server" /backups/db.sql.gz ./db.sql.gz
sha256sum ./db.sql.gz  # Compare with remote hash

# Automated verification: compare local and remote
LOCAL_HASH=$(sha256sum ./db.sql.gz | cut -d' ' -f1)
REMOTE_HASH=$(aeroftp hashsum --profile "server" sha256 /backups/db.sql.gz 2>/dev/null | cut -d' ' -f1)
[ "$LOCAL_HASH" = "$REMOTE_HASH" ] && echo "Integrity OK" || echo "MISMATCH"
```

### Directory Comparison

```bash
# Verify deployment: local build matches remote
aeroftp check --profile "Production" ./dist/ /var/www/html/

# Output: Match: 142  Differ: 0  Missing local: 0  Missing remote: 0
# Exit code 0 = identical, 4 = differences found

# Checksum-based comparison (slower, more thorough)
aeroftp check --profile "Production" ./dist/ /var/www/html/ --checksum

# JSON output for CI integration
aeroftp check --profile "Production" ./dist/ /var/www/ --json 2>/dev/null | jq '.differ_count'
```

### Create Placeholder Files

```bash
# Create empty marker file
aeroftp touch --profile "server" /var/www/.maintenance

# Deploy, then remove marker
aeroftp put --profile "server" ./dist/ /var/www/ -r
aeroftp rm --profile "server" /var/www/.maintenance
```

## Filtering Files

### By Pattern

```bash
# List only JSON files
aeroftp ls --profile "server" /data/ --include "*.json"

# Exclude temp and git files
aeroftp ls --profile "server" /project/ --exclude-global "*.tmp" --exclude-global ".git"

# Load patterns from file
echo '*.log' > /tmp/excludes.txt
echo '*.tmp' >> /tmp/excludes.txt
aeroftp ls --profile "server" /data/ --exclude-from /tmp/excludes.txt
```

### By Size

```bash
# Only files larger than 1MB
aeroftp ls --profile "server" /uploads/ -l --min-size 1M

# Only files smaller than 100KB
aeroftp ls --profile "server" /data/ -l --max-size 100K
```

### By Age

```bash
# Files older than 30 days
aeroftp ls --profile "server" /logs/ --min-age 30d

# Files modified in the last 24 hours
aeroftp ls --profile "server" /data/ --max-age 24h
```

### Combined Filters

```bash
# Large log files older than a week
aeroftp ls --profile "server" /var/log/ -l --include "*.log" --min-size 10M --min-age 7d
```

## Sync Safety

### Dry Run Preview

```bash
# Always preview before syncing
aeroftp sync --profile "server" ./build/ /var/www/ --dry-run
# Shows: UPLOAD, DOWNLOAD, DELETE actions without executing
```

### Delete Safety

```bash
# Abort if more than 10 files would be deleted
aeroftp sync --profile "server" ./build/ /var/www/ --delete --max-delete 10

# Abort if more than 25% of files would be deleted
aeroftp sync --profile "server" ./build/ /var/www/ --delete --max-delete 25%
```

## Tips and Best Practices

1. **Always test with `connect` first** — verify credentials before running long operations. Connection failures return exit code 1.

2. **Use `--json` in scripts** — structured output is stable across versions and safe to parse.

3. **Set `NO_COLOR=1` in CI** — prevents ANSI escape codes from polluting log files.

4. **Prefer SFTP over FTP** — SFTP encrypts both credentials and data. FTP sends passwords in cleartext.

5. **Use batch scripts for multi-step operations** — they provide error handling, variables, and reproducibility that shell scripts require extra effort to achieve.

6. **Pipe JSON to jq for filtering** — `aeroftp ls --json | jq '.[] | select(.size > 1000000)'` is more reliable than parsing human-readable output.

7. **Check exit codes** — every CLI command returns a semantic exit code (0 for success, 1-8 for specific failure categories, 99 for unknown errors).

> **Note:** For the complete list of exit codes and their meanings, see the [Installation](installation.md) page.
