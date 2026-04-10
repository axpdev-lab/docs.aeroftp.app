# Terminal

AeroFTP includes an integrated terminal emulator powered by xterm.js, providing a full PTY (pseudo-terminal) directly within the application.

## Features

- **Full PTY support** - run any shell command, interactive programs, and TUI applications
- **SSH sessions** - connect to remote servers via SSH directly in the terminal tab
- **Copy/paste** - standard terminal clipboard operations
- **Scrollback buffer** - scroll through command history
- **Resizable** - drag the panel divider to adjust terminal height

## Theme Auto-Sync

The terminal theme automatically matches the active application theme:

| App Theme | Terminal Theme |
|-----------|---------------|
| Light | Solarized Light |
| Dark | GitHub Dark |
| Tokyo Night | Tokyo Night |
| Cyber | Cyber (neon green on deep black) |

If you manually set a terminal theme, AeroFTP remembers your override and stops auto-syncing until the override is cleared.

## AeroAgent Integration

AeroAgent can execute shell commands via the `shell_execute` backend tool. Commands run in a Rust `Command` process (not the frontend terminal) with:

- **30-second timeout** per command
- **1 MB output limit** to prevent memory issues
- **Backend denylist** - dangerous commands (e.g., `rm -rf /`, `mkfs`, `dd`) are rejected at the Rust level before execution
- **stdout/stderr/exit_code** captured and returned to the AI

> **Note:** On Linux (WebKitGTK), the terminal requires `allowTransparency: false` for correct rendering. This is set automatically.

## Keyboard Shortcuts

Standard terminal shortcuts apply within the terminal panel. The terminal captures all keyboard input when focused - use **Ctrl+Shift+A** to break out and send a selection to AeroAgent.
