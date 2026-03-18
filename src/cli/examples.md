# CLI Examples

Practical recipes for common AeroFTP CLI workflows.

## Basic File Operations

```bash
# Download a single file
aeroftp-cli get sftp://user@host/reports/quarterly.pdf

# Upload a file to a specific directory
aeroftp-cli put sftp://user@host/uploads/ ./invoice.pdf

# Upload all CSV files using glob pattern
aeroftp-cli put sftp://user@host/data/ "*.csv"

# View a remote config file
aeroftp-cli cat sftp://user@host/etc/nginx/nginx.conf

# Rename a file on the server
aeroftp-cli mv sftp://user@host/docs/draft.md sftp://user@host/docs/published.md
```

## Directory Operations

```bash
# List files with details
aeroftp-cli ls sftp://user@host/var/www/ --long

# Create a directory
aeroftp-cli mkdir sftp://user@host/var/www/new-project/

# Recursive download
aeroftp-cli get sftp://user@host/project/src/ -r -o ./local-src/

# Show directory tree (3 levels deep)
aeroftp-cli tree sftp://user@host/var/www/ -d 3

# Find all log files
aeroftp-cli find sftp://user@host/var/log/ "*.log"
```

## JSON Output for Scripting

All commands support `--json` for machine-readable output.

```bash
# List files as JSON and filter with jq
aeroftp-cli ls sftp://user@host/ --json | jq '.[] | select(.size > 1048576)'

# Get file metadata as JSON
aeroftp-cli stat sftp://user@host/data/export.csv --json

# Check storage quota
aeroftp-cli df s3://key@s3.amazonaws.com/my-bucket/ --json | jq '.used_percent'
```

> **Note:** In `--json` mode, errors are written to stderr as JSON objects while stdout contains only the structured result. This keeps piped output clean.

## Directory Synchronization

```bash
# Mirror local website to remote server
aeroftp-cli sync sftp://user@host/var/www/html/ ./dist/

# Sync from S3 bucket
aeroftp-cli sync s3://AKIA...@s3.eu-west-1.amazonaws.com/assets/ ./local-assets/
```

## CI/CD Integration

### GitHub Actions Deployment

```yaml
- name: Deploy to production
  run: |
    aeroftp-cli sync sftp://${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}/var/www/html/ ./dist/
  env:
    NO_COLOR: 1
```

### GitLab CI

```yaml
deploy:
  script:
    - aeroftp-cli put sftp://${DEPLOY_USER}@${DEPLOY_HOST}/releases/ ./build/app.tar.gz
    - aeroftp-cli ls sftp://${DEPLOY_USER}@${DEPLOY_HOST}/releases/ --json
```

### Connection Testing in CI

```bash
#!/bin/bash
aeroftp-cli connect sftp://ci@staging.example.com
if [ $? -ne 0 ]; then
  echo "Server unreachable, aborting deploy"
  exit 1
fi
aeroftp-cli sync sftp://ci@staging.example.com/www/ ./dist/
```

## Batch Script: Weekly Site Backup

```bash
# site-backup.aeroftp
SET server=sftp://backup@prod.example.com
SET timestamp=2026-03-18

ON_ERROR FAIL
ECHO Starting weekly backup...
SYNC $server/var/www/html/ ./backups/$timestamp/www/
GET $server/var/backups/db.sql.gz -o ./backups/$timestamp/db.sql.gz

ON_ERROR CONTINUE
GET $server/var/log/access.log -o ./backups/$timestamp/access.log
ECHO Backup finished.
```

```bash
aeroftp-cli batch site-backup.aeroftp
```

## Working with Different Protocols

```bash
# FTP with explicit TLS
aeroftp-cli ls ftps://user@ftp.example.com/

# WebDAV (Nextcloud)
aeroftp-cli ls webdav://user@cloud.example.com/remote.php/dav/files/user/

# S3-compatible (MinIO)
aeroftp-cli ls s3://minioadmin:minioadmin@localhost:9000/my-bucket/

# Google Drive (requires prior OAuth setup in desktop app)
aeroftp-cli ls gdrive://me@drive/
```

> **Tip:** Use `aeroftp-cli connect <url>` first to verify credentials before running longer operations. Connection failures return exit code 1, making them easy to catch in scripts.
