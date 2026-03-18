# File Tags

AeroFTP supports Finder-style color labels for organizing local files. Tags provide a visual categorization system that works across directories, letting you mark files for review, flag important assets, or create ad-hoc groupings without moving files into folders. Tags are stored in a local SQLite database and persist across sessions.

## Color Labels

Seven preset color labels are available, matching the macOS Finder convention:

| Color | Label | Suggested Use |
| ----- | ----- | ------------- |
| Red | Red | Urgent, needs attention, critical files |
| Orange | Orange | In progress, pending review |
| Yellow | Yellow | Important, flagged for follow-up |
| Green | Green | Approved, complete, ready to deploy |
| Blue | Blue | Reference material, documentation |
| Purple | Purple | Personal, archived, low priority |
| Gray | Gray | Neutral, temporary, to be sorted |

Each file can have multiple tags applied simultaneously, and the suggested uses above are purely conventions -- you can use any color for any purpose.

## Tagging Files

### Context Menu

Right-click a file or selection to access the Tags submenu. Each color label appears as a toggle: click to apply, click again to remove. The submenu also includes a **Clear All Tags** option to remove all labels from the selected files at once.

![Context menu with tag submenu](/images/file-tags-menu.png)
<!-- SCREENSHOT: Right-click context menu on a file, with the Tags submenu expanded showing all 7 color labels (some checked, some unchecked) and the Clear All Tags option at the bottom -->

### Batch Tagging

Select multiple files (Ctrl+Click or Shift+Click), then right-click and use the Tags submenu. The selected tag is applied to all selected files simultaneously. This makes it efficient to categorize a group of related files in a single operation.

### Tag Toggle Behavior

Tags use toggle semantics: if a file already has a particular color label, selecting that label again removes it. This provides a quick way to untag files without navigating to a separate "remove" action.

## Visual Indicators

Tagged files display colored dot badges directly in the file list, providing immediate visual identification without opening a context menu or properties dialog.

![File list with colored tag badges](/images/file-tags-badges.png)
<!-- SCREENSHOT: File list view showing several files with colored dot badges next to their filenames -- one file with a single red dot, another with green and blue dots, and one with 3 dots plus a "+1" overflow indicator -->

### Badge Display Rules

- **Up to 3 dots** are shown inline next to the filename, each in its respective label color
- Files with more than 3 tags display a **"+N" overflow indicator** showing how many additional tags are applied
- Badges appear in both **list view** and **grid view**
- Badge rendering uses `React.memo` for performance, preventing unnecessary re-renders when scrolling through large file lists

## Sidebar Filter

The Places Sidebar includes a dedicated **Tags** section that lists all seven color labels with their respective file counts. This provides a powerful cross-directory view of categorized files.

![Sidebar showing tag filters with counts](/images/file-tags-sidebar.png)
<!-- SCREENSHOT: Places Sidebar with the Tags section visible, showing colored dots next to each label name (Red, Orange, Yellow, Green, Blue, Purple, Gray) with file counts like "Red (3)", "Green (7)", and some labels showing (0) -->

### Filtering by Tag

Click any label in the sidebar Tags section to filter the file list. When a tag filter is active:

- The file list shows only files that have the selected tag, regardless of which directory they reside in
- The active filter is visually highlighted in the sidebar
- Click the same label again to clear the filter and return to the normal directory view

This makes it easy to find all files you have flagged as "urgent" (Red) or "ready to deploy" (Green) across your entire local file tree without navigating to each directory individually.

## Storage

Tags are stored in a SQLite database using WAL (Write-Ahead Logging) mode for concurrent read performance. The database is created automatically on first use and lives in the AeroFTP application data directory.

### Technical Details

- **9 Tauri commands** provide the full CRUD interface: add label, remove label, get labels for file, get labels for multiple files (batch), set labels, clear labels, get all labels with counts, and batch operations
- **Debounced batch queries** (150 ms) in the `useFileTags` hook reduce database round-trips when browsing directories with many tagged files
- **Map cache** in the frontend provides instant lookup of tag data for visible files
- **WAL mode** allows concurrent reads during writes, preventing UI freezes when tagging files while browsing

### Scope

Tag data is **local-only** and is not synchronized to remote servers. Tags are associated with absolute file paths, so moving or renaming a file outside of AeroFTP will disassociate it from its tags. Renaming or moving files within AeroFTP preserves tag associations.

> **Tip:** Use tags to create workflow states (Red = needs review, Green = approved) or to mark files across multiple directories for a batch operation. The sidebar filter makes it easy to collect tagged files from anywhere in your file tree.
