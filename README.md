<p align="center">
  <a href="https://docs.aeroftp.app"><img src="https://raw.githubusercontent.com/axpdev-lab/docs.aeroftp.app/main/public/logo.svg" alt="AeroFTP" width="96" /></a>
</p>

<h1 align="center">AeroFTP Documentation</h1>

<p align="center">
  Setup guides, feature documentation, technical references and measured test reports for <a href="https://github.com/axpdev-lab/aeroftp">AeroFTP</a>, the open-source desktop file manager with a CLI and MCP server.
</p>

<p align="center">
  <a href="https://docs.aeroftp.app"><img src="https://img.shields.io/badge/read-docs.aeroftp.app-3b82f6" alt="Read the documentation" /></a>
  <a href="https://github.com/axpdev-lab/docs.aeroftp.app/actions/workflows/deploy.yml"><img src="https://github.com/axpdev-lab/docs.aeroftp.app/actions/workflows/deploy.yml/badge.svg" alt="Documentation deployment" /></a>
  <a href="https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/LICENSE"><img src="https://img.shields.io/github/license/axpdev-lab/docs.aeroftp.app" alt="License" /></a>
</p>

## Read the Documentation

The published site is **[docs.aeroftp.app](https://docs.aeroftp.app)**. This repository contains its Markdown pages, Vue components, theme and static assets. AeroFTP's application source and releases live in [axpdev-lab/aeroftp](https://github.com/axpdev-lab/aeroftp).

| Section | What you will find |
| ------- | ------------------ |
| [Getting started](./getting-started/installation.md) | Installation on Linux, Windows and macOS; first connection and interface guide |
| [Protocols](./protocols/overview.md) | FTP/FTPS, SFTP, WebDAV, S3-compatible storage, Azure Blob, Backblaze B2 and checksum behavior |
| [Provider setup guides](./providers/index.md) | Cloud sign-in, endpoints, native clients, local gateways, plan snapshots and provider-specific limits |
| [Proton Drive](./providers/proton-drive.md) | Native API sign-in and encrypted sessions, optional official CLI mode, bulk transfers and headless use |
| [Features](./features/index.md) | AeroCloud, AeroSync, AeroRsync, delta transfers, mounts, AeroFile, AeroPlayer, archives and file tools |
| [Encryption](./security/encryption.md) | AeroVault, AeroCrypt, credential storage, wrapper stacks and error correction |
| [AeroAgent](./features/aeroagent.md) | Built-in AI file operations, approval behavior and agent orchestration |
| [CLI](./cli/installation.md) | Installation, saved profiles, commands, scripting, machine output and exit codes |
| [MCP](./mcp/overview.md) | Connecting AI tools to AeroFTP through the bundled MCP server |
| [Profile bridges](./features/rclone.md) | rclone import/export and native Proton sessions; also [WinSCP](./features/winscp.md), [FileZilla](./features/filezilla.md) and [rclone crypt](./features/rclone-crypt.md) |
| [Architecture](./architecture/dag-transfer-engine.md) | Transfer DAG, scheduling, resource limits and the fixed-pipe model |
| [Security](./security/overview.md) | Privacy, audits, supply chain, AI boundaries, TOTP and vulnerability reporting |
| [Test reports](./test-reports/index.md) | Provider matrices, Docker integration tests, comparative benchmarks and community results |
| [Advanced reference](./advanced/provider-reference.md) | Provider details, AI providers, plugins, hosting integration and the AeroVault Rust crate |

Provider counts, command inventories and benchmark results evolve with the application. Consult the relevant reference or dated report for its version, scope and limitations.

The current documentation targets **AeroFTP 4.2.5**. The [release overview](./releases/4.2.5.md) links the updated guides; historical reports retain their original tested versions and dates.

## Develop Locally

Use Node.js **24**, matching the deployment workflow, and npm. From this repository:

```bash
npm ci
npm run docs:dev
```

VitePress prints the local development address, normally `http://localhost:5173`.

Build the static site and preview the result:

```bash
npm run docs:build
npm run docs:preview
```

The output is written to `.vitepress/dist/`. Dependencies, build output, the VitePress cache and `_dev/` scratch files are ignored by Git.

## Repository Layout

```text
docs.aeroftp.app/
├── getting-started/      Installation, quick start and interface
├── protocols/           Transport and storage references
├── providers/           Provider setup guides
├── features/            Built-in apps, sync, agents and bridges
├── cli/                 CLI reference, examples and scripting
├── mcp/                 MCP setup and tool reference
├── architecture/        Transfer-engine architecture
├── security/            Security, privacy and audit documentation
├── advanced/            Provider, plugin and integration references
├── test-reports/        Dated tests, matrices and comparisons
├── contributing/        Application build and architecture guides
├── tools/               Test harnesses and supporting scripts
├── public/              Images, icons and downloadable evidence
├── .vitepress/          Site config, sidebar, Vue components and theme data
└── .github/workflows/    Build and GitHub Pages deployment
```

Navigation is defined in [`.vitepress/config.ts`](https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/.vitepress/config.ts). Provider plan cards share data from [`providerPlans.ts`](https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/.vitepress/theme/data/providerPlans.ts). The feature overview reads its groups from the sidebar and its descriptions from page frontmatter.

## Contribute

1. Create a branch, or fork the repository for an external contribution.
2. Edit the relevant page and update shared data or navigation when needed.
3. Run `npm run docs:build`, preview the affected pages and check their links.
4. Open a pull request describing the change and how it was verified.

For benchmark contributions, include the tested versions, commands, payload, all counted runs and integrity checks. See the [test methodology](./test-reports/methodology.md). Report application bugs and feature requests in the [AeroFTP repository](https://github.com/axpdev-lab/aeroftp/issues); documentation corrections belong [here](https://github.com/axpdev-lab/docs.aeroftp.app/issues).

## Deployment

The [Deploy Documentation workflow](https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/.github/workflows/deploy.yml) installs dependencies with `npm ci`, builds with VitePress and deploys `.vitepress/dist/` to GitHub Pages at **docs.aeroftp.app**. It runs on pushes to `main` and can also be started manually through GitHub Actions. Merging a documentation PR into `main` triggers publication.

## License

[GNU General Public License v3.0](https://github.com/axpdev-lab/docs.aeroftp.app/blob/main/LICENSE).
