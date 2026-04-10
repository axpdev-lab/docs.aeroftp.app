# AeroFile

AeroFile is AeroFTP's professional local file manager. Toggle between remote server mode and local-only mode to get a full-featured file browser without needing a server connection. AeroFile includes tabbed browsing, a Places sidebar with drive detection, three view modes, file tags, Quick Look previews, batch rename, and comprehensive keyboard shortcuts.

## Activating AeroFile Mode

Click the **AeroFile** icon button in the titlebar to toggle local-only mode. When active, both panels show local directories and remote connection controls are hidden. Click again to return to the standard dual-panel (local + remote) layout.

## Local Path Tabs

AeroFile supports up to **12 simultaneous tabs**, each pointing to a different local directory. Tabs persist across sessions via localStorage.

### Tab Operations

| Action | How |
|--------|-----|
| Open new tab | Click **+** or middle-click a folder |
| Close tab | Middle-click the tab, or right-click and select **Close Tab** |
| Close other tabs | Right-click a tab → **Close Other Tabs** |
| Close all tabs | Right-click a tab → **Close All Tabs** |
| Reorder tabs | Drag a tab to a new position |
| Switch tabs | Click a tab |

Tabs display the folder name and full path on hover. The active tab is highlighted with the theme's accent color.

## Places Sidebar

The left sidebar provides quick access to common locations, drives, and network shares. Toggle the sidebar with `Ctrl+B`.

### User Directories

Standard XDG directories detected automatically:

- Home, Desktop, Documents, Downloads, Music, Pictures, Videos

### Custom Locations

Pin any folder to the sidebar by dragging it in or using the context menu. Custom locations appear below the user directories and can be removed individually.

### Recent Locations

The sidebar tracks recently visited directories. Each entry shows a hover-visible **X** button for individual removal, and a **Clear All** button appears at the section header.

### Mounted Drives

All mounted partitions are listed with:

- **Drive label** or device name
- **Filesystem type** (ext4, NTFS, FAT32, etc.)
- **Usage bar** showing used / total space
- **Eject button** for removable media (via `udisksctl`)

The following partitions are hidden automatically (matching Nautilus behavior):

- EFI System Partition (`/boot/efi`, `/boot`, `/efi`)
- Swap partitions
- Recovery partitions
- Microsoft Reserved (MSR)

### Unmounted Partitions

Unmounted partitions detected via `lsblk` are shown in a separate group. Click to mount via `udisksctl mount`.

### GVFS Network Shares

On Linux with GVFS, AeroFile detects network mounts under `/run/user/<uid>/gvfs/` and displays them with a globe icon. Supported protocols:

- SMB (Windows / Samba shares)
- SFTP
- FTP
- WebDAV
- NFS
- AFP

Click the eject button to unmount via `gio mount -u`.

### Folder Tree

Press `Ctrl+B` to toggle the Places sidebar. Within the sidebar, expand any directory to browse a hierarchical folder tree without changing the main panel.

## View Modes

Switch between three view modes using the toolbar buttons or keyboard shortcuts.

| Mode | Shortcut | Description |
|------|----------|-------------|
| **List** | `Ctrl+1` | Detailed table with columns: Name, Size, Modified, Type, Permissions |
| **Grid** | `Ctrl+2` | Icon grid with thumbnail previews |
| **Large Icons** | `Ctrl+3` | 96px icon grid for visual browsing |

All view modes support:

- Column sorting (List mode: click column headers)
- Selection (click, Shift+click for range, Ctrl+click for toggle)
- Drag and drop
- File tag badges

## File Tags

Tag files with color-coded labels for visual organization. Tags are stored in a local SQLite database (WAL mode) and persist across sessions.

### Preset Color Labels

| Color | Label | Use Case |
|-------|-------|----------|
| Red | Red | Urgent, priority |
| Orange | Orange | In progress |
| Yellow | Yellow | Needs review |
| Green | Green | Approved, complete |
| Blue | Blue | Reference |
| Purple | Purple | Personal |
| Gray | Gray | Archive |

### Applying Tags

- **Context menu**: Right-click a file → **Tags** submenu → toggle labels on/off
- **Clear all**: Context menu → **Tags** → **Clear All Tags**
- **Batch tagging**: Select multiple files, then apply tags via context menu

### Tag Badges

In both List and Grid views, tagged files display colored dot badges next to the filename. When a file has more than 3 tags, a **+N** overflow indicator appears.

### Sidebar Filter

The Places sidebar shows a **Tags** section listing all labels with file counts. Click a label to filter the current directory to show only files with that tag.

## Quick Look

Press `Space` to preview the selected file in a modal overlay. Press `Space` again or `Escape` to close.

### Supported Formats

| Category | Formats |
|----------|---------|
| Images | PNG, JPG, GIF, SVG, WebP, BMP, ICO |
| Video | MP4, WebM, OGG |
| Audio | MP3, WAV, FLAC, OGG, AAC |
| Code | Syntax-highlighted preview for 50+ languages |
| Markdown | Rendered HTML preview |
| Text | Plain text with line numbers |
| PDF | Embedded viewer |

### Navigation

While Quick Look is open, use arrow keys to navigate between files. The preview updates instantly without closing the overlay.

## Properties Dialog

Select a file or folder and press `Alt+Enter` (or right-click → **Properties**) to open the Properties dialog.

### General Tab

- **Name**, **Path**, **Size** (formatted with appropriate unit)
- **Created** date, **Modified** date, **Accessed** date
- **Symlink target** (if the file is a symbolic link)
- **MIME type**

### Permissions Tab (Linux / macOS)

- **Owner**, **Group**, **Other** - read, write, execute checkboxes
- **Octal representation** (e.g., `0755`)
- **Owner name** and **Group name**

### Checksum Tab

Compute file hashes on demand:

| Algorithm | Output |
|-----------|--------|
| MD5 | 128-bit |
| SHA-1 | 160-bit |
| SHA-256 | 256-bit |
| SHA-512 | 512-bit |

Click **Copy** next to any hash to copy it to the clipboard.

## Batch Rename

Select multiple files and press `Ctrl+Shift+R` (or right-click → **Batch Rename**) to open the Batch Rename dialog. Four renaming modes are available, each with a live preview showing before/after filenames.

### Modes

| Mode | Description | Example |
|------|-------------|---------|
| **Find / Replace** | Search and replace text in filenames | `photo` → `vacation` |
| **Prefix** | Add text before each filename | `2024_` + `report.pdf` → `2024_report.pdf` |
| **Suffix** | Add text before the extension | `report` + `_final` → `report_final.pdf` |
| **Sequential** | Number files sequentially | `photo_001.jpg`, `photo_002.jpg`, ... |

### Options

- **Case sensitive** toggle (Find / Replace mode)
- **Start number** and **step** (Sequential mode)
- **Zero padding** width (Sequential mode)

## Inline Rename

Press `F2` or click on an already-selected filename to enter inline rename mode. The filename text becomes editable in place. Press `Enter` to confirm or `Escape` to cancel. Inline rename works in both local and remote panels.

## Drag and Drop

AeroFile supports drag and drop for file operations:

| Action | Behavior |
|--------|----------|
| Drag within same panel | Move files to the target folder |
| Drag between local panels | Move files between tabs |
| Drag from local to remote panel | Upload files to the remote server |
| Drag from remote to local panel | Download files to the local directory |
| Drag files to AeroAgent chat | Attach files for AI analysis |

Hold `Ctrl` while dragging to copy instead of move.

## Keyboard Shortcuts

### Navigation

| Shortcut | Action |
|----------|--------|
| `Enter` | Open selected file / enter directory |
| `Backspace` | Go to parent directory |
| `Ctrl+L` | Focus the path bar for direct path entry |
| `Ctrl+B` | Toggle Places sidebar |
| `Alt+Left` | Navigate back in history |
| `Alt+Right` | Navigate forward in history |

### Selection

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` | Select all files |
| `Ctrl+Click` | Toggle individual selection |
| `Shift+Click` | Range selection |
| `Escape` | Clear selection |

### File Operations

| Shortcut | Action |
|----------|--------|
| `Space` | Quick Look preview |
| `F2` | Inline rename |
| `Delete` | Move to trash |
| `Shift+Delete` | Permanent delete (with confirmation) |
| `Ctrl+C` | Copy selected files |
| `Ctrl+X` | Cut selected files |
| `Ctrl+V` | Paste files |
| `Ctrl+Shift+R` | Batch Rename dialog |
| `Alt+Enter` | Properties dialog |

### View

| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | List view |
| `Ctrl+2` | Grid view |
| `Ctrl+3` | Large Icons view |
| `Ctrl+H` | Toggle hidden files |
| `Ctrl+R` | Refresh directory listing |
