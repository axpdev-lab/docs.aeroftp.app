# AeroSync

AeroSync is AeroFTP's professional file synchronization engine. It supports bidirectional sync across all 27 protocols with conflict resolution, scheduling, bandwidth throttling, transfer journaling, and checkpoint-based resume. AeroSync operates through a two-tab interface: **Quick Sync** for common scenarios and **Advanced** for granular control over every aspect of the sync process.

## Quick Sync Tab

The Quick Sync tab presents three preset cards that cover the most common synchronization scenarios. Select a card and click **Start** to begin immediately with sensible defaults.

![Quick Sync tab with three preset cards](/images/aerosync-quick-tab.png)
<!-- SCREENSHOT: Quick Sync tab showing the Mirror, Two-Way, and Backup preset cards side by side -->

### Mirror

Produces an exact copy of your local directory on the remote server. Files that exist on the remote but not locally are deleted (orphan removal). This is ideal for deploying websites, publishing build artifacts, or maintaining a canonical remote copy.

- **Direction:** Local to Remote
- **Orphan deletion:** Enabled
- **Verification:** Size only
- **Use case:** Web deployment, content publishing

### Two-Way

Synchronizes changes in both directions. Files modified locally are uploaded; files modified remotely are downloaded. Neither side deletes files from the other. When both copies have changed, the Conflict Resolution Center activates.

- **Direction:** Bidirectional
- **Orphan deletion:** Disabled
- **Verification:** Size + modification time
- **Use case:** Collaborative workflows, shared project folders

### Backup

Copies local files to the remote server without removing anything on the remote side. Uses SHA-256 checksum verification to guarantee data integrity after transfer. This is the safest preset for archival purposes.

- **Direction:** Local to Remote
- **Orphan deletion:** Disabled
- **Verification:** Full checksum (SHA-256)
- **Use case:** Offsite backup, archival storage

## Advanced Tab

The Advanced tab provides full control over synchronization behavior through four collapsible accordion sections. Each section expands with a smooth CSS transition to reveal its settings.

![Advanced tab with accordion sections expanded](/images/aerosync-advanced-tab.png)
<!-- SCREENSHOT: Advanced tab showing the four accordion sections (Direction, Compare, Transfer, Automation) with at least one expanded -->

### Direction Section

Choose the sync direction and configure orphan handling:

- **Local to Remote** - push local changes to the server
- **Remote to Local** - pull remote changes to your machine
- **Bidirectional** - sync changes in both directions
- **Delete orphans** toggle - remove files on the destination that do not exist on the source

### Compare Section

Define how AeroSync determines whether a file needs to be transferred:

- **overwrite_if_newer** - transfer only when the source file has a more recent modification time
- **overwrite_if_different** - transfer when file size or checksum differs, regardless of timestamp
- **skip_if_identical** - skip files where both size and SHA-256 hash match exactly
- **Compare checksum** toggle - enable SHA-256 hashing during the scan phase (streaming 64 KB chunks)

### Transfer Section

Control retry behavior, verification policies, and per-file timeouts:

- **Retry count** - number of retry attempts per file (default: 3)
- **Retry delay** - base delay with exponential backoff (default: 500 ms, 2x multiplier, 10-second cap)
- **Per-file timeout** - maximum time allowed for a single file transfer (default: 2 minutes)
- **Post-transfer verification** - 4 policies: None, Size Only, Size + Mtime, Full (SHA-256 re-hash after transfer)

### Automation Section

Configure scheduling, filesystem watching, and bandwidth limits within this section (see dedicated sections below for details).

## Sync Profiles

AeroSync ships with 5 built-in profiles. You can also create, save, and load custom profiles that bundle all settings into a single configuration.

| Profile | Direction | Deletes Orphans | Verification | Primary Use |
|---------|-----------|-----------------|--------------|-------------|
| **Mirror** | Local to Remote | Yes | Size only | Deployment |
| **Two-Way** | Bidirectional | No | Size + mtime | Collaboration |
| **Backup** | Local to Remote | No | Full checksum | Archival |
| **Pull** | Remote to Local | Yes | Size only | Content retrieval |
| **Remote Backup** | Remote to Local | No | Full checksum | Disaster recovery |

Custom profiles are saved to the vault database and can be selected from the dropdown in the SyncPanel header.

## Speed Modes

AeroSync offers five speed presets that automatically configure parallel streams, compression, and delta sync. Select a speed mode from the dropdown to apply its settings instantly.

![Speed mode selector dropdown](/images/aerosync-speed-modes.png)
<!-- SCREENSHOT: Speed mode selector showing all five options (Normal through Maniac) with the current selection highlighted -->

| Mode | Parallel Streams | Compression | Delta Sync | Safety Checks |
|------|-----------------|-------------|------------|---------------|
| **Normal** | 1 | Off | Off | Full |
| **Fast** | 2 | On | Off | Full |
| **Turbo** | 4 | On | On | Full |
| **Extreme** | 8 | On | On | Reduced |
| **Maniac** | 16 | On | On | Disabled |

> **Warning:** Maniac mode is a Cyber theme easter egg. It disables all safety checks for maximum throughput, including retry limits (`max_retries=0`). Post-sync verification runs automatically to compensate. A mandatory verification pass executes after every Maniac sync to catch any transfer errors.

## Conflict Resolution Center

When both the local and remote copies of a file have been modified since the last sync, AeroSync pauses and presents the Conflict Resolution Center. This interface lists every conflicting file with metadata from both sides (size, modification time, checksum) so you can make informed decisions.

![Conflict Resolution Center with file list](/images/aerosync-conflicts.png)
<!-- SCREENSHOT: Conflict Resolution Center showing a list of conflicting files with Keep Local / Keep Remote / Skip buttons per file, plus batch action buttons at the top -->

### Per-File Resolution

For each conflicting file, three options are available:

- **Keep Local** - upload the local version, overwriting the remote copy
- **Keep Remote** - download the remote version, overwriting the local copy
- **Skip** - leave both versions untouched for this sync run

### Batch Actions

When dealing with many conflicts, batch actions resolve all files at once:

- **Keep Newer All** - for each file, keep whichever version has the more recent modification time
- **Keep Local All** - upload all local versions
- **Keep Remote All** - download all remote versions
- **Skip All** - leave all conflicting files untouched

All conflict decisions are recorded in the transfer journal for auditing and reproducibility.

## Scheduler

Configure AeroSync to run automatically on a recurring basis. The scheduler UI provides intuitive controls for timing and scope.

- **Interval selector** - choose a sync frequency from every 5 minutes up to every 24 hours
- **Time window** - restrict sync operations to specific hours (e.g., 02:00 to 06:00) to avoid interfering with active work or peak bandwidth periods
- **Day picker** - select which days of the week the scheduler should be active (weekdays only, weekends only, or custom)
- **Pause / Resume** - temporarily suspend the scheduler with a single click; a live countdown displays the time until the next scheduled sync
- **Overnight carry-over** - if a time window spans midnight (e.g., 23:00 to 03:00), AeroSync handles the day boundary correctly

## Filesystem Watcher

AeroSync can monitor local directories for real-time changes using inotify on Linux. A health indicator in the sync panel shows the watcher status:

- **Active** (green) - watcher is running and monitoring all configured paths
- **Warning** (yellow) - inotify watch count is approaching the system limit (`/proc/sys/fs/inotify/max_user_watches`)
- **Inactive** (gray) - watcher is not running

When the watcher detects file changes, it can trigger an immediate sync or queue changes for the next scheduled run, depending on your configuration.

## Transfer Journal

Every sync operation is logged to a persistent JSON journal stored in `~/.config/aeroftp/sync-journal/`. Journals are keyed by a hash of the local and remote path pair, ensuring each sync relationship maintains its own history.

### Checkpoint and Resume

If a sync operation is interrupted (application crash, network failure, manual cancellation), AeroSync detects the incomplete journal on the next run and displays a resume banner offering to continue from the last successfully transferred file.

### SHA-256 Verification

When the **Compare checksum** option is enabled, AeroSync computes SHA-256 hashes during the scan phase using streaming 64 KB chunk reads. This avoids loading entire files into memory and enables accurate change detection even when file timestamps are unreliable.

### Journal Maintenance

- **Auto-cleanup** - journals older than 30 days are automatically deleted when the sync panel opens
- **Clear History** - a button with confirmation dialog to delete all journals at once
- Journals use compact JSON serialization (no pretty-printing) to minimize disk usage

## Bandwidth Control

Limit upload and download speeds independently to prevent AeroSync from saturating your network connection. Available speed limits range from 128 KB/s to 10 MB/s, plus an "Unlimited" option.

The bandwidth limiter auto-detects whether the active backend is FTP (where throttling is applied at the socket level) or a cloud provider API (where throttling is applied at the HTTP request level). Current limits are loaded from the server connection when the sync panel opens.

## Multi-Path Sync Pairs

Define multiple local-to-remote path mappings within a single sync configuration. Each pair syncs independently, allowing you to synchronize different directories to different remote locations in one operation. The Multi-Path Editor provides CRUD controls for adding, editing, and removing path pairs.

## Dry-Run Export

Before executing a sync, run a dry-run to preview exactly what will happen. The dry-run scans both sides, computes the diff, and exports the planned operations as either:

- **JSON** - structured format for programmatic analysis or scripting
- **CSV** - tabular format for review in spreadsheet applications

The dry-run report includes file paths, planned actions (upload, download, delete, skip), file sizes, and the reason for each decision.

## Safety Score

A visual badge in the sync panel header displays a **Safety Score** based on your current configuration. Configurations that delete orphans, disable verification, or use high parallelism receive lower scores, helping you understand the risk level before starting a sync.

## Template Export and Import

Save your entire sync configuration (profile, speed mode, paths, scheduler settings, bandwidth limits) as an `.aerosync` file. These portable template files can be:

- Shared with team members for consistent sync setups
- Backed up alongside your project
- Imported on a different machine to replicate the same sync configuration

Templates are exported and imported via Tauri's native file dialog.

## Rollback Snapshots

Create pre-sync snapshots of your data that can be restored if a sync produces unwanted results.

- **Create snapshot** - save the current state before running a sync
- **List snapshots** - view all available snapshots with timestamps and file counts
- **Preview** - inspect the files contained in a snapshot before restoring
- **Delete** - remove old snapshots to free disk space

## Error Handling

AeroSync classifies errors into 10 categories using a structured taxonomy. Each error carries a retryability hint that determines whether AeroSync will automatically retry the operation.

The sync report groups errors by category with dedicated icons, showing retryable vs. non-retryable counts. This makes it straightforward to identify systemic issues (e.g., all failures are permission errors on a specific directory) versus transient problems (e.g., intermittent network timeouts).

## Exponential Backoff Retry

Failed transfers are retried automatically with configurable exponential backoff:

- **Base delay:** 500 ms (configurable)
- **Multiplier:** 2x per retry
- **Maximum delay cap:** 10 seconds
- **Default retries:** 3 per file
- **Per-file timeout:** 2 minutes

Delay values are guarded against NaN and Infinity to prevent runaway retry loops.
