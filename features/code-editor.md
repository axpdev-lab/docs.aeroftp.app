# Code Editor

AeroFTP includes an integrated code editor powered by Monaco Editor (the same engine behind VS Code). It supports syntax highlighting for all major languages, multiple themes, and direct integration with AeroAgent.

## Opening Files

Double-click any text file in the local or remote file panel to open it in the editor. Remote files are downloaded to a temporary location for editing. On save, remote files are automatically uploaded back to the server.

## Features

- **Syntax highlighting** - auto-detected by file extension, covering 50+ languages
- **Multiple themes** - editor theme syncs with the application theme:

| App Theme | Editor Theme |
|-----------|-------------|
| Light | Default Light |
| Dark | GitHub Dark |
| Tokyo Night | Tokyo Night |
| Cyber | Cyber (neon green on dark) |

- **Find and replace** - standard Ctrl+F / Ctrl+H with regex support
- **Minimap** - code overview on the right side of the editor
- **Word wrap** - toggle via the View menu
- **Line numbers** and **bracket matching**

## AeroAgent Integration

The code editor connects to AeroAgent in two ways:

### Ask AeroAgent (Ctrl+Shift+A)
Select code in the editor, then press **Ctrl+Shift+A** (or right-click > Ask AeroAgent) to send the selection to the AI chat with context. AeroAgent can explain, refactor, or debug the selected code.

### Live Sync
When AeroAgent modifies a file using the `local_edit` or `local_write` tools, the editor reloads automatically via a `file-changed` / `editor-reload` event bridge. This keeps the editor in sync during AI-driven editing sessions.

## Technical Notes

Monaco Editor is loaded via AMD modules (not ESM) for compatibility with WebKitGTK on Linux. A Vite plugin copies the required Monaco assets from `node_modules/monaco-editor/min/vs/` to the build output during development and production builds.

> **Tip:** The editor is part of the AeroTools panel (alongside the Terminal and AeroAgent chat). Resize panels by dragging the dividers between them.
