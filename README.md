<p align="center">
  <img src="https://raw.githubusercontent.com/axpnet/docs.aeroftp.app/main/public/logo.svg" alt="AeroFTP" width="96" />
</p>

<h1 align="center">AeroFTP Documentation</h1>

<p align="center">
  <strong>Official documentation for <a href="https://www.aeroftp.app">AeroFTP</a> — the open-source, multi-protocol file manager.</strong>
</p>

<!-- Row 1: Status & Links -->
<p align="center">
  <a href="https://docs.aeroftp.app"><img src="https://img.shields.io/badge/live-docs.aeroftp.app-3b82f6?logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://github.com/axpnet/aeroftp"><img src="https://img.shields.io/badge/app-AeroFTP-8b5cf6?logo=github&logoColor=white" alt="AeroFTP" /></a>
  <a href="https://github.com/axpnet/docs.aeroftp.app/actions"><img src="https://img.shields.io/github/actions/workflow/status/axpnet/docs.aeroftp.app/deploy.yml?label=deploy" alt="Deploy Status" /></a>
  <img src="https://img.shields.io/github/license/axpnet/docs.aeroftp.app" alt="License" />
</p>

<!-- Row 2: Tech Stack -->
<p align="center">
  <img src="https://img.shields.io/badge/VitePress-1.x-646cff?logo=vite&logoColor=white" alt="VitePress" />
  <img src="https://img.shields.io/badge/Vue.js-3-4fc08d?logo=vuedotjs&logoColor=white" alt="Vue.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Markdown-docs-000000?logo=markdown&logoColor=white" alt="Markdown" />
  <img src="https://img.shields.io/badge/GitHub%20Pages-deployed-222?logo=githubpages&logoColor=white" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-2088ff?logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

---

## Live

**[docs.aeroftp.app](https://docs.aeroftp.app)**

## What's Inside

Comprehensive documentation for AeroFTP covering:

- **Getting Started** — Installation on Linux (.deb, .rpm, .AppImage, .snap, AUR), macOS (.dmg), and Windows (.msi)
- **25 Protocols** — FTP, FTPS, SFTP, WebDAV, S3-compatible (10+ presets), Google Drive, Dropbox, OneDrive, MEGA, Box, pCloud, Azure Blob, 4shared, Filen, Zoho WorkDrive, Internxt, kDrive, Koofr, Jottacloud, FileLu, Yandex Disk, OpenDrive, GitHub
- **AeroSync** — Bidirectional sync with profiles, conflict resolution, bandwidth control, scheduler
- **AeroVault** — Military-grade AES-256-GCM-SIV encrypted containers with Argon2id KDF
- **AeroAgent** — AI-powered file management with 47 tools, multi-step autonomous execution, 19 AI providers
- **AeroPlayer** — Integrated media player with 10-band EQ, 14 visualizer modes, 6 WebGL shaders
- **AeroTools** — Security toolkit (Hash Forge, CryptoLab, Password Forge) in Cyber theme
- **AeroFile** — Local file manager with tabs, tags, and Finder-style color labels
- **CLI** — 14 commands, batch scripting (.aeroftp), glob patterns, JSON output, exit codes
- **Security** — Universal Vault (AES-256-GCM + Argon2id), TOTP 2FA, SFTP TOFU, credential isolation for AI agents
- **GitHub Integration** — File browsing, commits, branches, PRs, releases with CHANGELOG import, GitHub Pages monitoring, App co-authoring with dual avatars
- **Advanced** — Provider reference, AI provider marketplace, plugin development

## Stack

Built with [VitePress](https://vitepress.dev) and deployed via GitHub Pages.

| Component | Technology |
|-----------|-----------|
| Framework | VitePress 1.x |
| Theme | Custom dark/light with AeroFTP branding |
| Deployment | GitHub Actions + GitHub Pages |
| Domain | Custom domain via CNAME (docs.aeroftp.app) |
| Search | VitePress built-in local search |

## Local Development

```bash
npm install
npm run docs:dev
```

The dev server starts at `http://localhost:5173`.

## Build

```bash
npm run docs:build
npm run docs:preview
```

## Structure

```
docs.aeroftp.app/
├── getting-started/    # Installation & quick start guides
├── features/           # AeroSync, AeroVault, AeroAgent, AeroPlayer, etc.
├── cli/                # CLI installation, commands, batch scripting, examples
├── advanced/           # Provider reference, AI providers, plugins
├── contributing/       # Build instructions & architecture
├── security/           # Encryption, credentials, TOTP (redirects to main repo)
├── public/             # Static assets (logos, icons, screenshots)
├── .vitepress/         # VitePress config, sidebar, custom theme
└── .github/workflows/  # GitHub Actions deploy pipeline
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (VitePress markdown)
4. Run `npm run docs:dev` to preview locally
5. Submit a Pull Request

Documentation changes are automatically deployed to [docs.aeroftp.app](https://docs.aeroftp.app) when merged to `main`.

## License

GPL-3.0 - see the main [AeroFTP repository](https://github.com/axpnet/aeroftp) for details.
