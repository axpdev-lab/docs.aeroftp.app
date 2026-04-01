# Interface Overview

AeroFTP uses a dual-pane file manager layout with an integrated development toolkit, a VS Code-style titlebar, and extensive keyboard-driven navigation. This page provides a detailed tour of every area of the interface.

## Titlebar and Menus

The titlebar replaces the native window decoration with a custom VS Code-style design. It contains four dropdown menus that open on click and switch on hover:

![Titlebar with the File menu open showing all available options](/images/interface-titlebar-menu.png)
<!-- SCREENSHOT: The titlebar area with the File dropdown menu fully expanded. Show all menu items (New Connection, Save Connection, Import/Export, AeroVault, AeroSync, Settings, Quit) with their keyboard shortcut labels. The other menu labels (Edit, View, Help) should be visible but not expanded. Dark theme. -->

| Menu | Key Items |
| --- | --- |
| **File** | New Connection, Save Connection, Import/Export Servers, AeroVault, AeroSync, Settings, Quit |
| **Edit** | Cut, Copy, Paste (file clipboard operations, selection-aware), Batch Rename, Find |
| **View** | AeroTools toggle, AeroFile mode, Theme selector, Places Sidebar toggle |
| **Help** | About, Support dialog, Providers & Integrations matrix, Check for Updates |

To the right of the menus you will find:

- **AeroFile toggle**: Switches to local-only file manager mode (no remote panel)
- **Settings gear**: Opens the Settings dialog
- **Theme toggle**: Cycles through Light, Dark, Tokyo Night, and Cyber themes
- **Window controls**: Minimize, maximize, and close buttons

## Dual-Pane File Manager

The core workspace is divided into two resizable panels separated by a draggable divider.

![Full application window showing dual-pane layout with local files left and remote files right](/images/interface-dual-pane.png)
<!-- SCREENSHOT: The full AeroFTP window in connected state. Left panel showing local home directory with several files and folders. Right panel showing remote server files. The divider between panels should be visible. Show the breadcrumb path bars at the top of each panel. Column headers (Name, Size, Modified, Type, Perms) visible. Dark theme. -->

### Left Panel (Local)

Displays your local filesystem. Features include:

- **Tabbed browsing**: Up to 12 local path tabs, each pointing to a different directory. Drag tabs to reorder them. Middle-click a tab to close it.
- **Breadcrumb navigation**: Click any segment of the path to jump to that directory
- **Column sorting**: Click any column header (Name, Size, Date Modified, Type, Permissions) to sort ascending or descending
- **Inline rename**: Press `F2` or click on an already-selected filename to rename it in place

### Right Panel (Remote)

Displays the remote server or cloud provider's filesystem. Appears after establishing a connection. Supports the same column layout, sorting, and breadcrumb navigation as the local panel.

> **AeroFile mode:** Toggle from the View menu to hide the remote panel entirely and use AeroFTP as a standalone local file manager with all its features (tags, preview, compression, encryption).

## Session Tabs

When connected to multiple servers simultaneously, each connection appears as a **session tab** above the remote panel. The active tab is highlighted; inactive tabs show the server name and protocol icon.

![Session tabs showing multiple connections with a right-click context menu](/images/interface-session-tabs.png)
<!-- SCREENSHOT: The session tab bar at the top of the remote panel showing 3 tabs (e.g., "NAS - SFTP", "Google Drive", "AWS S3"). One tab should have a right-click context menu open showing: Close Tab, Close Other Tabs, Close All Tabs. Dark theme. -->

- **Right-click** a tab to access: Close Tab, Close Other Tabs, Close All Tabs
- **Middle-click** a tab to close it immediately
- Each tab maintains its own remote path state independently

## Places Sidebar

The left sidebar provides quick navigation organized into collapsible sections:

![Places sidebar showing Bookmarks, Devices, Network, Recent, and Tags sections](/images/interface-places-sidebar.png)
<!-- SCREENSHOT: The Places sidebar fully expanded showing all sections. Bookmarks section with Home, Desktop, Documents, Downloads. A Devices section with a mounted drive. Recent Locations with 2-3 paths and X buttons on hover. Tags section showing all 7 color labels (Red, Orange, Yellow, Green, Blue, Purple, Gray) with file counts next to each. Dark theme. -->

| Section | Description |
| --- | --- |
| **Bookmarks** | Pinned directories: Home, Desktop, Documents, Downloads, and custom bookmarks |
| **Devices** | Mounted drives and unmounted partitions (auto-detected via `lsblk`). Click an unmounted partition to mount it via `udisksctl`. EFI and swap partitions are filtered out. |
| **Network** | GVFS network shares (SMB, SFTP, FTP, WebDAV, NFS, AFP) detected from `/run/user/<uid>/gvfs/`. Each share shows a Globe icon and can be ejected via the eject button. |
| **Recent Locations** | Recently visited directories. Hover over an entry to reveal an **X** button for individual removal. A **Clear All** option is also available. |
| **Tags** | Seven color-coded file labels (Red, Orange, Yellow, Green, Blue, Purple, Gray). Click any tag to filter the file list to show only files with that label. File counts appear next to each tag. |

## File List and Columns

Both panels display files in a table with these columns:

| Column | Details |
| --- | --- |
| **Name** | File/folder name with type-appropriate icon. AeroVault containers show a shield icon. |
| **Size** | Human-readable file size (KB, MB, GB). Blank for directories. |
| **Modified** | Last modification date, formatted with `Intl.DateTimeFormat` for your locale |
| **Type** | File extension or MIME category. Responsive -- hidden on narrow viewports. |
| **Permissions** | Unix permission string (e.g., `rwxr-xr-x`). Responsive -- hidden below `xl` breakpoint. |

All columns are sortable by clicking the header. The current sort direction is indicated by an arrow icon.

## Context Menus

Right-click any file or folder to open a comprehensive context menu with operations relevant to the selection and current protocol:

![Context menu showing file operations, transfer, compression, encryption, tags, and AI options](/images/interface-context-menu.png)
<!-- SCREENSHOT: A right-click context menu on a file in the remote panel. Show the full menu with sections: Open, Edit in Monaco, Download, Rename (F2), Delete, a separator, Compress (ZIP/7z/TAR), Encrypt (AeroVault), a separator, Tags submenu arrow, a separator, Ask AeroAgent. Dark theme. -->

- **File operations**: Open, Rename (F2), Delete, Move, Copy, Cut/Paste
- **Transfer**: Upload or Download (depending on which panel)
- **Compression**: Create ZIP, 7z, TAR, GZ, XZ, or BZ2 archives. Password-protected ZIP and 7z supported.
- **Encryption**: Encrypt files or folders into AeroVault containers
- **Tags**: Assign color labels from a submenu of 7 preset colors, or clear all tags
- **Cloud-specific**: Star/unstar (Google Drive), Tags (Box/Dropbox), Labels (Zoho WorkDrive), Trash management
- **AI**: "Ask AeroAgent" sends the selected file's context to the AI assistant for analysis

## Status Bar

The bottom bar displays real-time connection and application state:

![Status bar showing connection protocol, remote path, quota, and AI status indicator](/images/interface-status-bar.png)
<!-- SCREENSHOT: Close-up of the status bar at the bottom of the window. Show from left to right: protocol badge (e.g., "SFTP"), host info (e.g., "nas.example.com"), the current remote path, storage quota if available, and the AI status widget on the right (showing "Ready" state with a green dot). Dark theme. -->

- **Protocol badge**: Shows the active protocol (FTP, SFTP, S3, Google Drive, etc.)
- **Host information**: Server hostname and port
- **Remote path**: Current directory path on the remote server
- **Storage quota**: Used/total storage when supported by the provider (e.g., Google Drive, Dropbox)
- **AI status widget**: Compact indicator showing AeroAgent state -- Ready, Thinking, Running tool, or Error

## AeroTools Panel

Toggle AeroTools from the **View** menu, the titlebar button, or `Ctrl+Shift+E`. A resizable bottom panel slides up with three tabs:

![AeroTools panel showing the code editor, terminal, and AeroAgent tabs](/images/interface-aerotools.png)
<!-- SCREENSHOT: The AeroTools panel open at the bottom of the window, taking about 40% of the height. Show the three tab buttons (Code Editor, Terminal, AeroAgent). The Code Editor tab should be active, showing Monaco editor with some code and syntax highlighting. The file panels should be visible above, compressed. Dark theme. -->

| Tab | Description |
| --- | --- |
| **Code Editor** | Monaco-based editor with syntax highlighting for 50+ languages, Cyber theme support, and "Ask AeroAgent" integration (`Ctrl+Shift+A`) |
| **Terminal** | Integrated PTY terminal (xterm.js) with theme-synced colors. Supports full interactive shell sessions. |
| **AeroAgent** | AI chat assistant with 47 tools for file management, code analysis, shell execution, archive operations, and server management across all 27 protocols |

## Command Palette

Press `Ctrl+Shift+P` to open the **Command Palette** -- a VS Code-style quick-access overlay with approximately 25 commands organized into five categories. Type to filter, use arrow keys to navigate, and press Enter to execute.

![Command Palette open with search field and categorized command list](/images/interface-command-palette.png)
<!-- SCREENSHOT: The Command Palette overlay centered in the window. Show the search input at the top with a few characters typed (e.g., "aero"). Below, show the filtered list of matching commands with their keyboard shortcuts displayed on the right side. Dark theme. -->

## Themes

AeroFTP ships with four carefully designed themes. Cycle through them with the theme toggle button in the titlebar, or select a specific theme from **View > Theme**.

![Comparison grid showing all four themes: Light, Dark, Tokyo Night, and Cyber](/images/interface-themes.png)
<!-- SCREENSHOT: A 2x2 grid composite image showing the same AeroFTP window in all four themes. Top-left: Light (white background, blue accents). Top-right: Dark (dark gray, blue accents). Bottom-left: Tokyo Night (deep blue-purple background, purple accents). Bottom-right: Cyber (black background, neon green accents). Each quadrant should show enough of the UI to distinguish the color scheme. -->

| Theme | Description |
| --- | --- |
| **Light** | Clean white background with blue accents. Ideal for bright environments. |
| **Dark** | Dark gray background with blue accents. Default theme. |
| **Tokyo Night** | Deep blue-purple palette inspired by the popular editor theme. |
| **Cyber** | Black background with neon green accents. Unlocks the Security Toolkit (Hash Forge, CryptoLab, Password Forge). |

## Keyboard Shortcuts Reference

| Shortcut | Action |
| --- | --- |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+Shift+N` | New connection |
| `Ctrl+Shift+E` | Toggle AeroTools panel |
| `Ctrl+Shift+A` | Ask AeroAgent (from Monaco editor) |
| `Ctrl+L` | Focus path bar |
| `Ctrl+F` | Search in AeroAgent chat |
| `F2` | Rename selected file inline |
| `F5` | Refresh file listing |
| `V` | Cycle AeroPlayer visualizer modes (when player is active) |

> **Next step:** Learn about the [protocols](../protocols/overview.md) AeroFTP supports, or dive into features like [AeroSync](../features/aerosync.md), [AeroVault](../features/aerovault.md), and [AeroAgent](../features/aeroagent.md).
