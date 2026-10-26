# CLI Examples

Recipes checked against AeroFTP 4.2.5 on 26 October 2026. These examples use existing saved profiles, so credentials stay out of command arguments. Discover exact names and IDs with `aeroftp-cli profiles --json`.

## Connection and Discovery

```bash
aeroftp-cli profiles --json
aeroftp-cli agent-info --json
aeroftp-cli pwd "Production" --json
aeroftp-cli connect --profile "Production" --json
```

Direct URLs are also supported for compatible backends: `aeroftp-cli ls sftp://user@host /var/www/`. Prefer saved profiles for browser-authorized providers. A common command interface does not guarantee that every provider supports checksums, quota, resume, native copy or every other operation. Unsupported operations return exit 7.

## Download and Upload

Local destinations are positional arguments, not `-o` options. With a URL, use `get URL REMOTE LOCAL` and `put URL LOCAL REMOTE`; with `--profile`, omit the URL.

```bash
# Single file
aeroftp-cli get --profile "Production" /reports/quarterly.pdf ./downloads/q1.pdf
aeroftp-cli put --profile "Production" ./invoice.pdf /uploads/invoice.pdf

# Quoted globs are expanded by AeroFTP
aeroftp-cli get --profile "Production" "/data/*.csv" ./downloads/
aeroftp-cli put --profile "Production" "./*.csv" /data/

# Directories require recursion
aeroftp-cli get --profile "Production" /project/src/ ./local-src/ -r
aeroftp-cli put --profile "Production" ./dist/ /var/www/html/ -r

# Native segmented download, subject to provider support
aeroftp-cli pget --profile "AWS S3" /backups/big.tar.gz ./big.tar.gz --segments 4
```

Proton Drive has two connection modes. Native mode uses AeroFTP's own client; CLI mode uses the separately installed `proton-drive` executable. Native bulk upload grouping applies to CLI-mode Proton profiles, not native Proton API profiles. See [Proton Drive](/providers/proton-drive).

## Inspect and Manage Files

```bash
aeroftp-cli ls --profile "Production" /var/www/ -l
aeroftp-cli cat --profile "Production" /var/www/config.ini
aeroftp-cli head --profile "Production" /var/log/app.log -n 50
aeroftp-cli head --profile "Production" /data/archive.bin --bytes 4096 --json
aeroftp-cli tail --profile "Production" /var/log/app.log -n 100
aeroftp-cli stat --profile "Production" /data/export.csv --json
aeroftp-cli find --profile "Production" /var/log/ "*.log" --json
aeroftp-cli tree --profile "Production" /var/www/ -d 3
aeroftp-cli mkdir --profile "Production" /var/www/new-project/ -p
aeroftp-cli mv --profile "Production" /docs/draft.md /docs/published.md
```

## JSON Output

`ls --json` returns an object containing `entries` and `summary`; it is not a bare array. `profiles --json` returns an array. Inspect each command's schema rather than applying one parser to every result.

```bash
aeroftp-cli ls --profile "Production" /data/ --json \
  | jq '.entries[] | select(.size > 1048576) | .name'
aeroftp-cli ls --profile "Production" /data/ --json \
  | jq '.summary | {total, truncated, total_before_limit}'
aeroftp-cli profiles --json | jq -r '.[].name'
```

Data goes to stdout; diagnostics and errors go to stderr. Use the exit code together with JSON status: interrupted, partial or bounded results must not be treated as complete inventories.

## Directory Synchronization

The positional order is always `LOCAL REMOTE` with a saved profile, or `URL LOCAL REMOTE` with a URL. The default direction is `both`; state an explicit direction for deployment and backup.

```bash
# Preview a website upload
aeroftp-cli sync --profile "Production" ./dist/ /var/www/html/ --direction upload --dry-run --json

# Apply after reviewing the preview
aeroftp-cli sync --profile "Production" ./dist/ /var/www/html/ --direction upload --json

# Download a cloud directory into a local backup
aeroftp-cli sync --profile "AWS S3" ./local-assets/ /assets/ --direction download

# Compare content instead of modification time where supported
aeroftp-cli sync --profile "Production" ./data/ /data/ --direction upload --checksum --dry-run

# Keep newer destination files
aeroftp-cli sync --profile "Production" ./data/ /data/ --direction upload --update

# Explicit bidirectional sync
aeroftp-cli sync --profile "NAS" ./documents/ /documents/ --direction both
```

A mirror deletes destination entries absent from the source. Review the dry run and set a delete cap for unattended application:

```bash
aeroftp-cli sync --profile "Production" ./dist/ /var/www/html/ \
  --direction upload --delete --max-delete 25% --dry-run --json
```

Incomplete scans are not evidence of deletion. Read reported boundaries and errors before applying a plan. See [CLI Commands](/cli/commands#sync) for conflict handling, immutable copies, filters and scan coverage.

## Verify a Deployment

```bash
aeroftp-cli check --profile "Production" ./dist/ /var/www/html/ --json
# Exit 0: no size differences. Exit 4: differences or incomplete comparison.

aeroftp-cli hashsum --profile "Production" -a sha256 /backups/db.sql.gz
aeroftp-cli get --profile "Production" /backups/db.sql.gz ./db.sql.gz
sha256sum ./db.sql.gz
```

For content-aware directory comparison in 4.2.5, use `check --checksum --json` or `reconcile --checksum --json` and inspect each pair's `compare_method`. Plain paths compare matching local and remote SHA-256 digests when available; unsupported digests and crypt overlays fall back to size. Compare explicit per-file hashes when content equality is required for a pair reported as `size`.

## Cross-Profile Migration

```bash
aeroftp-cli transfer-doctor "Google Drive" "Nextcloud" /documents /documents --json
aeroftp-cli transfer "Google Drive" "Nextcloud" /documents /documents --recursive
```

Both endpoints must already be saved profiles. Review the preflight before copying.

## Filters and Bandwidth

```bash
aeroftp-cli ls --profile "Production" /data/ --include "*.json" --json
aeroftp-cli ls --profile "Production" /logs/ --min-age 30d --min-size 10M -l
aeroftp-cli sync --profile "Production" ./dist /var/www/html --direction upload \
  --exclude "*.tmp" --exclude ".git" --bwlimit "1M"
aeroftp-cli sync --profile "Backup NAS" ./local /backup --direction upload \
  --bwlimit "08:00,512k 12:00,10M 13:00,512k 18:00,off"
```

Bandwidth schedules use local time; `off` removes the cap. See [bandwidth scheduling](/cli/commands#bandwidth-schedule-bwlimit) for parsing and midnight behavior.

## Scheduled Scripts and CI

Use [batch scripting](/cli/batch-scripting) for a checked sequence with explicit connection and direction. A runner needs its own configured profile and authentication: installing the binary alone does not provision credentials. For headless setup, use `profile-add` and [profile authorization](/cli/commands#profile-add-and-headless-authorization). Keep secrets in the runner's secret store; avoid inline URL passwords and command-line credential blobs.

```bash
NO_COLOR=1 aeroftp-cli batch deploy.aeroftp-script --json
```

Check all exit codes. Exit 6 indicates authentication failure; 8 indicates a limit reached without failure; 130 indicates cancellation and must not be retried automatically. See [the full exit-code table](/cli/installation#exit-codes).
