# Batch Scripting

AeroFTP CLI includes a batch scripting engine for automating multi-step file operations. Batch scripts use the `.aeroftp` file extension and support variables, error policies, and all core CLI operations.

## Running a Script

```bash
aeroftp-cli batch deploy.aeroftp
aeroftp-cli batch backup.aeroftp --verbose
```

## Script Syntax

Each line contains one command. Blank lines and lines starting with `#` are ignored.

### Variables

Define variables with `SET` and reference them with `$`:

```bash
SET host=sftp://admin@myserver.com
SET remote_dir=/var/www/html
SET local_dir=./build

CONNECT $host
PUT $host$remote_dir/ $local_dir/ -r
```

- Maximum 256 variables per script.
- Variable expansion is single-pass and injection-safe (no recursive expansion).
- Undefined variables are left as literal text.

### Error Handling

Control script behavior on command failure:

```bash
ON_ERROR CONTINUE    # Log the error and proceed to the next line (default)
ON_ERROR FAIL        # Abort the script immediately on any error
```

You can switch error policy at any point in the script.

### Quoting

Shell-like quoting rules apply:

- Double quotes preserve spaces: `PUT $host/dir/ "my file.txt"`
- Single quotes prevent variable expansion: `ECHO 'Literal $var'`
- Unquoted arguments are split on whitespace.

## Available Commands

| Command | Description |
|---------|-------------|
| `SET` | Define a variable: `SET name=value` |
| `ECHO` | Print a message: `ECHO Deploying to $host` |
| `ON_ERROR` | Set error policy: `CONTINUE` or `FAIL` |
| `CONNECT` | Test server connection |
| `DISCONNECT` | Close current connection |
| `LS` | List remote directory |
| `GET` | Download files |
| `PUT` | Upload files |
| `RM` | Remove remote files |
| `MV` | Move/rename remote files |
| `CAT` | Display remote file contents |
| `STAT` | Show file metadata |
| `FIND` | Search for files by pattern |
| `DF` | Show storage quota |
| `MKDIR` | Create remote directory |
| `TREE` | Display directory tree |
| `SYNC` | Synchronize directories |

## Limits

| Constraint | Value |
|------------|-------|
| Max script file size | 1 MB |
| Max variables | 256 |
| Variable expansion | Single-pass (no recursion) |

## Complete Example: Nightly Backup

```bash
# backup.aeroftp — Nightly backup of production server
# Run: aeroftp-cli batch backup.aeroftp

SET server=sftp://backupuser@prod.example.com
SET remote=/var/www/html
SET local=./backups/nightly

# Abort on any failure during backup
ON_ERROR FAIL

ECHO Connecting to production server...
CONNECT $server

ECHO Creating local backup directory...
MKDIR $server$remote/../backup-staging/

ECHO Syncing website files...
SYNC $server$remote/ $local/www/

ECHO Downloading database dump...
GET $server/var/backups/db-latest.sql.gz -o $local/db-latest.sql.gz

# Non-critical: log download can fail without aborting
ON_ERROR CONTINUE
GET $server/var/log/nginx/access.log -o $local/access.log

ECHO Checking remote disk usage...
DF $server/

ECHO Backup complete.
```

Run it in a cron job:

```bash
# crontab -e
0 2 * * * /usr/bin/aeroftp-cli batch /opt/scripts/backup.aeroftp >> /var/log/aeroftp-backup.log 2>&1
```

> **Tip:** Use `ON_ERROR FAIL` for critical operations and switch to `ON_ERROR CONTINUE` for optional steps. This gives you fine-grained control over script abort behavior.
