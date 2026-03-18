# CLI Installation

The `aeroftp-cli` binary is a standalone command-line interface built from the same Rust codebase as the desktop application. It provides scriptable access to all 22 protocols without requiring a graphical environment.

## Included with Desktop App

The CLI binary ships inside every AeroFTP desktop package. After installing the desktop app, `aeroftp-cli` is available at:

| Platform | Path |
|----------|------|
| Linux (.deb/.rpm) | `/usr/bin/aeroftp-cli` |
| Linux (AppImage) | Bundled inside the AppImage (not in PATH by default) |
| Linux (Snap) | `/snap/aeroftp/current/usr/bin/aeroftp-cli` |
| Windows (.msi) | `C:\Program Files\AeroFTP\aeroftp-cli.exe` |
| macOS (.dmg) | `/Applications/AeroFTP.app/Contents/MacOS/aeroftp-cli` |

> **Tip:** On Linux .deb and .rpm installs, the binary is already in your PATH. For other package formats, you may need to create a symlink or add the directory to your PATH.

## Build from Source

If you prefer to build the CLI independently:

```bash
git clone https://github.com/axpnet/aeroftp.git
cd aeroftp/src-tauri
cargo build --release --bin aeroftp-cli
```

The compiled binary will be at `target/release/aeroftp-cli`.

## Verify Installation

```bash
aeroftp-cli --version
aeroftp-cli --help
```

## Color and TTY Behavior

The CLI automatically detects whether it is running in an interactive terminal:

- **TTY detected** — colored output and progress bars are enabled by default.
- **Piped output** — colors and progress bars are automatically disabled.
- **`NO_COLOR` env var** — set `NO_COLOR=1` to force plain output in any context. This follows the [no-color.org](https://no-color.org) standard.
- **`--no-color` flag** — equivalent to `NO_COLOR=1` for a single invocation.

```bash
# Force plain output
NO_COLOR=1 aeroftp-cli ls sftp://user@host/

# Or per-command
aeroftp-cli ls sftp://user@host/ --no-color
```

> **Note:** When colors are disabled, progress bars for file transfers are also hidden. Use `--json` output for machine-readable progress in scripts.
