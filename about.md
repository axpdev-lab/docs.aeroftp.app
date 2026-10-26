---
title: About AeroFTP
description: AeroFTP 4.2.5, its architecture, distribution channels and documentation sources.
---

# About & Credits

## AeroFTP 4.2.5

AeroFTP is a free, open-source desktop file manager built with Rust, Tauri 2, React and TypeScript. This documentation targets **v4.2.5, 26 October 2026**, and is updated with that release.

The desktop app, `aeroftp-cli` and the bundled MCP server share backend components. Available operations still depend on the provider, connection mode and command path: a shared backend does not make every operation or concurrency setting available on every surface.

See [what changed in 4.2.5](/releases/4.2.5), the [protocol overview](/protocols/overview), [provider setup guides](/providers/), [CLI reference](/cli/commands) and [MCP catalog](/mcp/overview).

## Links

| Resource | Link |
| --- | --- |
| Website | [aeroftp.app](https://aeroftp.app) |
| Application source | [axpdev-lab/aeroftp](https://github.com/axpdev-lab/aeroftp) |
| Releases and assets | [GitHub Releases](https://github.com/axpdev-lab/aeroftp/releases) |
| Release history | [CHANGELOG.md](https://github.com/axpdev-lab/aeroftp/blob/main/CHANGELOG.md) |
| Snap Store | [aeroftp](https://snapcraft.io/aeroftp) |
| AUR | [aeroftp-bin](https://aur.archlinux.org/packages/aeroftp-bin) |
| SourceForge mirror | [AeroFTP files](https://sourceforge.net/projects/aeroftp/files/) |
| AeroVault Rust crate | [aerovault](https://crates.io/crates/aerovault) |
| Documentation source | [axpdev-lab/docs.aeroftp.app](https://github.com/axpdev-lab/docs.aeroftp.app) |

## Developer and License

**AXP Development**, [axpnet](https://github.com/axpnet). AeroFTP is released under the **GNU General Public License v3.0**.

The desktop application is free and open source, with no paid tier, license gating or telemetry. The mobile application is in development and has not been released; its distribution and pricing have not been announced.

AI assistance and human review are described in the application's [AI Transparency Statement](https://github.com/axpdev-lab/aeroftp/blob/main/AI-TRANSPARENCY.md).

## Technology Stack

| Layer | Technology |
| --- | --- |
| Backend | Rust and Tauri 2 |
| Frontend | React 18, TypeScript and Tailwind CSS 3 |
| Editor and terminal | Monaco Editor and xterm.js with PTY support |
| Frontend build | Vite 8 |
| CI and distribution | GitHub Actions, GitHub Releases and the Snap Store |
| Desktop packages | Debian, RPM, AppImage, Snap, Windows installers and portable ZIP, macOS DMG |

The source manifests are the dependency reference: [`src-tauri/Cargo.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/Cargo.toml), [`src-tauri/Cargo.lock`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/Cargo.lock), [`package.json`](https://github.com/axpdev-lab/aeroftp/blob/main/package.json) and [`package-lock.json`](https://github.com/axpdev-lab/aeroftp/blob/main/package-lock.json). SSH/SFTP uses russh and russh-sftp, FTP/FTPS uses suppaftp, HTTP APIs use reqwest, and credentials use the encrypted vault and platform keyring integration.

## Features and Boundaries

- **Connections:** native transports and provider APIs coexist with presets and explicit vendor CLI or local-gateway modes. See the [integration matrix](/protocols/overview).
- **AI assistance:** the GUI's AeroAgent, CLI agent and MCP server have separate catalogs and approval behavior. See [AeroAgent](/features/aeroagent), [orchestration](/features/agent-orchestration) and [MCP](/mcp/overview).
- **Encryption:** AeroVault containers, AeroCrypt and rclone crypt overlays serve different purposes. See the [encryption guide](/security/encryption).
- **Languages:** the interface has 47 locales, with English as the reference. This does not imply that every provider's raw error text is translated.

## Security and Evidence

Security claims, accepted limits and dated verification results are recorded in the [security overview](/security/overview), [audit archive](/security/audits) and [test reports](/test-reports/). A report applies to the versions and scenarios it names; a historical result is not a fresh test of 4.2.5.

Report vulnerabilities through the [private disclosure channels](/security/reporting).

## This Documentation

The site uses VitePress and is deployed to GitHub Pages by the [documentation workflow](https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/.github/workflows/deploy.yml). A push to its `main` branch triggers build and deployment. The repository [README](https://github.com/axpdev-lab/docs.aeroftp.app#readme) explains local development and contribution.
