# Batch Scripting

AeroFTP CLI includes a built-in batch scripting engine for automating multi-step file operations. Batch scripts use the `.aeroftp` file extension and provide variables, error policies, quoting, and all core CLI operations in a simple line-oriented format.

## Running a Batch Script

```bash
aeroftp batch deploy.aeroftp
aeroftp batch backup.aeroftp --verbose
aeroftp batch script.aeroftp --json
```

When `--json` is specified, all command output within the script is emitted as structured JSON to stdout, with errors going to stderr.

## Script Format

Each line contains exactly one command. Blank lines and lines starting with `#` are ignored as comments.

```bash
# This is a comment
SET host=sftp://admin@myserver.com

# Blank lines are fine for readability

CONNECT $host
LS $host/var/www/
```

## All 17 Commands

| Command | Syntax | Description |
|---------|--------|-------------|
| `SET` | `SET name=value` | Define a variable |
| `ECHO` | `ECHO message text` | Print a message to stdout |
| `ON_ERROR` | `ON_ERROR CONTINUE` or `ON_ERROR FAIL` | Set error handling policy |
| `CONNECT` | `CONNECT url` | Test server connectivity |
| `DISCONNECT` | `DISCONNECT` | Close the current connection |
| `LS` | `LS url [options]` | List remote directory contents |
| `GET` | `GET url [-o local] [-r]` | Download file(s) from server |
| `PUT` | `PUT url local [-r]` | Upload file(s) to server |
| `RM` | `RM url` | Remove a remote file or directory |
| `MV` | `MV source destination` | Move or rename a remote file |
| `CAT` | `CAT url` | Display remote file contents |
| `STAT` | `STAT url` | Show file metadata (size, mtime, permissions) |
| `FIND` | `FIND url "pattern"` | Search for files matching a glob pattern |
| `DF` | `DF url` | Show storage quota and disk usage |
| `MKDIR` | `MKDIR url` | Create a remote directory |
| `TREE` | `TREE url [-d depth]` | Display recursive directory tree |
| `SYNC` | `SYNC remote local [options]` | Synchronize directories |

## Variable Expansion

### Defining Variables

Use `SET` to define variables. Variable names support alphanumeric characters and underscores:

```bash
SET host=sftp://deploy@prod.example.com
SET remote_path=/var/www/html
SET local_path=./dist
SET version=2.5.0
```

### Referencing Variables

Reference variables with `$name` or `${name}`:

```bash
ECHO Deploying version $version to $host
PUT $host$remote_path/ $local_path/ -r
GET $host/backups/db-$version.sql.gz -o ./backup.sql.gz
```

### Expansion Rules

- **Single-pass expansion**: Variables are expanded exactly once. There is no recursive expansion, which prevents injection attacks where a variable value contains `$` references.
- **Undefined variables**: If a variable is not defined, the `$name` literal is left as-is in the command string.
- **Literal dollar sign**: Use `$$` to produce a literal `$` character.

```bash
SET price=100
ECHO The cost is $$${price}   # Output: The cost is $100
ECHO Undefined: $missing       # Output: Undefined: $missing
```

### Maximum Variables

A single script may define up to **256 variables**. Exceeding this limit causes the script to abort with an error.

## Quoting

The batch engine uses shell-like quoting rules:

| Quote Type | Behavior | Example |
|------------|----------|---------|
| **Double quotes** `"..."` | Preserves spaces, expands variables | `PUT $host/dir/ "my file.txt"` |
| **Single quotes** `'...'` | Preserves spaces, no variable expansion | `ECHO 'Literal $var'` |
| **No quotes** | Split on whitespace, expands variables | `PUT $host/dir/ file.txt` |

Double quotes are essential when paths or filenames contain spaces:

```bash
SET server=sftp://user@host
PUT $server/uploads/ "Q1 Report (Final).pdf"
GET $server"/path with spaces/data.csv" -o ./data.csv
```

## Error Handling

### ON_ERROR Policies

Control how the script reacts when a command fails:

```bash
ON_ERROR FAIL       # Abort the entire script on any error
ON_ERROR CONTINUE   # Log the error and proceed to the next line
```

The default policy is `CONTINUE` (changed from `FAIL` as of v2.9.2). You can switch policies at any point in the script, which allows critical sections to abort while optional operations continue:

```bash
# Critical: must succeed
ON_ERROR FAIL
CONNECT $server
SYNC $server/www/ ./dist/

# Optional: failure is acceptable
ON_ERROR CONTINUE
GET $server/var/log/access.log -o ./logs/access.log
GET $server/var/log/error.log -o ./logs/error.log

# Critical again
ON_ERROR FAIL
ECHO Deploy verification...
LS $server/www/index.html
```

### Exit Codes

When a script aborts due to `ON_ERROR FAIL`, the CLI exits with the exit code of the failed command (see [Installation](installation.md) for the full exit code table).

## Script Limits

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Maximum script file size | 1 MB | Prevents accidental loading of large files |
| Maximum variables | 256 | Memory safety bound |
| Variable expansion | Single-pass | Injection prevention |
| Line length | Unlimited | No artificial cap |
| Command nesting | Not supported | Flat execution model |

## Real-World Example: Nightly Backup

```bash
# backup.aeroftp — Nightly backup of production server
# Run: aeroftp batch backup.aeroftp
# Cron: 0 2 * * * /usr/bin/aeroftp batch /opt/scripts/backup.aeroftp >> /var/log/aeroftp-backup.log 2>&1

SET server=sftp://backupuser@prod.example.com
SET remote=/var/www/html
SET backup_dir=./backups/nightly

# Critical: database and website must succeed
ON_ERROR FAIL
ECHO [1/4] Connecting to production server...
CONNECT $server

ECHO [2/4] Syncing website files...
SYNC $server$remote/ $backup_dir/www/

ECHO [3/4] Downloading database dump...
GET $server/var/backups/db-latest.sql.gz -o $backup_dir/db-latest.sql.gz

# Optional: logs are nice to have but not critical
ON_ERROR CONTINUE
ECHO [4/4] Downloading server logs...
GET $server/var/log/nginx/access.log -o $backup_dir/access.log
GET $server/var/log/nginx/error.log -o $backup_dir/error.log

ECHO Checking remote disk usage...
DF $server/

ECHO Backup complete.
```

Schedule it via cron:

```bash
# crontab -e
0 2 * * * /usr/bin/aeroftp batch /opt/scripts/backup.aeroftp >> /var/log/aeroftp-backup.log 2>&1
```

## Real-World Example: Multi-Server Deployment

```bash
# deploy.aeroftp — Deploy build artifacts to 3 servers
# Run: aeroftp batch deploy.aeroftp

SET build_dir=./dist
SET app_path=/var/www/app

SET staging=sftp://deploy@staging.example.com
SET prod_eu=sftp://deploy@eu.prod.example.com
SET prod_us=sftp://deploy@us.prod.example.com

ON_ERROR FAIL

ECHO === Deploying to staging ===
CONNECT $staging
SYNC $staging$app_path/ $build_dir/ -r

ECHO === Deploying to EU production ===
CONNECT $prod_eu
SYNC $prod_eu$app_path/ $build_dir/ -r

ECHO === Deploying to US production ===
CONNECT $prod_us
SYNC $prod_us$app_path/ $build_dir/ -r

ECHO All 3 servers deployed successfully.
```

## CI/CD Example: GitHub Actions

```yaml
name: Deploy via AeroFTP Batch

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install AeroFTP CLI
        run: |
          wget -q https://github.com/axpnet/aeroftp/releases/latest/download/aeroftp_amd64.deb
          sudo dpkg -i aeroftp_amd64.deb

      - name: Build project
        run: npm ci && npm run build

      - name: Create batch script
        run: |
          cat > deploy.aeroftp << 'SCRIPT'
          SET server=sftp://${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}
          SET remote=/var/www/html

          ON_ERROR FAIL
          CONNECT $server
          SYNC $server$remote/ ./dist/
          ECHO Deploy complete.
          SCRIPT

      - name: Deploy
        run: aeroftp batch deploy.aeroftp --json
        env:
          NO_COLOR: 1
```

> **Tip:** Always use `ON_ERROR FAIL` for critical operations and switch to `ON_ERROR CONTINUE` for optional steps. This gives fine-grained control over script abort behavior without needing conditional logic.
