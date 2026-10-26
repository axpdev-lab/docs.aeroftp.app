# Building from Source

AeroFTP is a Tauri 2 application with a Rust backend and React frontend. Both must be built together for a complete application, but can be developed independently.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Rust | 1.97.1 (repository toolchain) | Backend compilation, Clippy and rustfmt; manifest MSRV 1.93 |
| Node.js | 24 (CI baseline) | Frontend tooling |
| npm | 9+ | Package management |

### Linux Dependencies

Ubuntu/Debian:

```bash
sudo apt install build-essential pkg-config libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libssl-dev libfuse3-dev libacl1-dev patchelf
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

Install Microsoft C++ Build Tools with the Windows SDK and the MSVC toolchain, plus Microsoft Edge WebView2 Runtime. Rust and Node.js alone do not supply the native Windows build dependencies.

### macOS

Install Xcode Command Line Tools:

```bash
xcode-select --install
```

## Clone and Install

```bash
git clone https://github.com/axpdev-lab/aeroftp.git
cd aeroftp
npm ci
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

Run focused checks for the code you change. Required GitHub Actions CI is the authoritative full gate for a feature/fix PR. Clippy can be run locally when relevant:

```bash
cd src-tauri && cargo clippy --all-targets -- -D warnings
```

Frontend type checking:

```bash
npm run typecheck
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

> CI enforces warnings as errors. Direct pushes without checked PR CI, release work and documented CI gaps require the project's full applicable gate; see the repository's CONTRIBUTING.md.
