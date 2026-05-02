# Security Overview

AeroFTP is designed with security as a foundational requirement. Every layer of the application follows a defense-in-depth model where multiple independent controls protect against any single point of failure.

## Architecture at a Glance

| Layer | Purpose | Details |
| ----- | ------- | ------- |
| [Credential storage](/security/credentials) | Protect secrets at rest | AES-256-GCM vault, OS keyring, Argon2id KDF, optional TOTP 2FA |
| [Encryption](/security/encryption) | Protect user files and data in transit | AeroVault v2 (AES-256-GCM-SIV), `rclone crypt` interoperability, TLS/SSH, archive encryption |
| [AI tool security](/security/ai-security) | Control AI agent capabilities | Backend grant system, native OS dialogs, tool classification |
| [Supply chain](/security/supply-chain) | Verify software authenticity | Sigstore signing, client-side verification, update helper hardening |
| [Privacy](/security/privacy) | Minimize data footprint | Zero telemetry, local-only storage, memory zeroization |

Each layer operates independently. A compromise in one does not cascade to the others.

## Trust Boundaries

The Rust backend is the security authority. The web frontend can request operations but cannot bypass backend enforcement:

- **Credentials**: The frontend never handles raw passwords or tokens. The backend resolves them from the vault internally.
- **AI tools**: Mutative operations require a cryptographic grant issued and validated by the backend, confirmed via native OS dialogs that the web layer cannot suppress.
- **Updates**: The backend verifies Sigstore bundles before allowing any installation. On Linux, the privileged helper re-verifies SHA-256 before executing package managers.
- **Compatibility crypto**: `rclone crypt` decryption happens locally in the backend so encrypted remotes can be inspected without handing passwords to external services.

## Where AeroFTP Stands

In the landscape of file transfer and cloud management tools, AeroFTP combines protocol breadth (22 protocols) with security depth typically found only in dedicated encryption tools:

- **OpenSSF Best Practices**: 100% passing criteria
- **Aikido Security**: Top 5% benchmark, 0 open issues (March 2026)
- **300+ security findings** identified and resolved across [9 independent audits](/security/audits)
- **Zero unresolved CVEs** in application code

## Reporting Vulnerabilities

Report security issues via [GitHub Security Advisories](https://github.com/axpdev-lab/aeroftp/security/advisories/new). We respond within 48 hours. See the full [disclosure policy and bug bounty program](/security/reporting).
