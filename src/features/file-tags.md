# File Tags

AeroFTP supports Finder-style color labels for organizing local files. Tags are stored in a local SQLite database and persist across sessions.

## Color Labels

Seven preset color labels are available, matching the macOS Finder convention:

| Color | Label |
|-------|-------|
| Red | Red |
| Orange | Orange |
| Yellow | Yellow |
| Green | Green |
| Blue | Blue |
| Purple | Purple |
| Gray | Gray |

Each file can have multiple tags applied simultaneously.

## Tagging Files

There are two ways to apply tags:

1. **Context menu** — right-click a file or selection, hover over the Tags submenu, and toggle labels on or off. Select "Clear All Tags" to remove all labels from the selected files.
2. **Batch tagging** — select multiple files, then use the context menu to apply the same tag to all selected items at once.

## Visual Indicators

Tagged files display colored dot badges in both list and grid views:
- Up to 3 dots are shown inline next to the filename
- Additional tags display as a "+N" overflow indicator
- Badges are rendered with `React.memo` for performance

## Sidebar Filter

The Places Sidebar includes a **Tags** section listing all labels with file counts. Click a label to filter the file list, showing only files with that tag. This provides a quick cross-directory view of categorized files.

## Storage

Tags are stored in a SQLite database using WAL mode for concurrent read performance. The database supports 9 Tauri commands for label CRUD, batch operations, and count queries. Tag data is local-only and not synchronized to remote servers.

> **Tip:** Use tags to mark files for review, categorize project assets, or flag items for later processing — the sidebar filter makes it easy to find tagged files across directories.
