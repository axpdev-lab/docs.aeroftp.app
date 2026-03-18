<p align="center">
  <img src="public/logo.svg" alt="AeroFTP" width="96" />
</p>

<h1 align="center">AeroFTP Documentation</h1>

<p align="center">
  <strong>Official documentation for <a href="https://www.aeroftp.app">AeroFTP</a> — the open-source, multi-protocol file manager.</strong>
</p>

<p align="center">
  <a href="https://docs.aeroftp.app"><img src="https://img.shields.io/badge/docs-docs.aeroftp.app-3b82f6?style=for-the-badge&logo=readthedocs&logoColor=white" alt="Documentation" /></a>
  <a href="https://github.com/axpnet/aeroftp"><img src="https://img.shields.io/badge/app-AeroFTP-8b5cf6?style=for-the-badge&logo=github&logoColor=white" alt="AeroFTP" /></a>
  <a href="https://github.com/axpnet/docs.aeroftp.app/actions"><img src="https://img.shields.io/github/actions/workflow/status/axpnet/docs.aeroftp.app/deploy.yml?style=for-the-badge&label=deploy" alt="Deploy Status" /></a>
</p>

---

## 🌐 Live

**[docs.aeroftp.app](https://docs.aeroftp.app)**

## Stack

Built with [VitePress](https://vitepress.dev) and deployed via GitHub Pages.

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
├── getting-started/   # Installation & quick start guides
├── protocols/         # All 23 supported protocols
├── features/          # AeroSync, AeroVault, AeroAgent, etc.
├── cli/               # CLI installation, commands & scripting
├── security/          # Encryption, credentials, TOTP
├── contributing/      # Build instructions & architecture
├── public/            # Static assets (logos, icons, images)
└── .vitepress/        # VitePress config & custom theme
```

## License

GPL-3.0 — see the main [AeroFTP repository](https://github.com/axpnet/aeroftp) for details.
