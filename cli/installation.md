# CLI Installation

The `aeroftp-cli` command-line interface is a standalone Rust binary built from the same codebase as the AeroFTP desktop application. It provides full scriptable access to AeroFTP's three integration tiers without opening its graphical interface. Browser sign-in and OS-specific integrations have their own requirements:

- **Core transport protocols**: FTP, FTPS, SFTP, WebDAV, S3, Azure Blob
- **20+ native provider integrations**: Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, Filen, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud, FileLu, Yandex Disk, OpenDrive, 4shared, Drime Cloud, GitHub, GitLab, Immich, and more
- **40+ pre-configured presets**: AWS S3, Backblaze B2, Cloudflare R2, Wasabi, Storj, MinIO, Hetzner Storage Box, Nextcloud, Seafile, InfiniCLOUD, Jianguoyun, CloudMe, SourceForge, etc.

URL-based connections are available for the transport protocols and direct-auth native providers. OAuth-based providers (Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Yandex Disk, 4shared, Drime) are accessed via vault `--profile` after GUI or supported headless authorization. See [profile setup](/cli/commands#profile-add-and-headless-authorization).

## Included with Every Desktop Package

The CLI binary ships inside every AeroFTP desktop package, and since v4.0.8 inside the Windows portable ZIP as well. No separate installation step is required. After installing the desktop app (or extracting the portable ZIP), the binary is available at the following paths:

| Package Format | Binary Path | In PATH |
|----------------|-------------|---------|
| Linux `.deb` | `/usr/bin/aeroftp-cli` | Yes |
| Linux `.rpm` | `/usr/bin/aeroftp-cli` | Yes |
| Linux `.snap` | `/snap/bin/aeroftp` dispatcher, or `snap run aeroftp` | Yes, when `/snap/bin` is on PATH |
| Linux `.AppImage` | Bundled inside the AppImage | No |
| Windows `.msi` | `C:\Program Files\AeroFTP\aeroftp-cli.exe` | Depends on installer options |
| Windows `.exe` (NSIS) | `C:\Program Files\AeroFTP\aeroftp-cli.exe` | Depends on installer options |
| Windows `.zip` (portable) | `aeroftp-cli.exe` next to `AeroFTP.exe` in the extracted folder | No (run `.\aeroftp-cli.exe`) |
| macOS `.dmg` | `/Applications/AeroFTP.app/Contents/MacOS/aeroftp-cli` | No |

> **Windows portable ZIP (since v4.0.8):** the `AeroFTP-<version>-portable-windows-x64.zip` build bundles `aeroftp-cli.exe` (and the `aeroftp-dispatch.exe` shim that powers the `aftp` / `aero` names) next to `AeroFTP.exe`. It is not added to `PATH`: run it as `.\aeroftp-cli.exe` from the extracted folder, or add that folder to your `PATH`. The portable CLI shares the portable `data\` folder with the GUI, so the servers and vault you set up in the app are visible to the CLI and vice versa.

The CLI command is `aeroftp-cli`. Linux `.deb` and `.rpm` packages install a dispatcher at `/usr/bin/aeroftp`, with `aeroftp-cli` and `aftp` entry points; the actual CLI payload lives in `/usr/lib/aeroftp/aeroftp-cli`. The dispatcher starts the desktop app without a CLI subcommand and routes recognized commands to the CLI. Snap exposes this dispatcher as `aeroftp`: use `aeroftp ls --profile "My Server" / --json`, or `snap run aeroftp ls --profile "My Server" / --json` if `/snap/bin` is not on PATH. The internal Snap `aeroftp-cli` symlink does not create a separate host command.

```bash
aeroftp --version
aeroftp-cli --version
```

For package formats where the binary is not in PATH (AppImage, macOS `.dmg`), create a symlink manually:

```bash
# macOS
sudo ln -s /Applications/AeroFTP.app/Contents/MacOS/aeroftp-cli /usr/local/bin/aeroftp

# AppImage - extract first, then symlink
./AeroFTP-x86_64.AppImage --appimage-extract
sudo ln -s "$(pwd)/squashfs-root/usr/lib/aeroftp/aeroftp-cli" /usr/local/bin/aeroftp
```

## Shorter Command Names: `aftp` and the `aero` Alias

Typing `aeroftp-cli` in full gets tedious for interactive use. Two shorter names are available, and both run exactly the same binary.

### `aftp` (built-in on Linux)

`aftp` is a four-character name for the CLI. On `.deb` and `.rpm` packages it is installed automatically alongside `aeroftp`. On Snap, use the exposed `aeroftp` command or configure a Snap alias for `aftp`. On Windows and macOS, use the installed entry point or configure an alias when the command is not on `PATH`. Anything that works under `aeroftp-cli` works under `aftp`:

```bash
aftp ls sftp://user@host/
aftp sync sftp://user@host ./local /backup --direction upload
```

### `aero` (opt-in alias)

`aero` is provided as an opt-in alias you enable with a single command. It is deliberately not shipped as a global binary, because a package owning `/usr/bin/aero` would fail to install on any system where another package already owns that path (a file conflict at the package-manager level).

`alias-toggle` works on Linux and macOS through a symlink, and on Windows through a managed `.cmd` shim.

The same command both enables and disables the alias (toggle):

```bash
# Enable: creates ~/.local/bin/aero -> dispatcher
aeroftp-cli alias-toggle aero
# The 'aero' alias is now On

# Run it again to disable
aeroftp-cli alias-toggle aero
# The 'aero' alias is now Off
```

The command exits 0 after either successful transition; running it again reverses the state. Unix defaults to `~/.local/bin`; Windows uses its per-user command directory. Pass `--bin-dir <path>` to override. If the target directory is not on your `PATH`, a one-line note on stderr explains how to add it.

The toggle refuses to replace files or aliases it does not recognize as its own. This protects user-owned files and foreign installations.

For scripting, use `--json`:

```bash
aeroftp-cli --json alias-toggle aero
# {"alias":"aero","path":".../aero","path_in_env":false,"state":"on"}
```

Once enabled, anything that works under `aeroftp-cli` works under `aero`: `aero ls`, `aero sync`, `aero vault`, `aero mcp`, and so on.

### Manual alias (alternative)

If you prefer to wire the alias yourself, the snippets below are equivalent to the toggle command. They do not need root and they do not touch the package layout.

| Shell | File | Line |
|-------|------|------|
| bash | `~/.bashrc` | `alias aero='aeroftp-cli'` |
| zsh | `~/.zshrc` | `alias aero='aeroftp-cli'` |
| fish | `~/.config/fish/config.fish` | `alias aero 'aeroftp-cli'` then `funcsave aero` |
| PowerShell | `$PROFILE` | `Set-Alias -Name aero -Value aeroftp-cli` |

After editing the file, reopen the shell or `source` it, then verify with `aero --version`.

The shorter names (`aftp`, `aero`) were added at the community's request in [discussion #273](https://github.com/axpdev-lab/aeroftp/discussions/273).

## Verify Installation

After installing, confirm the CLI is working:

```bash
aeroftp-cli --version
# Output: aeroftp X.Y.Z

aeroftp-cli --help
# Output: full command listing with descriptions
```

The `--help` flag works on every subcommand:

```bash
aeroftp-cli ls --help
aeroftp-cli sync --help
aeroftp-cli batch --help
```

## Build from Source

### Prerequisites

- **Rust toolchain** pinned by the repository (currently 1.97.1; the manifest minimum is 1.93) (install via [rustup.rs](https://rustup.rs))
- **System libraries** (Linux only):
  - `libssl-dev` (or `openssl-devel` on Fedora/RHEL)
  - `pkg-config`

### Build Commands

```bash
git clone https://github.com/axpdev-lab/aeroftp.git
cd aeroftp/src-tauri
cargo build --release --bin aeroftp-cli
```

The compiled binary will be at `target/release/aeroftp-cli` (or `target\release\aeroftp-cli.exe` on Windows). Copy it to a directory in your PATH:

```bash
sudo cp target/release/aeroftp-cli /usr/local/bin/aeroftp-cli
```

### Build Only the CLI (Skip Desktop App)

The CLI is a separate `[[bin]]` target, so this command does not build the desktop executable. It still builds the shared library and its dependency graph, including Tauri and platform libraries. Follow the repository's [contribution prerequisites](https://github.com/axpdev-lab/aeroftp/blob/main/CONTRIBUTING.md) for a source build.

## Color, TTY, and Pipe Behavior

The CLI automatically adapts its output based on the terminal environment:

| Condition | Colors | Progress Bars | Summary Lines |
|-----------|--------|---------------|---------------|
| Interactive TTY | Enabled | Enabled | stdout |
| Piped to file/program | Disabled | Hidden | stderr |
| `NO_COLOR=1` env var | Disabled | Hidden | stderr |
| `CLICOLOR=0` env var | Disabled | Hidden | stderr |
| `--no-color` flag | Disabled | Hidden | stderr |

### NO_COLOR Standard

AeroFTP follows the [no-color.org](https://no-color.org) convention. Setting the `NO_COLOR` environment variable (to any value) disables all ANSI color codes and progress bar rendering:

```bash
# Disable colors globally
export NO_COLOR=1
aeroftp-cli ls sftp://user@host/

# Or per-command
NO_COLOR=1 aeroftp-cli ls sftp://user@host/
```

The `CLICOLOR` variable is also respected. When `CLICOLOR=0`, colors are suppressed.

### Progress Bar Behavior

File transfer progress bars (powered by the `indicatif` crate) are shown only when:
1. stdout is connected to a TTY
2. Colors are not disabled

In CI/CD environments or when piping output, use `--json` for machine-readable progress instead.

## SIGPIPE Handling

On Unix systems, the CLI installs a `SIGPIPE` handler at startup via `libc::signal(SIGPIPE, SIG_DFL)`. This ensures proper pipe compliance - if you pipe output to a program that closes early (e.g., `head`), the CLI terminates cleanly instead of printing a broken pipe error:

```bash
# Works correctly - CLI exits when head has enough lines
aeroftp-cli ls sftp://user@host/ --json | head -5
```

This follows POSIX convention and matches the behavior of standard Unix tools like `ls`, `cat`, and `find`.

## Exit Codes

The CLI uses semantic exit codes for scripting:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Connection / network error |
| 2 | File / directory not found |
| 3 | Permission denied |
| 4 | Transfer failed or partial |
| 5 | Configuration / usage error |
| 6 | Authentication failure |
| 7 | Operation not supported by protocol |
| 8 | Timeout or transfer-budget stop, with command-specific outcomes. A SITE reply timeout may follow an applied mutation: verify before retrying. Sync budget stops use `--max-transfer` (JSON `over_budget` counts skipped files; an exact-budget stop can return 8 with no such field, so inspect the configured limits) |
| 9 | Already exists / directory not empty (`--immutable`, `--no-clobber`) |
| 10 | Server error / parse error |
| 11 | I/O error |
| 99 | Unknown error |
| 130 | Interrupted (Ctrl+C) |

```bash
aeroftp-cli connect sftp://user@host
echo $?  # 0 if successful, 1 if unreachable, 6 if auth failed
```

## Double Ctrl+C

The first `Ctrl+C` sends a graceful cancellation signal, allowing in-progress transfers to clean up. A second `Ctrl+C` within 2 seconds forces immediate exit with code 130. This prevents the CLI from hanging if a server is unresponsive during shutdown.
