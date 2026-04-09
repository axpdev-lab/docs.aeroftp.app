# About & Credits

## AeroFTP

AeroFTP is a free, open-source, multi-protocol file manager built with Rust and React. It connects to 27 protocols from a single desktop application, with built-in encryption, AI assistance, and a production CLI.

**Current version**: v3.4.7

## Links

| Resource | URL |
|----------|-----|
| **Website** | [www.aeroftp.app](https://www.aeroftp.app) |
| **GitHub Repository** | [github.com/axpnet/aeroftp](https://github.com/axpnet/aeroftp) |
| **GitHub Releases** | [github.com/axpnet/aeroftp/releases](https://github.com/axpnet/aeroftp/releases) |
| **Changelog** | [CHANGELOG.md](https://github.com/axpnet/aeroftp/blob/main/CHANGELOG.md) |
| **Snap Store** | [snapcraft.io/aeroftp](https://snapcraft.io/aeroftp) |
| **AUR** | [aur.archlinux.org/packages/aeroftp-bin](https://aur.archlinux.org/packages/aeroftp-bin) |
| **GitHub App** | [github.com/apps/aeroftp](https://github.com/apps/aeroftp) |
| **AeroVault Crate** | [crates.io/crates/aerovault](https://crates.io/crates/aerovault) |
| **Documentation** | [docs.aeroftp.app](https://docs.aeroftp.app) |

## Developer

**AXP Development** — [github.com/axpnet](https://github.com/axpnet)

## License

AeroFTP is released under the **GNU General Public License v3.0** (GPL-3.0).

- **Desktop app**: 100% free and open-source. No Pro tier, no license gating, no nag banners, no telemetry.
- **Mobile app**: Paid on Google Play Store. No ads, no subscriptions, no in-app purchases.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Rust (Tauri 2) |
| **Frontend** | React 18 + TypeScript + Tailwind CSS |
| **Code Editor** | Monaco Editor (VS Code engine) |
| **Terminal** | xterm.js with PTY |
| **Build** | Vite 6 |
| **CI/CD** | GitHub Actions |
| **Packages** | .deb, .rpm, .AppImage, .snap, .msi, .exe, .dmg |

## Key Rust Dependencies

| Crate | Purpose |
|-------|---------|
| `russh` 0.57 | SSH/SFTP protocol |
| `suppaftp` 8 | FTP/FTPS with TLS, MLSD/MLST |
| `reqwest` 0.13 | HTTP client for cloud APIs |
| `quick-xml` 0.39 | WebDAV/Azure XML parsing |
| `keyring` 3 | OS Keyring integration |
| `oauth2` 5 | OAuth2 PKCE flows |
| `aes-gcm-siv` 0.11 | AeroVault v2 content encryption (RFC 8452) |
| `argon2` | Key derivation (RFC 9106) |
| `chacha20poly1305` 0.10 | AeroVault cascade mode (RFC 8439) |
| `aes-siv` 0.7 | Filename encryption (RFC 5297) |
| `aes-kw` 0.2 | Key wrapping (RFC 3394) |
| `blake3` | BLAKE3 hashing in AeroTools |
| `similar` 2 | Unified diff for AeroAgent |
| `zip` 7 | ZIP archive support |
| `globset` | CLI glob pattern matching |
| `indicatif` | CLI progress bars |
| `clap` | CLI argument parsing |
| `ed25519-dalek` | License signature verification |
| `tokio-util` 0.7 | Streaming I/O |

## Security Audits

AeroFTP has been continuously reviewed by independent AI auditors throughout its development:

- **12-auditor security audit** (v2.4.0) — Grade: A-
- **5-auditor CLI security audit** (v2.9.2) — 97 findings, all resolved
- **Dual-engine audit** (v2.9.5) — Claude Opus 4.6 + GPT-5.4, 117 findings
- **GitHub provider audit** (v3.0.0) — Claude Opus 4.6 + GPT-5.4, all critical resolved

## Protocols (25)

1. FTP
2. FTPS
3. SFTP
4. WebDAV
5. S3-Compatible
6. Google Drive
7. Dropbox
8. OneDrive
9. MEGA
10. Box
11. pCloud
12. Azure Blob Storage
13. 4shared
14. Filen
15. Zoho WorkDrive
16. Internxt Drive
17. kDrive
18. Koofr
19. FileLu
20. Yandex Disk
21. OpenDrive
22. Jottacloud
23. GitHub
24. FeliCloud
25. Drime Cloud

## AI Providers (19)

OpenAI, Anthropic, Google Gemini, xAI (Grok), OpenRouter, Ollama, Kimi (Moonshot), Qwen (Alibaba), DeepSeek, Mistral, Groq, Perplexity, Cohere, Together AI, AI21 Labs, Cerebras, SambaNova, Fireworks AI, Custom.

## Internationalization

47 languages at 100% coverage. English is the reference locale. Technical terms (FTP, SFTP, OAuth, AeroSync, AeroVault, AeroAgent, AeroPlayer, AeroTools) are never translated.

## This Documentation

This documentation site is built with [VitePress](https://vitepress.dev) and deployed automatically via GitHub Actions to GitHub Pages.

- **Source**: [github.com/axpnet/docs.aeroftp.app](https://github.com/axpnet/docs.aeroftp.app)
- **Domain**: [docs.aeroftp.app](https://docs.aeroftp.app)
- **Deploy**: Push to `main` triggers build and deploy (~20 seconds)

---

*AeroFTP — [github.com/axpnet/aeroftp](https://github.com/axpnet/aeroftp) — GPL-3.0*
