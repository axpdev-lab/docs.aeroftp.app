---
description: "Compare trees, review a sync plan, and run Backup, Update, Mirror or Two-way sync with explicit conflict policies."
---

# AeroSync

AeroSync compares two folders and turns the differences into a reviewable sync plan. In v4.2.5 the connected local/remote workflow has two tabs, **Compare** and **Plan**. When both sides are local, a third tab, **Local mirror**, runs local-only sync through `local_sync_run`: eligible files use AeroRsync's in-process `LocalDeltaTransport`, while smaller files or runs with delta disabled use plain copying. Remote sync runs from **Plan**.

Open AeroSync from the menu with the folders you want to compare already selected. A remote session must be connected for remote operations and the Templates, Multi-Path, Rollback snapshots, Sync journals and Scheduler launchers.

## Compare

Start the recursive comparison explicitly. AeroSync does not read both complete trees just because you opened the dialog. The scan reports progress and can be stopped. A stopped or incomplete scan must not be treated as proof that the missing files should be deleted.

The result groups files as only on the left, only on the right, newer on either side, identical, or conflicting. Review the paths, exclusions and metadata before opening **Plan**. Comparison settings and the later post-transfer verification policy are separate choices.

### Names and scan boundaries

Unix filenames retain their literal spelling, including leading or trailing spaces and backslashes. Unicode-normalized matching is used only where sibling names identify one unambiguous counterpart. A collision between spellings, or a file/folder type collision, blocks affected paths and descendants from unsafe planning instead of selecting an arbitrary file.

The shared scanner defaults to a depth of 100 and a budget of 500,000 entries. Unreadable directories, limits, cancelled scans and paths outside the root are recorded as scan boundaries. A run is refused when it cannot safely bound the missing part of the source tree. Review the reported boundary rather than treating the partial listing as an empty folder.

## Plan

Choose a mode and, for a one-way mode, its source and destination. The labels describe the real panel direction, such as **Local → Remote** or **Remote → Local**.

| Mode | Copies and replacements | Destination-only files | Conflicts |
| --- | --- | --- | --- |
| **Backup** (default) | Copies missing files and newer source files; keeps a newer destination | Kept | Skipped by default |
| **Update** | Copies missing files and newer source files; the selected conflict policy may choose either copy | Kept | Skipped by default; configurable |
| **Mirror** | Makes the destination follow the source, including overwriting a newer destination | Deleted | Source wins; conflict selector is disabled |
| **Two-way sync** | Copies missing files both ways and propagates the newer copy | Copied to the other side | Skipped by default; configurable |

**Update is not an unconditional “never overwrite a newer file” mode.** A selected conflict policy can choose an older copy or the opposite side. Review the per-file actions shown by the plan. Mirror has its own source-wins behavior and does not use the conflict selector.

### Conflict policies

- **Skip** leaves both copies unchanged.
- **Keep both** copies the source under a timestamped suffix.
- **Keep newer / Keep older**: choose by modification time.
- **Keep larger / Keep smaller**: choose by size.

If the required metadata is absent or tied, the policy leaves the conflict unresolved. The plan lists copy, overwrite, delete, skip and conflict counts before execution. Destructive actions require confirmation.

### Speed and verification

Speed modes set retry behavior and delta eligibility. They do not promise 2, 4, 8 or 16 concurrent file streams or compression in this GUI runner. **Normal** uses ordinary transfers; **Fast**, **Turbo** and **Extreme** request delta where the session supports it, currently eligible SFTP with remote rsync. See [Delta Sync](/features/delta-sync) and [AeroRsync](/features/aerorsync).

Post-transfer verification offers **None**, **Size only**, **Size + mtime** and **Full checksum**. Available remote hashes depend on the provider; selecting checksum does not create a server-side SHA-256 capability. See [Checksums](/protocols/checksums) for algorithm and fallback limits.

**Maniac** is available only in the Cyber theme and needs explicit confirmation. It disables the journal, the regular verification and bandwidth cap, uses its own bounded retry policy, and performs a mandatory post-sync size/mtime verification pass. It does not disable every safety check.

### Trial runs, budgets and error correction

For connected remote runs, the Plan tab offers a transfer budget in MB, where zero means unlimited. A canary run previews a sample selected randomly, by newest file or by largest file; it transfers nothing. Approving the result starts the real run.

The Backup mode enables error correction at the Medium (15%) setting by default. Other modes start with it off. An `.aerocorrect` sidecar provides recovery data and costs additional storage and transfer bytes. See [Error Correction](/security/error-correction).

## Progress and results

Remote sync shows each file's current phase and result, with completion, skipped files, unresolved conflicts and verification failures. Progress reflects the work selected for this run. A delta badge means the file actually used delta; a classic fallback badge identifies a delta attempt that reverted to ordinary transfer.

Local mirror shows the current path and processed/total file count. While it is running, the dialog keeps that tab mounted. Closing a busy run asks whether to stop it.

## Exclusions and folder removal

Exclude patterns are shared by Compare, Plan, Local mirror, templates and the CLI. A bare directory name such as `node_modules` excludes that directory's subtree; matching is case-insensitive. Invalid patterns are reported. Review old exclude lists if they were written for earlier, narrower matching rules. See [CLI sync](/cli/commands#sync).

Mirror retains excluded, hidden or unfinished children and their parent folders. Directory deletion only removes empty directories. A failed versioned-backup move does not authorize deleting the original or its parent.

## Versioned backup

When enabled, versioned backup moves the destination copy, together with its `.aerocorrect` sidecar, before an overwrite or delete, on supported local and remote destinations:

```text
<backup folder>/<run timestamp>/<original path>
```

An existing backup is retained; another copy receives a suffix such as `name.1.ext`. The backup folder and its parent path are excluded from comparison. The Plan tab explains the backend's move behavior and disables execution where the required move cannot be guaranteed.

## Templates and wrapper scripts

The Templates dialog saves `.aerosync` files and exports executable `.aeroftp-script`, POSIX `.sh` and PowerShell `.ps1` wrappers. In v4.2.5 exports carry the live Plan mode, including **Update**, direction, comparison and verification settings, conflict policy, exclusions, speed, transfer budget, error correction, canary and versioned-backup settings where the format supports them.

Import applies the configuration to the live Plan controls. A GUI template must identify exactly one usable local/remote pair; zero or multiple usable pairs are refused rather than silently dropping paths. Multi-Path has its own editor.

Shell and PowerShell wrappers embed a `# AEROFTP-META { ... }` line. Import reads that metadata, not a reverse interpretation of a hand-edited script body. The dialog shows the matching CLI command, or a reason the current settings cannot be represented faithfully. A wrapper schedules nothing by itself: run it manually or through your operating system's scheduler.

## Journals, scheduling and recovery

The Sync journals launcher shows saved run history and interrupted remote runs can offer Resume or Discard. Check the report and remote state before resuming an uncertain transfer. [AeroCloud](/features/aerocloud) provides the separate continuous background-sync workflow.

The Scheduler, Multi-Path and Rollback snapshots launchers open their dedicated configuration dialogs. A rollback snapshot and a versioned backup serve different purposes; keep backups outside the data you intend Mirror to remove.

## Related documentation

- [CLI sync](/cli/commands#sync)
- [Delta Sync](/features/delta-sync)
- [Checksums and hashes](/protocols/checksums)
- [DAG transfer engine](/architecture/dag-transfer-engine)
