# Vulnerability Disclosure

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Report via [GitHub Security Advisories](https://github.com/axpdev-lab/aeroftp/security/advisories/new) or create a private issue.

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

- Report via [GitHub Security Advisories](https://github.com/axpdev-lab/aeroftp/security/advisories/new)
- Allow 48 hours for initial response
- Do not publicly disclose before a fix is released
- One bounty per unique vulnerability

## Security Hall of Fame

We gratefully acknowledge security researchers who help improve AeroFTP:

*No reports yet - be the first!*

## Known Issues

| ID | Component | Severity | Status | Details |
| -- | --------- | -------- | ------ | ------- |
| [CVE-2025-54804](https://github.com/axpdev-lab/aeroftp/security/dependabot/3) | russh (SFTP) | Medium | **Resolved** | Fixed by upgrading to russh v0.57 |
| SEC-001 | Archive passwords | Medium | **Resolved (v1.5.2)** | Passwords now wrapped in SecretString |
| SEC-002 | AI tool parsing | Medium | **Resolved (v1.6.0)** | Native function calling replaces regex parsing |
| SEC-003 | Keep-alive routing | Low | **Resolved (v1.5.1)** | Keep-alive routes correctly per protocol |
| SEC-004 | OAuth token exposure | Medium | **Resolved (v1.5.2)** | Tokens wrapped in SecretString |
