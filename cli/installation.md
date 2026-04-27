# CLI Installation

The `aeroftp-cli` command-line interface is a standalone Rust binary built from the same codebase as the AeroFTP desktop application. It provides full scriptable access to AeroFTP's three integration tiers without requiring a graphical environment:

- **7 transport protocols**: FTP, FTPS, SFTP, WebDAV, S3, Azure Blob, OpenStack Swift
- **20+ native provider integrations**: Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, Filen, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud, FileLu, Yandex Disk, OpenDrive, 4shared, Drime Cloud, GitHub, GitLab, Immich, and more
- **40+ pre-configured presets**: AWS S3, Backblaze B2, Cloudflare R2, Wasabi, Storj, MinIO, Hetzner Storage Box, Nextcloud, Seafile, InfiniCLOUD, Jianguoyun, CloudMe, SourceForge, etc.

URL-based connections are available for the transport protocols and direct-auth native providers. OAuth-based providers (Google Drive, Dropbox, OneDrive, Box, pCloud, Zoho WorkDrive, Yandex Disk, 4shared, Drime) are accessed via vault `--profile` after initial GUI authorization.

## Included with Every Desktop Package

The CLI binary ships inside every AeroFTP desktop package. No separate installation step is required. After installing the desktop app, the binary is available at the following paths:

| Package Format | Binary Path | In PATH |
|----------------|-------------|---------|
| Linux `.deb` | `/usr/bin/aeroftp-cli` | Yes |
| Linux `.rpm` | `/usr/bin/aeroftp-cli` | Yes |
| Linux `.snap` | `/snap/aeroftp/current/usr/bin/aeroftp-cli` | Yes (via snap alias) |
| Linux `.AppImage` | Bundled inside the AppImage | No |
| Windows `.msi` | `C:\Program Files\AeroFTP\aeroftp-cli.exe` | Depends on installer options |
| Windows `.exe` (NSIS) | `C:\Program Files\AeroFTP\aeroftp-cli.exe` | Depends on installer options |
| macOS `.dmg` | `/Applications/AeroFTP.app/Contents/MacOS/aeroftp-cli` | No |

The binary name is `aeroftp-cli`. On `.deb` and `.rpm` installs, a symlink `aeroftp` pointing to `aeroftp-cli` is created in `/usr/bin/`, so both names work interchangeably:

```bash
# Both are equivalent on .deb/.rpm installs
aeroftp-cli --version
aeroftp-cli --version
```

For package formats where the binary is not in PATH (AppImage, macOS `.dmg`), create a symlink manually:

```bash
# macOS
sudo ln -s /Applications/AeroFTP.app/Contents/MacOS/aeroftp-cli /usr/local/bin/aeroftp

# AppImage - extract first, then symlink
./AeroFTP-x86_64.AppImage --appimage-extract
sudo ln -s "$(pwd)/squashfs-root/usr/bin/aeroftp-cli" /usr/local/bin/aeroftp
```

## Verify Installation

After installing, confirm the CLI is working:

```bash
aeroftp-cli --version
# Output: aeroftp 3.6.6

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

- **Rust toolchain** 1.75 or later (install via [rustup.rs](https://rustup.rs))
- **System libraries** (Linux only):
  - `libssl-dev` (or `openssl-devel` on Fedora/RHEL)
  - `pkg-config`

### Build Commands

```bash
git clone https://github.com/axpnet/aeroftp.git
cd aeroftp/src-tauri
cargo build --release --bin aeroftp-cli
```

The compiled binary will be at `target/release/aeroftp-cli` (or `target\release\aeroftp-cli.exe` on Windows). Copy it to a directory in your PATH:

```bash
sudo cp target/release/aeroftp-cli /usr/local/bin/aeroftp
```

### Build Only the CLI (Skip Desktop App)

The CLI is defined as a separate `[[bin]]` target in `Cargo.toml`. The `cargo build --bin aeroftp-cli` command compiles only the CLI binary and its dependencies, without pulling in Tauri or any GUI-related crates.

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
| 4 | Transfer failed |
| 5 | Configuration / usage error |
| 6 | Authentication failure |
| 7 | Operation not supported by protocol |
| 8 | Timeout |
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
