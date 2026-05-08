# Self-Hosted Continuous Audit

AeroFTP runs its own vulnerability audit pipeline that does not depend on any vendor SaaS. The pipeline aggregates three independent advisory databases and cross-references findings against a documented suppression list with written rationales for every accepted advisory.

The script and the suppression list are part of the repository, run identically on any developer machine and in CI, and produce a self-contained HTML report that any reviewer can verify by re-running the same command.

## Run It Yourself

```bash
git clone https://github.com/axpdev-lab/aeroftp.git
cd aeroftp
npm install
npm run security:report          # generates docs/security/security-report-latest.html
npm run security:report -- --json    # adds machine-readable JSON
npm run security:report -- --open    # opens the report in the default browser
```

The report is published in the repository at [`docs/security/security-report-latest.html`](https://github.com/axpdev-lab/aeroftp/blob/main/docs/security/security-report-latest.html).

## Sources

| Source | Database | Coverage |
| ------ | -------- | -------- |
| `cargo audit` | [RustSec advisory DB](https://rustsec.org/) | Rust crates in `src-tauri/Cargo.lock` |
| `npm audit` | npm registry | Production Node dependencies (`package-lock.json` `--omit=dev`) |
| `osv-scanner` | [Google OSV](https://osv.dev/) | Cross-ecosystem GHSA / CVE / RUSTSEC; catches GHSA-only advisories that do not yet land in RustSec |

The three sources do not fully overlap. `osv-scanner` is the broadest because it cross-references multiple advisory databases, but it does not respect Rust-specific suppression configuration. The script handles that by parsing `src-tauri/.cargo/audit.toml` directly and splitting `osv-scanner` findings into two buckets: **open** (require action) and **suppressed** (require written rationale already present in `audit.toml`).

## Suppression List

Every accepted advisory lives in [`src-tauri/.cargo/audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/.cargo/audit.toml) with an inline rationale. External reviewers (NLnet, OpenSSF, supply-chain auditors, security researchers) can audit each accepted risk inline and either confirm or push back with a specific objection. We do not ignore advisories without a tracked written justification.

The current list (last reviewed 2026-05-08) covers:

- **RUSTSEC-2023-0071** - Marvin attack on RSA decryption: AeroFTP only signs with RSA SSH client keys (RFC 4252) and never decrypts user-supplied RSA ciphertext, so the precondition for Marvin (attacker-observable RSA decrypt oracle) is not reachable. Sigstore RSA path is non-blocking; Fulcio uses ECDSA for signing.
- **GTK3 unmaintained set** (RUSTSEC-2024-0411 through RUSTSEC-2024-0420 + RUSTSEC-2024-0429) - transitive via Tauri's WebKitGTK Linux WebView. Cannot be unilaterally migrated to GTK4: blocks until Tauri ships GTK4-based wry.
- **proc-macro-error 1.0.4** (RUSTSEC-2024-0370) - same transitive Tauri / tray-icon stack.
- **unic-* set** (RUSTSEC-2025-0075/0080/0081/0098/0100) - build-only via `urlpattern` / `tauri-build`. Not in runtime binary.
- **rand 0.7.3** (RUSTSEC-2026-0097) - build-only via `phf_generator` / `kuchikiki` / `tauri-utils`. Not in runtime binary.
- **fxhash 0.2.1** (RUSTSEC-2025-0057) - build-only via `selectors` / `kuchikiki` / `tauri-utils`.
- **glib 0.18.5** (RUSTSEC-2024-0429) - same Tauri WebKitGTK stack.
- **tough 0.21.0** (GHSA-4v58-8p28-2rq3, GHSA-8m7c-8m39-rv4x) - delegated TUF metadata advisories fixed in tough 0.22.0; sigstore 0.13.0 (latest stable on crates.io) requires `tough = ^0.21`. AeroFTP only consumes the official Sigstore public-good TUF root and `verify_sigstore_bundle` is non-blocking (failure degrades to `VerificationMode::Unavailable`, with SHA-256 of the artifact remaining the primary integrity anchor).

## Monthly Results

The same command runs in CI on every push and produces a snapshot tagged with the release version. The table below is the canonical source of truth: when the **Open** column is non-zero, action is required before the next release.

| Month | Version | Open | Suppressed (justified) | Report |
| ----- | ------- | ---- | --------------------- | ------ |
| May 2026 | v3.7.5 | **0** | 25 | [HTML](https://github.com/axpdev-lab/aeroftp/blob/main/docs/security/security-report-latest.html) |

### v3.7.5 highlights (May 2026)

- **Closed CVE-2026-42184 / GHSA-7gmj-67g7-phm9** (Tauri Origin Confusion in IPC, MEDIUM 6.1) via `tauri 2.11.0 → 2.11.1`. Closed Dependabot alert #43.
- **Closed GHSA-xp3w-r5p5-63rr** (openssl, HIGH 8.7) and **GHSA-xv59-967r-8726** (openssl, MEDIUM 5.1) via `openssl 0.10.78 → 0.10.79` (transitive on the native-tls / reqwest / sigstore / oauth2 / tough path).
- **Closed GHSA-2p6r-x3vv-xqm2** (rpassword partial password reveal, LOW 3.8) via `rpassword 7.4.0 → 7.5.2`. The published 7.5.0 fix introduced a glibc-only `__errno_location()` regression that broke macOS compilation; upstream shipped 7.5.1 and 7.5.2 hotfixes that drop the manual errno reset in favour of the standard `io_result()` wrapper. Closed Dependabot alert #44.
- **Two tough 0.21 GHSA advisories** documented in `audit.toml` with full threat-model rationale (see suppression list above).

## Archive

Past Aikido Security audit PDFs are kept in the repository for archival comparison:

- [March 2026 - Aikido Security](https://github.com/axpdev-lab/aeroftp/blob/main/docs/Security%20Audit%20Report%20axpdev-lab%20-%20March%202026.pdf) - Top 5% benchmark, 0 open issues, OWASP / ISO 27001 / CIS / NIS2 / GDPR
- [February 2026 - Aikido Security](https://github.com/axpdev-lab/aeroftp/blob/main/docs/Security%20Audit%20Report%20axpnet%20-%20February%202026.pdf) - Top 5% benchmark, 0 open issues

These reports remain useful as historical evidence but are not produced on a recurring cadence anymore. The self-hosted pipeline above replaces them as the monthly source of truth.

## Why Self-Hosted

Vendor SaaS audits (Aikido, Snyk, Socket, GitHub Dependabot) remain enabled and complement the pipeline above with continuous PR-time scanning, typosquatting detection and AI-driven code review. They are listed in [Continuous Monitoring](./overview.md#continuous-monitoring).

The self-hosted pipeline exists alongside them because:

- **No vendor lock-in.** The pipeline is GPL-3.0 like the rest of AeroFTP and runs against open advisory databases. If any vendor ends a free tier, gates a feature behind paid plans, or rate-limits API access, the audit results stay reproducible from the repository alone.
- **Reviewers can verify, not just trust.** Anyone can clone the repository, run `npm run security:report`, and produce the same numbers. There is no "trust me, the dashboard says zero" step.
- **Suppression rationale is auditable.** `audit.toml` is in the repository under version control; every accepted risk has a written justification reviewers can read inline. SaaS dashboards typically hide the threat-model context behind UI configuration.

## Tooling

- [`cargo audit`](https://github.com/rustsec/rustsec/tree/main/cargo-audit) by RustSec
- [`npm audit`](https://docs.npmjs.com/cli/v10/commands/npm-audit) by npm
- [`osv-scanner`](https://google.github.io/osv-scanner/) by Google
- [`scripts/security-report.cjs`](https://github.com/axpdev-lab/aeroftp/blob/main/scripts/security-report.cjs) - the aggregator script
- [`src-tauri/.cargo/audit.toml`](https://github.com/axpdev-lab/aeroftp/blob/main/src-tauri/.cargo/audit.toml) - the suppression list with written rationales
