# Interface Overview

AeroFTP uses a dual-pane file manager layout with an integrated development toolkit. This page describes each area of the interface.

## Titlebar

The titlebar follows a VS Code-style design with four dropdown menus:

| Menu | Contents |
| ------ | ---------- |
| **File** | New Connection, Save Connection, Import/Export, AeroVault, AeroSync, Settings, Quit |
| **Edit** | Cut, Copy, Paste, Batch Rename, Find |
| **View** | AeroTools, AeroFile mode, Theme, Places Sidebar |
| **Help** | About, Support, Providers & Integrations, Check for Updates |

The titlebar also contains the **theme toggle** (cycles through Light, Dark, Tokyo Night, and Cyber themes), a **settings gear**, and **window controls**.

## Dual-Pane File Manager

The core of the interface is split into two panels:

- **Left panel (Local)**: Displays your local filesystem. Supports tabbed browsing with up to 12 local path tabs. Tabs can be reordered by dragging and closed via middle-click or context menu.
- **Right panel (Remote)**: Displays the remote server or cloud provider. Appears after connecting to a server.

Both panels share the same features:

- Sortable columns (Name, Size, Date Modified, Type, Permissions)
- Grid or list view
- Breadcrumb path navigation
- Context menu with file operations (upload, download, rename, delete, compress, encrypt, and more)

> **Tip:** In **AeroFile mode** (toggle from the View menu), AeroFTP works as a standalone local file manager without any remote connection.

## Session Tabs

When connected to multiple servers, each connection appears as a **session tab** at the top of the remote panel. Right-click a tab for options: Close Tab, Close Other Tabs, Close All Tabs.

## Status Bar

The bottom status bar displays:

- Current connection protocol and host
- Remote path
- Storage quota (when supported by the provider)
- AI status indicator (Ready, Thinking, Running tool, Error)

## Places Sidebar

The left sidebar provides quick navigation:

- **Bookmarks**: Pinned directories (Home, Desktop, Documents, Downloads)
- **Devices**: Mounted drives and unmounted partitions
- **Network**: GVFS network shares (SMB, SFTP, NFS) with eject support
- **Recent Locations**: Recently visited paths, individually removable
- **Tags**: File tags with colored labels -- click a tag to filter the file list

## AeroTools Panel

Toggle AeroTools from the View menu or titlebar. It opens a resizable bottom panel with three tabs:

- **Code Editor**: Monaco-based editor with syntax highlighting, multiple language support, and Cyber theme
- **Terminal**: Integrated PTY terminal with theme-synced colors
- **AeroAgent**: AI assistant with 47 tools for file management, code analysis, shell commands, and more

## Context Menus

Right-click any file or folder for a context menu with operations relevant to the current selection:

- **File operations**: Open, Rename (F2), Delete, Move, Copy, Cut/Paste
- **Transfer**: Upload, Download
- **Advanced**: Compress (ZIP/7z/TAR), Encrypt (AeroVault), Tags, Properties
- **Cloud-specific**: Star (Google Drive), Tags (Box/Dropbox), Labels (Zoho), Trash management
- **AI**: "Ask AeroAgent" sends the file context to the AI assistant

## Keyboard Shortcuts

| Shortcut | Action |
| ---------- | -------- |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+L` | Focus path bar |
| `Ctrl+Shift+N` | New connection |
| `Ctrl+Shift+E` | Toggle AeroTools |
| `Ctrl+Shift+A` | Ask AeroAgent (from editor) |
| `Ctrl+F` | Search in AeroAgent chat |
| `F2` | Rename selected file |
| `F5` | Refresh file listing |

> **Next step:** Learn about the [protocols](../protocols/overview.md) AeroFTP supports, or dive into features like [AeroSync](../features/aerosync.md) and [AeroVault](../features/aerovault.md).
