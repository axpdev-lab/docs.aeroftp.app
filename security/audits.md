# Security Audits

AeroFTP undergoes regular independent security audits. This page tracks all audits, their scope, findings, and remediation status.

## Audit History

| Version | Date | Auditors | Scope | Findings | Grade |
| ------- | ---- | -------- | ----- | -------- | ----- |
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

The most recent audit focused on four trust boundaries of the desktop application:

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

- **300+ individual findings** identified across 9 audits
- **All P0 (critical) and P1 (high) findings** remediated
- **Grade trajectory**: C+ (initial) to A- (current)
- **Zero open findings** in the latest audit cycle (Aikido March 2026)
