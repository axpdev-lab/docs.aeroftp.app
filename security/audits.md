# Security Audits

This page is the historical archive. A row here is what was recorded for that version. It is not a scan of AeroFTP 4.2.6, and the newest row is not the current state of `main`.

The advisory list to read today is [`src-tauri/.cargo/audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/.cargo/audit.toml) on `main`. The count of 33 IDs below was read at `aa0e477`. How that list is checked, and why the committed HTML report is a June 2026 snapshot, is [Continuous Audit](./continuous-audit.md). Pull-request review by CodeRabbit and Greptile is part of [Supply chain](./supply-chain), not an entry in the table below.

## Audit History

| Version | Date | Auditors | Scope | Findings | Grade |
| ------- | ---- | -------- | ----- | -------- | ----- |
| v4.0.7 | 21 June 2026 | Self-hosted report committed on `main` | `cargo audit`, `npm audit`, `osv-scanner` | 0 open / 28 suppressed in that HTML file. The ignore list on `main` at `aa0e477` has 33 IDs and was not re-counted for this row | Snapshot |
| v3.7.5 | May 2026 | Self-hosted pipeline (cargo audit + npm audit + osv-scanner) | Vulnerability scan against RustSec, npm registry, OSV with the suppression list of that month | 0 open / 25 suppressed, as written in May. GHSA-7gmj-67g7-phm9 is ignored again on current `main` | Snapshot |
| v3.1.7 | March 2026 | GPT 5.4 + Claude Opus 4.6 | Desktop security (updater, plugin registry, AI approval, vault) | 4 findings (2 High, 2 Medium), all remediated | - |
| v2.9.5 | 2026 | Claude Opus 4.6 + GPT 5.4 | Dual-engine 8-area audit | 117 findings (103 + 14), 9 cross-engine convergences, all P0-P2 remediated | A- |
| v2.8.9 | 2026 | GPT 5.4 | Residual audit closure | 6 of 11 partial findings resolved (34/39 fixed, 5 partial, 0 open) | A- |
| v2.8.7 | 2026 | Claude Opus 4.6 + GPT 5.4 | Cross-audit, 8 areas | 45+ findings resolved | A- |
| v2.4.0 | 2026 | 12 auditors, 4 phases | Provider integration (19 providers) | Streaming OOM fix, SecretString for all providers, TLS downgrade detection | A- |
| v2.3.0 | 2025 | 5 auditors (4x Claude Opus + GPT 5.3) | Chat history SQLite, FTS, retention | 55+ findings: SQL injection, XSS in FTS, WAL hardening | - |
| v2.2.4 | 2025 | 5 auditors (4x Claude Opus + GPT 5.3) | TOTP, remote vault, modals | 13 findings resolved | - |
| v2.0.2 | 2025 | 4x Claude Opus + GPT 5.2 | AeroAgent + AeroFile | 70 findings resolved | A- |
| Mar 2026 | March 2026 | Aikido Security | Full application, automated SAST/SCA/secrets/IaC | Top 5% benchmark, OWASP/ISO 27001/CIS/NIS2/GDPR coverage, 0 open issues | Top 5% |
| Feb 2026 | February 2026 | Aikido Security | Full application, automated | Top 5% benchmark, OWASP Top 10 coverage, 0 open issues | Top 5% |

## v3.1.7 Desktop Security Audit (March 2026)

This March 2026 review focused on four trust boundaries of the desktop application. Later rows in the table above are separate snapshots. They do not replace this write-up, and this write-up is not a review of 4.2.6.

### Findings and Remediation

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Update pipeline without cryptographic artifact verification | High | Remediated: Sigstore client-side verification |
| 2 | Unauthenticated plugin registry with unsandboxed execution | High | Remediated: remote registry disabled (fail-closed) |
| 3 | AI expert/extreme modes allow auto-execution of mutative and credential-backed tools | Medium | Remediated: backend grant system with native OS dialogs |
| 4 | Vault passphrase stored in cleartext on disk by default | Medium | Remediated: OS keyring default with master password fallback |

Seven additional sub-findings (C1-C7) were identified during the external unified audit and all remediated before commit. The most critical (C7) was the `keyring` crate compiled without platform-specific features, which would have caused vault passphrase loss on application restart. Caught during pre-commit impact analysis.

### Methodology

- Static review of Tauri IPC, updater, plugin execution, AI tooling, vault/credential handling, OAuth, and capability model
- Two independent external audits (GPT 5.4 and Claude Opus 4.6) conducted in parallel without coordination
- Unified audit document with convergence matrix and remediation tracker

### Documentation

Full audit documentation is maintained internally in the development roadmap (APPENDIX-L, not published on GitHub).

## Aikido Security Report (March 2026)

An independent automated security assessment by [Aikido Security](https://aikido.dev):

- **Benchmark**: Top 5% of all Aikido customers, Top 10% for code repositories
- **Compliance**: OWASP Top 10, ISO 27001:2022, CIS v8.1, NIS2 Directive, GDPR
- **Open issues**: 0 across all categories (0 critical, 0 high, 0 medium, 0 low)
- **Monitoring**: 1,156 packages (320 JS + 836 Rust), daily scans for dependencies, SAST, secrets, IaC
- **Report**: Available as PDF in the repository (`docs/Security Audit Report axpdev-lab - March 2026.pdf`)

## Aikido Security Report (February 2026)

First automated security assessment by [Aikido Security](https://aikido.dev):

- **Benchmark**: Top 5% of scanned repositories
- **OWASP Top 10**: Full coverage
- **Open issues**: 0 across all categories
- **Report**: Available as PDF in the repository (`docs/Security Audit Report axpnet - February 2026.pdf`)

## Cumulative Statistics

Across all audits:

- **300+ individual findings** identified across the audits in the table
- **P0 and P1 findings recorded in those audits** were marked remediated in the write-ups
- **Grades shown in the table**: A- on the graded rows. This archive does not publish a source for a C+ grade
- The repository [SECURITY.md](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/SECURITY.md) on `aa0e477` still says 7 transport protocols, 25+ native integrations, and 9 audits. Those sentences are behind this archive and the 4.2.6 inventory on [Security Overview](/security/overview)
- The Aikido rows record 0 open issues in February and March 2026. That is not a claim about `main` in November 2026. Accepted RustSec IDs live in `audit.toml`
