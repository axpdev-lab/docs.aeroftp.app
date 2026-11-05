# Vulnerability Disclosure

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Report via [GitHub Security Advisories](https://github.com/axpdev-lab/aeroftp/security/advisories/new) or by email to **dev@aeroftp.app**. The same two routes are in the repository [security policy](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/SECURITY.md), last updated 26 October 2026.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Bug Bounty

AeroFTP welcomes responsible disclosure. Researchers who report valid issues will be credited in our Security Hall of Fame.

### In Scope

- AeroFTP desktop application (all platforms)
- AeroVault encryption implementation
- AI tool execution and approval system
- OAuth2 and credential storage
- Update pipeline and Sigstore verification
- CLI security (`aeroftp-cli`)

### Out of Scope

- Social engineering attacks
- Denial of service (DoS)
- Issues in third-party dependencies (report upstream)
- Issues requiring physical access to the device

### Rules

- Report via [GitHub Security Advisories](https://github.com/axpdev-lab/aeroftp/security/advisories/new) or **dev@aeroftp.app**
- Allow 48 hours for initial response
- Do not publicly disclose before a fix is released
- One bounty per unique vulnerability

## Security Hall of Fame

We gratefully acknowledge security researchers who help improve AeroFTP:

*No reports yet - be the first!*

## Known Issues

The russh rows match the repository security policy. `main` at `aa0e477` depends on russh 0.65.1, which is later than the versions named in those resolutions. The policy text that still says the v4.2.5 preparation snapshot pinned russh 0.64.1 is older than that dependency line.

| ID | Component | Severity | Status | Details |
| -- | --------- | -------- | ------ | ------- |
| [CVE-2025-54804](https://github.com/axpdev-lab/aeroftp/security/dependabot/3) | russh (SFTP) | Medium | **Resolved** | Fixed by upgrading to russh 0.57. Current `main` is on 0.65.1 |
| [GHSA-wwx6-x28x-8259](https://github.com/advisories/GHSA-wwx6-x28x-8259) | russh | High | **Resolved** | Upgrade to 0.61.2 in v4.0.5 |
| [GHSA-hpv4-5h6f-wqr3](https://github.com/advisories/GHSA-hpv4-5h6f-wqr3) | russh | Medium | **Resolved** | Same 0.61.2 upgrade |
| [GHSA-g9hv-x236-4qp3](https://github.com/advisories/GHSA-g9hv-x236-4qp3) | russh | Medium | **Resolved** | July 2026 resolution in the repository security policy |
| [GHSA-5xvq-cp9x-6p6r](https://github.com/advisories/GHSA-5xvq-cp9x-6p6r) | russh | Medium | **Resolved** | Same russh upgrade |
| [GHSA-cqjc-rmpq-xprq](https://github.com/advisories/GHSA-cqjc-rmpq-xprq) | russh | Medium | **Resolved** | Same russh upgrade. `serve sftp` exists now, so an older client-only note no longer describes the command surface |
| SEC-001 | Archive passwords | Medium | **Resolved (v1.5.2)** | Passwords wrapped in SecretString |
| SEC-002 | AI tool parsing | Medium | **Resolved (v1.6.0)** | Native function calling replaced regex parsing |
| SEC-003 | Keep-alive routing | Low | **Resolved (v1.5.1)** | Keep-alive routes per protocol |
| SEC-004 | OAuth token exposure | Medium | **Resolved (v1.5.2)** | Tokens wrapped in SecretString |

Accepted advisories that are still ignored, including GHSA-7gmj-67g7-phm9, are not in this table. They are in [`audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/aa0e4774541c8eeafe14b33b0c92427d7621e7d8/src-tauri/.cargo/audit.toml). See [Continuous Audit](./continuous-audit).
