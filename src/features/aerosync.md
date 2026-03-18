# AeroSync

AeroSync is AeroFTP's smart file synchronization engine. It supports bidirectional sync across all 22 protocols with conflict resolution, scheduling, bandwidth control, and journal-based resume.

## Sync Presets

AeroSync ships with 5 built-in profiles. You can also save custom profiles.

| Preset | Direction | Deletes Orphans | Verification |
|--------|-----------|-----------------|--------------|
| **Mirror** | Local → Remote | Yes | Size only |
| **Two-way** | Bidirectional | No | Size + mtime |
| **Backup** | Local → Remote | No | Checksum |
| **Pull** | Remote → Local | Yes | Size only |
| **Remote Backup** | Remote → Local | No | Checksum |

## Smart Sync Modes

Each preset uses one of three compare strategies:

- **overwrite_if_newer** — transfer only when the source file has a more recent modification time.
- **overwrite_if_different** — transfer when size or checksum differs, regardless of timestamp.
- **skip_if_identical** — skip files where size and SHA-256 match exactly.

## Conflict Resolution Center

When both local and remote copies have changed, AeroSync presents per-file resolution options:

- **Keep Local** / **Keep Remote** / **Skip** for individual files
- Batch actions: Keep Newer All, Keep Local All, Keep Remote All, Skip All

Conflict decisions are recorded in the transfer journal for auditing.

## Speed Modes

| Mode | Parallel Streams | Compression | Delta Sync |
|------|-----------------|-------------|------------|
| Normal | 1 | Off | Off |
| Fast | 2 | On | Off |
| Turbo | 4 | On | On |
| Extreme | 8 | On | On |
| Maniac | 16 | On | On |

> **Warning:** Maniac mode disables all safety checks for maximum throughput. Post-sync verification runs automatically to compensate.

## Scheduler

Configure recurring sync operations with:

- **Interval** — from every 5 minutes to every 24 hours
- **Time window** — restrict sync to specific hours (e.g., 02:00-06:00)
- **Day picker** — select which days of the week the scheduler is active
- **Pause/Resume** with live countdown display

## Filesystem Watcher

AeroSync monitors local directories for changes via inotify (Linux). A health indicator in the UI shows watcher status and warns if inotify capacity is near its limit.

## Multi-Path Sync Pairs

Define multiple local-to-remote path mappings within a single sync configuration. Each pair syncs independently, allowing you to synchronize different directories to different remote locations in one operation.

## Transfer Journal

Every sync operation is logged to a persistent JSON journal in `~/.config/aeroftp/sync-journal/`. If a sync is interrupted, AeroSync detects the incomplete journal on the next run and offers to resume from the last checkpoint.

## Verification and Retry

- **Post-transfer verification** — 4 policies: None, Size Only, Size+Mtime, Full (SHA-256)
- **Exponential backoff retry** — configurable retries (default 3), base delay 500ms, 2x multiplier, 10-second cap
- **Per-file timeout** — default 2 minutes per file transfer

## Bandwidth Control

Limit upload and download speeds independently, from 128 KB/s to 10 MB/s. The limiter auto-detects whether the backend is FTP or a cloud provider API.

## Additional Features

- **Dry-run export** — preview sync operations as JSON or CSV before executing
- **Safety Score badge** — visual indicator of sync risk level based on configuration
- **Template export/import** — save sync configurations as `.aerosync` files for sharing or backup
- **Rollback snapshots** — create and restore pre-sync snapshots of your data
- **Error taxonomy** — 10 error categories with retryability hints and grouped reporting
