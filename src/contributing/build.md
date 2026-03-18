# Building from Source

AeroFTP is a Tauri 2 application with a Rust backend and React frontend. Both must be built together for a complete application, but can be developed independently.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Rust | 1.75+ (stable) | Backend compilation |
| Node.js | 18+ | Frontend tooling |
| npm | 9+ | Package management |

### Linux Dependencies

Ubuntu/Debian:

```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

Fedora:

```bash
sudo dnf install webkit2gtk4.1-devel gtk3-devel libayatana-appindicator-gtk3-devel librsvg2-devel
```

Arch Linux:

```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libayatana-appindicator librsvg
```

### Windows

No additional system dependencies are required. Rust and Node.js are sufficient.

### macOS

Install Xcode Command Line Tools:

```bash
xcode-select --install
```

## Clone and Install

```bash
git clone https://github.com/axpnet/aeroftp.git
cd aeroftp
npm install
```

## Development

Run the full application in development mode (hot-reload for frontend, auto-rebuild for Rust):

```bash
npm run tauri dev
```

Frontend only (no Rust backend, opens in browser):

```bash
npm run dev
```

Rust backend check (no full build):

```bash
cd src-tauri && cargo check
```

## Production Build

```bash
npm run tauri build
```

This produces platform-specific packages in `src-tauri/target/release/bundle/`:

| Platform | Artifacts |
|----------|-----------|
| Linux | `.deb`, `.rpm`, `.AppImage` |
| Windows | `.msi`, `.exe` |
| macOS | `.dmg` |

## CLI Binary Only

To build just the CLI without the desktop application:

```bash
cd src-tauri
cargo build --release --bin aeroftp-cli
```

The binary will be at `src-tauri/target/release/aeroftp-cli`.

## Linting

Always run Clippy before pushing changes. This is the same check CI runs:

```bash
cd src-tauri && cargo clippy --all-targets -- -D warnings
```

Frontend type checking:

```bash
npm run build
```

## i18n Validation

After modifying translation keys, verify all 47 languages are complete:

```bash
npm run i18n:validate
```

To propagate new keys from `en.json` to all other locales:

```bash
npm run i18n:sync
```

> **Important:** Always run `cargo clippy` before pushing. The CI pipeline enforces `-D warnings` (warnings as errors) and will reject non-compliant code.
