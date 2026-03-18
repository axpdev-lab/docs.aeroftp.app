# CLI Commands

Complete reference for all 13 `aeroftp-cli` commands. Every command accepts a connection URL and supports `--json` output.

## Connection URL Format

```
protocol://user:password@host:port/path
```

| Component | Required | Default | Example |
|-----------|----------|---------|---------|
| Protocol | Yes | — | `sftp`, `ftp`, `ftps`, `s3`, `webdav` |
| User | Yes | — | `admin` |
| Password | No | prompted | `secret` |
| Host | Yes | — | `myserver.com` |
| Port | No | protocol default | `2222` |
| Path | No | `/` | `/var/www` |

```bash
# SFTP with default port (22)
aeroftp-cli ls sftp://admin@myserver.com/

# FTP with explicit port
aeroftp-cli ls ftp://user:pass@ftp.example.com:21/pub/

# S3 bucket (access key as user, secret key as password)
aeroftp-cli ls s3://AKIAIOSFODNN:secret@s3.amazonaws.com/my-bucket/
```

> **Warning:** Embedding passwords in URLs is convenient but insecure. The CLI always prints a warning when a URL-embedded password is detected. Prefer interactive password prompts or environment variables for production use.

## Global Flags

| Flag | Description |
|------|-------------|
| `--json` | Output structured JSON to stdout |
| `--verbose` / `-v` | Enable verbose logging |
| `--no-color` | Disable colored output |

## Commands

### `connect`

Test connectivity to a remote server. Performs authentication and immediately disconnects.

```bash
aeroftp-cli connect sftp://admin@myserver.com
```

### `ls`

List directory contents. Default output is a formatted table.

```bash
aeroftp-cli ls sftp://user@host/var/www/
aeroftp-cli ls sftp://user@host/ --long        # Detailed listing with permissions
aeroftp-cli ls sftp://user@host/ --json        # JSON array output
```

> **Note:** Summary lines (file count, total size) are printed to stderr, keeping stdout clean for piping.

### `get`

Download files or directories from a remote server.

```bash
aeroftp-cli get sftp://user@host/path/file.txt
aeroftp-cli get sftp://user@host/path/file.txt -o ./local-copy.txt
aeroftp-cli get sftp://user@host/backups/ -r                        # Recursive download
aeroftp-cli get sftp://user@host/logs/ -r --include "*.log"         # Glob filter
```

### `put`

Upload files to a remote server. Supports glob patterns for batch uploads.

```bash
aeroftp-cli put sftp://user@host/uploads/ ./report.pdf
aeroftp-cli put sftp://user@host/data/ "*.csv"                      # Glob upload
aeroftp-cli put sftp://user@host/project/ ./src/ -r                 # Recursive upload
```

### `mkdir`

Create a directory on the remote server.

```bash
aeroftp-cli mkdir sftp://user@host/var/www/new-site/
```

### `rm`

Remove files or directories. Use `-r` for recursive deletion.

```bash
aeroftp-cli rm sftp://user@host/tmp/old-file.txt
aeroftp-cli rm sftp://user@host/tmp/old-dir/ -r
```

### `mv`

Move or rename a file on the remote server.

```bash
aeroftp-cli mv sftp://user@host/docs/draft.md sftp://user@host/docs/final.md
```

### `cat`

Display the contents of a remote file to stdout.

```bash
aeroftp-cli cat sftp://user@host/etc/config.yaml
aeroftp-cli cat sftp://user@host/data/report.json | jq .
```

### `find`

Search for files by name pattern on the remote server.

```bash
aeroftp-cli find sftp://user@host/ "*.log"
aeroftp-cli find sftp://user@host/src/ "*.rs" --json
```

### `stat`

Show metadata for a remote file (size, modification time, permissions).

```bash
aeroftp-cli stat sftp://user@host/var/www/index.html
```

### `df`

Display storage quota and disk usage for the connected server.

```bash
aeroftp-cli df sftp://user@host/
aeroftp-cli df s3://key@s3.amazonaws.com/my-bucket/ --json
```

### `tree`

Display a recursive directory tree with Unicode box-drawing characters.

```bash
aeroftp-cli tree sftp://user@host/var/www/
aeroftp-cli tree sftp://user@host/ -d 3            # Limit depth to 3 levels
aeroftp-cli tree sftp://user@host/ --json          # JSON with recursive structure
```

### `sync`

Synchronize a local directory with a remote directory.

```bash
aeroftp-cli sync sftp://user@host/www/ ./local-www/
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Connection failure |
| 2 | File or directory not found |
| 3 | Permission denied |
| 4 | Transfer error |
| 5 | Configuration error |
| 6 | Authentication failure |
| 7 | Operation not supported |
| 8 | Timeout |
| 99 | Unknown error |

Exit codes enable reliable error handling in shell scripts:

```bash
aeroftp-cli get sftp://user@host/file.txt || echo "Exit code: $?"
```
