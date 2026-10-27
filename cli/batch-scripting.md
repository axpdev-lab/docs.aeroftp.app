# Batch Scripting

AeroFTP 4.2.5 runs checked, line-oriented `.aeroftp-script` files. The whole script is parsed before any operation starts: unknown commands, unsupported flags, undefined variables and malformed quoting fail with exit 5 before line 1 runs. `.aeroftp` is reserved for encrypted profile backups and is refused by `batch`.

```bash
aeroftp-cli batch deploy.aeroftp-script
aeroftp-cli batch backup.aeroftp-script --json
cat deploy.aeroftp-script | aeroftp-cli batch -
```

Operation results go to stdout; diagnostics go to stderr. `--json` selects structured operation output. A batch is never interactive, including when launched from a terminal.

## Command Reference

Commands operate on the target selected by `CONNECT`. Do not put a connection URL on every file-operation line. Batch commands accept only the flags listed below; they do not inherit every option of the similarly named CLI subcommand.

| Command | Syntax | Behavior |
| --- | --- | --- |
| `SET` | `SET name=value` | Define or replace a variable |
| `ECHO` | `ECHO text` | Print text |
| `ON_ERROR` | `ON_ERROR FAIL` or `ON_ERROR CONTINUE` | Choose failure handling; default `FAIL` |
| `CONNECT` | `CONNECT --profile "Name"` or `CONNECT protocol://user@host` | Select and test a saved profile or URL target; URL authentication must already be available non-interactively |
| `DISCONNECT` | `DISCONNECT` | Clear the current target |
| `LS` | `LS [-l] [path]` | List a directory |
| `GET` | `GET remote [local]` | Download one file |
| `PUT` | `PUT local [remote]` | Upload one file |
| `MKDIR` | `MKDIR remote` | Create a directory |
| `RM` | `RM [-r or -rf] remote` | Remove a file, or recursively remove a directory |
| `MV` | `MV from to` | Rename or move a remote entry |
| `CAT` | `CAT remote` | Read remote content |
| `STAT` | `STAT remote` | Read metadata |
| `FIND` | `FIND path pattern` | Search by filename |
| `DF` | `DF` | Query quota |
| `TREE` | `TREE [path]` | List a tree with depth 3 |
| `SYNC` | `SYNC local remote --direction upload\|download\|both [sync options]` | Run the CLI sync engine against the connected target |
| `CONNECT_SOURCE_PROFILE` | `CONNECT_SOURCE_PROFILE "Name"` | Select the cross-profile source |
| `CONNECT_DEST_PROFILE` | `CONNECT_DEST_PROFILE "Name"` | Select the cross-profile destination |
| `TRANSFER` | `TRANSFER source_path dest_path [-r or --recursive] [--skip-existing] [--dry-run]` | Copy between those two saved profiles |

`GET` and `PUT` do not accept `-o` or `-r` in batch scripts. Use `SYNC` with an explicit direction for directory transfers. `SYNC` requires both paths and `--direction`, accepts sync-specific options through the CLI parser, and refuses global options on its line. Put global options on `aeroftp-cli batch ...` instead. An applying `SYNC --delete` also requires `--max-delete N` or `N%`.

URL targets need preconfigured non-interactive credentials, such as an appropriate SSH key or credentials supplied through supported outer CLI options. Batch `CONNECT` cannot pause for a missing password. Prefer `CONNECT --profile "Name"` for vault-backed password or OAuth authentication, with the credential vault available to the process. Do not embed passwords in script URLs.

## Variables and Quoting

```text
SET source=./dist
SET destination=/var/www/html
SET profile=Production
CONNECT --profile "${profile}"
SYNC "${source}" "${destination}" --direction upload --dry-run
DISCONNECT
```

Variables use `$name` or `${name}` and expand once. Names follow `[A-Za-z_][A-Za-z0-9_]*`; at most 256 variables and 64 KiB per value are allowed. Undefined variables are errors. Use `$$` for a literal dollar sign. Quote paths and profile names with spaces. Variable expansion happens before tokenization, including inside quotes; single quotes do not disable it. A trailing backslash joins the next physical line; a blank/comment line cannot be its continuation.

## Deployment

```text
# deploy.aeroftp-script
ON_ERROR FAIL
CONNECT --profile "Production"
PUT ./dist/app.js /var/www/html/app.js
PUT ./dist/index.html /var/www/html/index.html
STAT /var/www/html/index.html
DISCONNECT
```

For a complete directory, preview a sync first, then remove `--dry-run` after reviewing the plan:

```text
CONNECT --profile "Production"
SYNC ./dist /var/www/html --direction upload --dry-run
DISCONNECT
```

## Backup

```text
# backup.aeroftp-script
ON_ERROR FAIL
CONNECT --profile "Production"
SYNC ./backups/www /var/www/html --direction download
GET /var/backups/db-latest.sql.gz ./backups/db-latest.sql.gz
ON_ERROR CONTINUE
GET /var/log/nginx/access.log ./backups/access.log
DF
DISCONNECT
```

## Cross-Profile Copy

```text
CONNECT_SOURCE_PROFILE "Source Cloud"
CONNECT_DEST_PROFILE "Backup NAS"
TRANSFER /documents /backups/documents -r --dry-run
DISCONNECT
```

## Failures and Limits

`ON_ERROR FAIL` stops at the first failed operation with its exit code. `ON_ERROR CONTINUE` records the failure and continues; a run with failures finishes with a nonzero result. Ctrl-C always ends the batch with exit 130, regardless of policy. A failed `CONNECT` clears the preceding target, so later commands cannot accidentally reuse it.

The script file is limited to 1 MiB. Commands are flat, without loops or nesting. Only whole lines beginning with `#` are comments; keep comments on separate lines.

AeroSync's GUI can export and import `.aeroftp-script` files. The exported comments identify preset settings the CLI cannot apply, while metadata preserves them for re-import. Review those comments before scheduling an export with cron or Task Scheduler.
